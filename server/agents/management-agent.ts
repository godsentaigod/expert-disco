/**
 * Management Agent - coordinates all agents and reports to user
 */

import { BaseAgent } from "./base-agent";
import type { AgentMessage, AgentTask, AgentCapability } from "./types";

export class ManagementAgent extends BaseAgent {
  private subordinateAgents: string[] = [];
  private approvalQueue: AgentMessage[] = [];
  private userNotifications: AgentMessage[] = [];

  constructor() {
    super("management");
  }

  /**
   * Initialize capabilities
   */
  protected initializeCapabilities(): void {
    this.registerCapability("orchestrate-agents", {
      name: "orchestrate-agents",
      description: "Coordinate and manage all agents",
      requiredIntegrations: [],
      parameters: {},
      outputFormat: "json",
    });

    this.registerCapability("handle-approvals", {
      name: "handle-approvals",
      description: "Manage approval workflows",
      requiredIntegrations: [],
      parameters: {},
      outputFormat: "json",
    });

    this.registerCapability("generate-reports", {
      name: "generate-reports",
      description: "Generate system reports",
      requiredIntegrations: [],
      parameters: {},
      outputFormat: "json",
    });

    this.registerCapability("route-messages", {
      name: "route-messages",
      description: "Route messages between agents",
      requiredIntegrations: [],
      parameters: {},
      outputFormat: "json",
    });

    this.registerCapability("escalate-to-user", {
      name: "escalate-to-user",
      description: "Escalate important messages to user",
      requiredIntegrations: [],
      parameters: {},
      outputFormat: "json",
    });
  }

  /**
   * Perform task - management tasks
   */
  protected async performTask(task: AgentTask): Promise<void> {
    switch (task.title) {
      case "generate-report":
        await this.generateSystemReport();
        break;
      case "check-approvals":
        await this.checkApprovals();
        break;
      case "coordinate-agents":
        await this.coordinateAgents();
        break;
      case "escalate-issues":
        await this.escalateIssues();
        break;
      default:
        throw new Error(`Unknown management task: ${task.title}`);
    }
  }

  /**
   * Handle incoming message
   */
  protected async handleMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case "report":
        await this.processReport(message);
        break;
      case "alert":
        await this.processAlert(message);
        break;
      case "query":
        await this.processQuery(message);
        break;
      case "command":
        await this.processCommand(message);
        break;
      default:
        // Default handling
        break;
    }
  }

  /**
   * Process report from subordinate agent
   */
  private async processReport(message: AgentMessage): Promise<void> {
    // Analyze report and determine if escalation needed
    if (message.priority === "critical") {
      await this.escalateToUser(message);
    }
  }

  /**
   * Process alert from subordinate agent
   */
  private async processAlert(message: AgentMessage): Promise<void> {
    if (message.priority === "critical" || message.priority === "high") {
      await this.escalateToUser(message);
    }
  }

  /**
   * Process query from subordinate agent
   */
  private async processQuery(message: AgentMessage): Promise<void> {
    // Route query to appropriate agent or handle directly
    const response = await this.sendMessage(
      message.from,
      "response",
      `Response to: ${message.subject}`,
      "Processing your query..."
    );
  }

  /**
   * Process command from user
   */
  private async processCommand(message: AgentMessage): Promise<void> {
    // Parse command and route to appropriate agent
    const commandText = message.content.toLowerCase();

    if (commandText.includes("report")) {
      await this.generateSystemReport();
    } else if (commandText.includes("approve")) {
      await this.checkApprovals();
    } else if (commandText.includes("status")) {
      await this.sendMessage(
        "user",
        "response",
        "System Status",
        this.getSystemStatus()
      );
    }
  }

  /**
   * Generate system report
   */
  private async generateSystemReport(): Promise<void> {
    const report = {
      timestamp: new Date(),
      agentsActive: this.subordinateAgents.length,
      pendingApprovals: this.approvalQueue.length,
      systemHealth: "operational",
    };

    await this.sendMessage(
      "user",
      "report",
      "System Report",
      JSON.stringify(report, null, 2)
    );
  }

  /**
   * Check for pending approvals
   */
  private async checkApprovals(): Promise<void> {
    if (this.approvalQueue.length === 0) {
      await this.sendMessage(
        "user",
        "response",
        "Approval Queue Status",
        "No pending approvals"
      );
      return;
    }

    const approvalSummary = this.approvalQueue
      .map((msg) => `- ${msg.subject} from ${msg.from}`)
      .join("\n");

    await this.sendMessage(
      "user",
      "response",
      "Pending Approvals",
      approvalSummary
    );
  }

  /**
   * Coordinate agents
   */
  private async coordinateAgents(): Promise<void> {
    // Implement agent coordination logic
  }

  /**
   * Escalate issues to user
   */
  private async escalateIssues(): Promise<void> {
    // Find critical issues and escalate
  }

  /**
   * Escalate message to user
   */
  private async escalateToUser(message: AgentMessage): Promise<void> {
    this.userNotifications.push(message);
    await this.sendMessage(
      "user",
      "alert",
      `ESCALATION: ${message.subject}`,
      message.content,
      message.data
    );
  }

  /**
   * Register subordinate agent
   */
  registerSubordinateAgent(agentRole: string): void {
    if (!this.subordinateAgents.includes(agentRole)) {
      this.subordinateAgents.push(agentRole);
    }
  }

  /**
   * Add message to approval queue
   */
  addToApprovalQueue(message: AgentMessage): void {
    if (message.requiresApproval) {
      this.approvalQueue.push(message);
      this.escalateToUser(message);
    }
  }

  /**
   * Approve message
   */
  approveMessage(messageId: string, approvedBy: string): void {
    const index = this.approvalQueue.findIndex((msg) => msg.id === messageId);
    if (index !== -1) {
      const message = this.approvalQueue[index];
      message.approvedBy = approvedBy;
      message.approvalTime = new Date();
      this.approvalQueue.splice(index, 1);
    }
  }

  /**
   * Reject message
   */
  rejectMessage(messageId: string, rejectedBy: string): void {
    const index = this.approvalQueue.findIndex((msg) => msg.id === messageId);
    if (index !== -1) {
      this.approvalQueue.splice(index, 1);
    }
  }

  /**
   * Get system status
   */
  private getSystemStatus(): string {
    return `
System Status Report
====================
Active Agents: ${this.subordinateAgents.length}
Pending Approvals: ${this.approvalQueue.length}
User Notifications: ${this.userNotifications.length}
Status: ${this.status}
Last Active: ${this.lastActive.toISOString()}
    `.trim();
  }

  /**
   * Get user notifications
   */
  getUserNotifications(limit: number = 50): AgentMessage[] {
    return this.userNotifications.slice(-limit);
  }

  /**
   * Clear user notifications
   */
  clearUserNotifications(): void {
    this.userNotifications = [];
  }

  /**
   * Get approval queue
   */
  getApprovalQueue(): AgentMessage[] {
    return [...this.approvalQueue];
  }
}
