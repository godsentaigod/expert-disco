/**
 * Integration Hub - Manages connections to external services and APIs
 * Handles: Social media APIs, Email services, Analytics, Payment processors, AI models
 */

export interface IntegrationConfig {
  id: string;
  name: string;
  type: "social_media" | "email" | "analytics" | "payment" | "ai_model" | "communication";
  status: "connected" | "disconnected" | "error";
  credentials?: Record<string, string>;
  lastSync?: Date;
  errorMessage?: string;
}

export interface IntegrationEvent {
  integrationId: string;
  eventType: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export class IntegrationHub {
  private integrations: Map<string, IntegrationConfig> = new Map();
  private listeners: Map<string, ((event: IntegrationEvent) => void)[]> = new Map();

  /**
   * Register a new integration
   */
  registerIntegration(config: IntegrationConfig): void {
    this.integrations.set(config.id, config);
    console.log(`[IntegrationHub] Registered integration: ${config.name}`);
  }

  /**
   * Connect to an external service
   */
  async connect(integrationId: string, credentials: Record<string, string>): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    try {
      integration.credentials = credentials;
      integration.status = "connected";
      integration.lastSync = new Date();
      this.emit(integrationId, "connected", { timestamp: new Date() });
      console.log(`[IntegrationHub] Connected to ${integration.name}`);
      return true;
    } catch (error) {
      integration.status = "error";
      integration.errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.emit(integrationId, "error", { error: integration.errorMessage });
      return false;
    }
  }

  /**
   * Disconnect from an external service
   */
  async disconnect(integrationId: string): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    integration.status = "disconnected";
    integration.credentials = undefined;
    this.emit(integrationId, "disconnected", { timestamp: new Date() });
    console.log(`[IntegrationHub] Disconnected from ${integration.name}`);
    return true;
  }

  /**
   * Get all integrations
   */
  getIntegrations(): IntegrationConfig[] {
    return Array.from(this.integrations.values());
  }

  /**
   * Get a specific integration
   */
  getIntegration(integrationId: string): IntegrationConfig | undefined {
    return this.integrations.get(integrationId);
  }

  /**
   * Check if an integration is connected
   */
  isConnected(integrationId: string): boolean {
    const integration = this.integrations.get(integrationId);
    return integration?.status === "connected";
  }

  /**
   * Call an external API through an integration
   */
  async callAPI(
    integrationId: string,
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    data?: Record<string, unknown>
  ): Promise<unknown> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    if (!this.isConnected(integrationId)) {
      throw new Error(`Integration ${integration.name} is not connected`);
    }

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...this.buildAuthHeaders(integration),
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.emit(integrationId, "api_call", { endpoint, method, status: response.status });
      return result;
    } catch (error) {
      integration.status = "error";
      integration.errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.emit(integrationId, "error", { error: integration.errorMessage });
      throw error;
    }
  }

  /**
   * Build authentication headers based on integration type
   */
  private buildAuthHeaders(integration: IntegrationConfig): Record<string, string> {
    if (!integration.credentials) {
      return {};
    }

    switch (integration.type) {
      case "social_media":
        return {
          Authorization: `Bearer ${integration.credentials.accessToken}`,
        };
      case "email":
        return {
          "X-API-Key": integration.credentials.apiKey,
        };
      case "analytics":
        return {
          Authorization: `Bearer ${integration.credentials.token}`,
        };
      case "payment":
        return {
          Authorization: `Bearer ${integration.credentials.secretKey}`,
        };
      case "ai_model":
        return {
          "X-API-Key": integration.credentials.apiKey,
        };
      case "communication":
        return {
          Authorization: `Bearer ${integration.credentials.token}`,
        };
      default:
        return {};
    }
  }

  /**
   * Subscribe to integration events
   */
  on(integrationId: string, callback: (event: IntegrationEvent) => void): void {
    if (!this.listeners.has(integrationId)) {
      this.listeners.set(integrationId, []);
    }
    this.listeners.get(integrationId)!.push(callback);
  }

  /**
   * Emit an integration event
   */
  private emit(integrationId: string, eventType: string, data: Record<string, unknown>): void {
    const event: IntegrationEvent = {
      integrationId,
      eventType,
      data,
      timestamp: new Date(),
    };

    const callbacks = this.listeners.get(integrationId) || [];
    callbacks.forEach((callback) => callback(event));
  }

  /**
   * Get integration status summary
   */
  getStatusSummary(): {
    total: number;
    connected: number;
    disconnected: number;
    errors: number;
  } {
    const integrations = Array.from(this.integrations.values());
    return {
      total: integrations.length,
      connected: integrations.filter((i) => i.status === "connected").length,
      disconnected: integrations.filter((i) => i.status === "disconnected").length,
      errors: integrations.filter((i) => i.status === "error").length,
    };
  }
}

// Pre-configured integrations
export const DEFAULT_INTEGRATIONS: IntegrationConfig[] = [
  {
    id: "twitter",
    name: "Twitter/X",
    type: "social_media",
    status: "disconnected",
  },
  {
    id: "tiktok",
    name: "TikTok",
    type: "social_media",
    status: "disconnected",
  },
  {
    id: "instagram",
    name: "Instagram",
    type: "social_media",
    status: "disconnected",
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    type: "email",
    status: "disconnected",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    type: "email",
    status: "disconnected",
  },
  {
    id: "google_analytics",
    name: "Google Analytics",
    type: "analytics",
    status: "disconnected",
  },
  {
    id: "stripe",
    name: "Stripe",
    type: "payment",
    status: "disconnected",
  },
  {
    id: "openai",
    name: "OpenAI",
    type: "ai_model",
    status: "disconnected",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    type: "ai_model",
    status: "disconnected",
  },
  {
    id: "slack",
    name: "Slack",
    type: "communication",
    status: "disconnected",
  },
  {
    id: "discord",
    name: "Discord",
    type: "communication",
    status: "disconnected",
  },
];

// Singleton instance
export const integrationHub = new IntegrationHub();
DEFAULT_INTEGRATIONS.forEach((config) => integrationHub.registerIntegration(config));
