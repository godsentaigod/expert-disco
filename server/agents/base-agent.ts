/**
 * Base Agent class - foundation for all AI agents
 */

import { EventEmitter } from "events";
import type {
  AgentRole,
  AgentMessage,
  AgentTask,
  AgentState,
  AgentReport,
  AgentCapability,
} from "./types";

export abstract class BaseAgent extends EventEmitter {
  protected role: AgentRole;
  protected status: "idle" | "working" | "waiting" | "error" | "offline" = "idle";
  protected tasksCompleted: number = 0;
  protected tasksFailed: number = 0;
  protected currentTask?: AgentTask;
  protected capabilities: Map<string, AgentCapability> = new Map();
  protected integrations: string[] = [];
  protected configuration: Record<string, any> = {};
  protected messageQueue: AgentMessage[] = [];
  protected lastActive: Date = new Date();

  constructor(role: AgentRole) {
    super();
    this.role = role;
    this.initializeCapabilities();
  }

  /**
   * Initialize agent capabilities - override in subclasses
   */
  protected abstract initializeCapabilities(): void;

  /**
   * Execute a task
   */
  async executeTask(task: AgentTask): Promise<void> {
    try {
      this.currentTask = task;
      this.status = "working";
      this.emit("task-started", task);

      // Implement task execution logic in subclasses
      await this.performTask(task);

      this.tasksCompleted++;
      this.status = "idle";
      this.emit("task-completed", task);
    } catch (error) {
      this.tasksFailed++;
      this.status = "error";
      this.emit("task-failed", { task, error });
    } finally {
      this.currentTask = undefined;
      this.lastActive = new Date();
    }
  }

  /**
   * Perform the actual task - override in subclasses
   */
  protected abstract performTask(task: AgentTask): Promise<void>;

  /**
   * Process incoming message
   */
  async processMessage(message: AgentMessage): Promise<void> {
    this.messageQueue.push(message);
    this.emit("message-received", message);

    if (message.to === this.role || message.to === "user") {
      await this.handleMessage(message);
    }
  }

  /**
   * Handle message - override in subclasses
   */
  protected abstract handleMessage(message: AgentMessage): Promise<void>;

  /**
   * Send message to another agent or user
   */
  protected async sendMessage(
    to: AgentRole | "user",
    type: string,
    subject: string,
    content: string,
    data?: Record<string, any>
  ): Promise<AgentMessage> {
    const message: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      from: this.role,
      to,
      type: type as any,
      subject,
      content,
      data,
      timestamp: new Date(),
      priority: "normal",
    };

    this.emit("message-sent", message);
    return message;
  }

  /**
   * Get agent state
   */
  getState(): AgentState {
    return {
      role: this.role,
      status: this.status,
      lastActive: this.lastActive,
      tasksCompleted: this.tasksCompleted,
      tasksFailed: this.tasksFailed,
      currentTask: this.currentTask?.id,
      capabilities: Array.from(this.capabilities.keys()),
      integrations: this.integrations,
      configuration: this.configuration,
    };
  }

  /**
   * Generate report
   */
  generateReport(): AgentReport {
    return {
      id: `report-${Date.now()}`,
      agentRole: this.role,
      timestamp: new Date(),
      status: this.status,
      tasksCompleted: this.tasksCompleted,
      tasksFailed: this.tasksFailed,
      metrics: {
        successRate: this.tasksCompleted / (this.tasksCompleted + this.tasksFailed) || 0,
        tasksProcessed: this.tasksCompleted + this.tasksFailed,
      },
      insights: [],
      recommendations: [],
      alerts: [],
    };
  }

  /**
   * Configure agent
   */
  configure(config: Record<string, any>): void {
    this.configuration = { ...this.configuration, ...config };
    this.emit("configured", config);
  }

  /**
   * Add integration
   */
  addIntegration(integrationId: string): void {
    if (!this.integrations.includes(integrationId)) {
      this.integrations.push(integrationId);
      this.emit("integration-added", integrationId);
    }
  }

  /**
   * Remove integration
   */
  removeIntegration(integrationId: string): void {
    this.integrations = this.integrations.filter((id) => id !== integrationId);
    this.emit("integration-removed", integrationId);
  }

  /**
   * Get capabilities
   */
  getCapabilities(): AgentCapability[] {
    return Array.from(this.capabilities.values());
  }

  /**
   * Register capability
   */
  protected registerCapability(name: string, capability: AgentCapability): void {
    this.capabilities.set(name, capability);
  }

  /**
   * Shutdown agent
   */
  async shutdown(): Promise<void> {
    this.status = "offline";
    this.removeAllListeners();
    this.emit("shutdown");
  }

  /**
   * Get role
   */
  getRole(): AgentRole {
    return this.role;
  }

  /**
   * Get status
   */
  getStatus() {
    return this.status;
  }

  /**
   * Set status
   */
  setStatus(status: "idle" | "working" | "waiting" | "error" | "offline"): void {
    this.status = status;
    this.emit("status-changed", status);
  }
}
