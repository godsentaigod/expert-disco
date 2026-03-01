/**
 * Integration Routers
 * Combines all integration modules (Proton Email, SMS Forwarding)
 */

import { router } from "./_core/trpc";
import { protonEmailRouter } from "./integrations/proton-email";
import { smsForwardingRouter } from "./integrations/sms-forwarding";

export const integrationsRouter = router({
  protonEmail: protonEmailRouter,
  smsForwarding: smsForwardingRouter,
});
