import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

/**
 * SMS Forwarding Integration
 * Allows agents to receive SMS verification codes from a forwarded phone number
 * SMS messages are captured and made available to agents in real-time
 */

interface ForwardedSMS {
  id: string;
  from: string;
  body: string;
  receivedAt: Date;
  verificationCode?: string;
  service?: string; // e.g., "Twitter", "LinkedIn", "Reddit"
}

interface SMSForwardingConfig {
  forwardingPhoneNumber: string;
  agentPhoneNumber: string;
  verificationCodePattern: RegExp;
  servicePatterns: Record<string, RegExp>;
}

// SMS forwarding configuration
const smsConfig: SMSForwardingConfig = {
  forwardingPhoneNumber: process.env.FORWARDING_PHONE_NUMBER || "",
  agentPhoneNumber: process.env.AGENT_PHONE_NUMBER || "",
  verificationCodePattern: /(\d{4,8})/g,
  servicePatterns: {
    twitter: /twitter/i,
    linkedin: /linkedin/i,
    reddit: /reddit/i,
    producthunt: /producthunt|product hunt/i,
    indiehackers: /indiehackers|indie hackers/i,
  },
};

// In-memory storage for forwarded SMS (replace with database in production)
const forwardedSMS: Map<string, ForwardedSMS[]> = new Map();

/**
 * Extract verification code from SMS body
 */
function extractVerificationCode(smsBody: string): string | undefined {
  const match = smsBody.match(smsConfig.verificationCodePattern);
  if (match) {
    return match[0];
  }
  return undefined;
}

/**
 * Detect which service the SMS is from
 */
function detectService(smsBody: string): string | undefined {
  for (const [service, pattern] of Object.entries(smsConfig.servicePatterns)) {
    if (pattern.test(smsBody)) {
      return service;
    }
  }
  return undefined;
}

/**
 * Parse SMS for verification information
 */
function parseSMSForVerification(sms: ForwardedSMS): ForwardedSMS {
  const verificationCode = extractVerificationCode(sms.body);
  const service = detectService(sms.body);

  return {
    ...sms,
    verificationCode,
    service,
  };
}

/**
 * Simulate receiving forwarded SMS
 * In production, this would be a webhook from Twilio or similar service
 */
export async function receiveForwardedSMS(sms: ForwardedSMS): Promise<void> {
  const parsedSMS = parseSMSForVerification(sms);

  const agentSMS = forwardedSMS.get(smsConfig.agentPhoneNumber) || [];
  agentSMS.push(parsedSMS);
  forwardedSMS.set(smsConfig.agentPhoneNumber, agentSMS);

  console.log(`[SMS Forwarding] Received SMS from ${sms.from}`);
  if (parsedSMS.verificationCode) {
    console.log(
      `[SMS Forwarding] Extracted verification code: ${parsedSMS.verificationCode}`
    );
  }
  if (parsedSMS.service) {
    console.log(`[SMS Forwarding] Detected service: ${parsedSMS.service}`);
  }
}

/**
 * tRPC Router for SMS Forwarding Integration
 */
export const smsForwardingRouter = router({
  /**
   * Get all forwarded SMS messages
   */
  getForwardedSMS: protectedProcedure.query(async ({ ctx }) => {
    const messages = forwardedSMS.get(smsConfig.agentPhoneNumber) || [];
    return {
      count: messages.length,
      messages: messages.map((sms) => ({
        id: sms.id,
        from: sms.from,
        body: sms.body,
        receivedAt: sms.receivedAt,
        verificationCode: sms.verificationCode,
        service: sms.service,
      })),
    };
  }),

  /**
   * Get latest verification code from SMS
   */
  getLatestVerificationCode: protectedProcedure
    .input(z.object({ service: z.string().optional() }))
    .query(async ({ input }) => {
      const messages = forwardedSMS.get(smsConfig.agentPhoneNumber) || [];

      // Filter by service if specified
      let filtered = messages;
      if (input.service) {
        filtered = messages.filter((sms) =>
          sms.service?.toLowerCase().includes(input.service!.toLowerCase())
        );
      }

      // Get most recent SMS with verification code
      const smsWithCode = filtered
        .filter((sms) => sms.verificationCode)
        .sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime())[0];

      return {
        found: !!smsWithCode,
        code: smsWithCode?.verificationCode,
        from: smsWithCode?.from,
        service: smsWithCode?.service,
        receivedAt: smsWithCode?.receivedAt,
      };
    }),

  /**
   * Get SMS by service
   */
  getSMSByService: protectedProcedure
    .input(z.object({ service: z.string() }))
    .query(async ({ input }) => {
      const messages = forwardedSMS.get(smsConfig.agentPhoneNumber) || [];
      const serviceMessages = messages.filter((sms) =>
        sms.service?.toLowerCase().includes(input.service.toLowerCase())
      );

      return {
        service: input.service,
        count: serviceMessages.length,
        messages: serviceMessages.map((sms) => ({
          id: sms.id,
          from: sms.from,
          body: sms.body,
          verificationCode: sms.verificationCode,
          receivedAt: sms.receivedAt,
        })),
      };
    }),

  /**
   * Mark SMS as used (for tracking)
   */
  markSMSAsUsed: protectedProcedure
    .input(z.object({ smsId: z.string() }))
    .mutation(async ({ input }) => {
      const messages = forwardedSMS.get(smsConfig.agentPhoneNumber) || [];
      const sms = messages.find((s) => s.id === input.smsId);

      if (sms) {
        sms.body = `[USED] ${sms.body}`;
        return { success: true };
      }

      return { success: false, error: "SMS not found" };
    }),

  /**
   * Clear old SMS (older than 24 hours)
   */
  clearOldSMS: protectedProcedure.mutation(async () => {
    const messages = forwardedSMS.get(smsConfig.agentPhoneNumber) || [];
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const filtered = messages.filter((sms) => sms.receivedAt > oneDayAgo);
    forwardedSMS.set(smsConfig.agentPhoneNumber, filtered);

    return {
      removed: messages.length - filtered.length,
      remaining: filtered.length,
    };
  }),

  /**
   * Get SMS statistics
   */
  getStatistics: protectedProcedure.query(async () => {
    const messages = forwardedSMS.get(smsConfig.agentPhoneNumber) || [];

    const byService: Record<string, number> = {};
    messages.forEach((sms) => {
      if (sms.service) {
        byService[sms.service] = (byService[sms.service] || 0) + 1;
      }
    });

    return {
      totalSMS: messages.length,
      withVerificationCodes: messages.filter((s) => s.verificationCode).length,
      byService,
      oldestMessage: messages.length > 0 ? messages[0].receivedAt : null,
      newestMessage:
        messages.length > 0
          ? messages[messages.length - 1].receivedAt
          : null,
    };
  }),
});
