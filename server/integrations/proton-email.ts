import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

/**
 * Proton Email Forwarding Integration
 * Allows agents to access forwarded emails from a Proton account
 * Emails are forwarded to agents' inboxes for account verification
 */

interface ForwardedEmail {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: Date;
  verificationCode?: string;
}

interface ProtonEmailConfig {
  forwardingEmail: string;
  agentInbox: string;
  verificationCodePattern: RegExp;
}

// Proton email configuration
const protonConfig: ProtonEmailConfig = {
  forwardingEmail: process.env.PROTON_FORWARDING_EMAIL || "",
  agentInbox: process.env.AGENT_EMAIL_INBOX || "",
  verificationCodePattern: /(?:code|verify|confirm)[\s:]*(\d{4,8})/gi,
};

// In-memory storage for forwarded emails (replace with database in production)
const forwardedEmails: Map<string, ForwardedEmail[]> = new Map();

/**
 * Extract verification code from email body
 */
function extractVerificationCode(emailBody: string): string | undefined {
  const match = emailBody.match(protonConfig.verificationCodePattern);
  if (match && match[1]) {
    return match[1];
  }
  return undefined;
}

/**
 * Parse email for verification information
 */
function parseEmailForVerification(email: ForwardedEmail): ForwardedEmail {
  const verificationCode = extractVerificationCode(email.body);
  return {
    ...email,
    verificationCode,
  };
}

/**
 * Simulate receiving forwarded email from Proton
 * In production, this would be a webhook from Proton
 */
export async function receiveForwardedEmail(email: ForwardedEmail): Promise<void> {
  const parsedEmail = parseEmailForVerification(email);
  
  const agentEmails = forwardedEmails.get(protonConfig.agentInbox) || [];
  agentEmails.push(parsedEmail);
  forwardedEmails.set(protonConfig.agentInbox, agentEmails);
  
  console.log(`[Proton Email] Received email from ${email.from}: ${email.subject}`);
  if (parsedEmail.verificationCode) {
    console.log(`[Proton Email] Extracted verification code: ${parsedEmail.verificationCode}`);
  }
}

/**
 * tRPC Router for Proton Email Integration
 */
export const protonEmailRouter = router({
  /**
   * Get all forwarded emails for the agent
   */
  getForwardedEmails: protectedProcedure
    .query(async ({ ctx }) => {
      const emails = forwardedEmails.get(protonConfig.agentInbox) || [];
      return {
        count: emails.length,
        emails: emails.map((email) => ({
          id: email.id,
          from: email.from,
          subject: email.subject,
          receivedAt: email.receivedAt,
          verificationCode: email.verificationCode,
        })),
      };
    }),

  /**
   * Get latest verification code from emails
   */
  getLatestVerificationCode: protectedProcedure
    .input(z.object({ fromDomain: z.string().optional() }))
    .query(async ({ input }) => {
      const emails = forwardedEmails.get(protonConfig.agentInbox) || [];
      
      // Filter by domain if specified
      let filtered = emails;
      if (input.fromDomain) {
        filtered = emails.filter((email) =>
          email.from.includes(input.fromDomain!)
        );
      }

      // Get most recent email with verification code
      const emailWithCode = filtered
        .filter((email) => email.verificationCode)
        .sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime())[0];

      return {
        found: !!emailWithCode,
        code: emailWithCode?.verificationCode,
        from: emailWithCode?.from,
        subject: emailWithCode?.subject,
        receivedAt: emailWithCode?.receivedAt,
      };
    }),

  /**
   * Mark email as used (for tracking)
   */
  markEmailAsUsed: protectedProcedure
    .input(z.object({ emailId: z.string() }))
    .mutation(async ({ input }) => {
      const emails = forwardedEmails.get(protonConfig.agentInbox) || [];
      const email = emails.find((e) => e.id === input.emailId);
      
      if (email) {
        email.body = `[USED] ${email.body}`;
        return { success: true };
      }
      
      return { success: false, error: "Email not found" };
    }),

  /**
   * Clear old emails (older than 24 hours)
   */
  clearOldEmails: protectedProcedure
    .mutation(async () => {
      const emails = forwardedEmails.get(protonConfig.agentInbox) || [];
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const filtered = emails.filter((email) => email.receivedAt > oneDayAgo);
      forwardedEmails.set(protonConfig.agentInbox, filtered);

      return {
        removed: emails.length - filtered.length,
        remaining: filtered.length,
      };
    }),
});
