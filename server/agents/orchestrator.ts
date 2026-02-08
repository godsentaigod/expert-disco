/**
 * Agent Orchestrator - manages all agents and their communication
 */

import { EventEmitter } from "events";
import type {
  AgentRole,
  AgentMessage,
  AgentTask,
  Workflow,
  TaskStatus,
} from "./types";
import { BaseAgent } from "./base-agent";

export class AgentOrchestrator extends EventEmitter {
  private agents: Map<AgentRole, BaseAgent> = new Map();
  private messageQueue: AgentMessage[] = [];
  private taskQueue: AgentTask[] = [];
  private workflows: Map<string, Workflow> = new Map();
  private userMessages: AgentMessage[] = [];

  /**
   * Register an agent
   */
  registerAgent(agent: BaseAgent): void {
    const role = agent.getRole();
    this.agents.set(role, agent);

    // Listen to agent events
    agent.on("message-sent", (message: AgentMessage) => {
      this.routeMessage(message);
    });

    agent.on("task-completed", (task: AgentTask) => {
      this.emit("task-completed", task);
    });

    agent.on("task-failed", (data: any) => {
      this.emit("task-failed", data);
    });

    this.emit("agent-registered", role);
  }

  /**
   * Route message to destination
   */
  private async routeMessage(message: AgentMessage): Promise<void> {
    this.messageQueue.push(message);

    if (message.to === "user") {
      // Message for user - store separately
      this.userMessages.push(message);
      this.emit("user-message", message);
    } else {
      // Message for another agent
      const targetAgent = this.agents.get(message.to);
      if (targetAgent) {
        await targetAgent.processMessage(message);
      }
    }
  }

  /**
   * Assign task to agent
   */
  async assignTask(task: AgentTask): Promise<void> {
    this.taskQueue.push(task);
    const agent = this.agents.get(task.agentRole);

    if (agent) {
      await agent.executeTask(task);
    } else {
      this.emit("error", `Agent ${task.agentRole} not found`);
    }
  }

  /**
   * Create and execute workflow
   */
  async executeWorkflow(workflow: Workflow): Promise<void> {
    this.workflows.set(workflow.id, workflow);
    this.emit("workflow-started", workflow);

    try {
      for (const task of workflow.tasks) {
        await this.assignTask(task);

        // Wait for task completion if semi-auto
        if (workflow.automationLevel === "semi-auto") {
          await this.waitForTaskCompletion(task.id);
        }
      }

      workflow.status = "completed";
      workflow.completedAt = new Date();
      this.emit("workflow-completed", workflow);
    } catch (error) {
      workflow.status = "failed";
      this.emit("workflow-failed", { workflow, error });
    }
  }

  /**
   * Wait for task completion
   */
  private waitForTaskCompletion(taskId: string): Promise<void> {
    return new Promise((resolve) => {
      const checkCompletion = () => {
        const task = this.taskQueue.find((t) => t.id === taskId);
        if (task && (task.status === "completed" || task.status === "failed")) {
          resolve();
        } else {
          setTimeout(checkCompletion, 100);
        }
      };
      checkCompletion();
    });
  }

  /**
   * Get all agents
   */
  getAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent by role
   */
  getAgent(role: AgentRole): BaseAgent | undefined {
    return this.agents.get(role);
  }

  /**
   * Get all agent states
   */
  getAllAgentStates() {
    const states: Record<AgentRole, any> = {} as any;
    this.agents.forEach((agent, role) => {
      states[role] = agent.getState();
    });
    return states;
  }

  /**
   * Get all agent reports
   */
  getAllAgentReports() {
    const reports: any[] = [];
    this.agents.forEach((agent) => {
      reports.push(agent.generateReport());
    });
    return reports;
  }

  /**
   * Get message history
   */
  getMessageHistory(limit: number = 100): AgentMessage[] {
    return this.messageQueue.slice(-limit);
  }

  /**
   * Get user messages
   */
  getUserMessages(limit: number = 100): AgentMessage[] {
    return this.userMessages.slice(-limit);
  }

  /**
   * Get task queue
   */
  getTaskQueue(): AgentTask[] {
    return [...this.taskQueue];
  }

  /**
   * Get workflow
   */
  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: string, status: TaskStatus): void {
    const task = this.taskQueue.find((t) => t.id === taskId);
    if (task) {
      task.status = status;
      this.emit("task-status-updated", { taskId, status });
    }
  }

  /**
   * Approve task
   */
  approveTask(taskId: string, approvedBy: string): void {
    const task = this.taskQueue.find((t) => t.id === taskId);
    if (task) {
      task.status = "approved";
      this.emit("task-approved", { taskId, approvedBy });
    }
  }

  /**
   * Reject task
   */
  rejectTask(taskId: string, rejectedBy: string, reason: string): void {
    const task = this.taskQueue.find((t) => t.id === taskId);
    if (task) {
      task.status = "rejected";
      this.emit("task-rejected", { taskId, rejectedBy, reason });
    }
  }

  /**
   * Send direct message from user to agent
   */
  async sendUserMessage(
    to: AgentRole,
    content: string,
    requiresApproval: boolean = false
  ): Promise<AgentMessage> {
    const message: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      from: "management", // User messages come through management
      to,
      type: "command",
      subject: "User Command",
      content,
      timestamp: new Date(),
      priority: "high",
      requiresApproval,
    };

    await this.routeMessage(message);
    return message;
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    return {
      agentsCount: this.agents.size,
      activeAgents: Array.from(this.agents.values()).filter(
        (a) => a.getStatus() !== "offline"
      ).length,
      taskQueueLength: this.taskQueue.length,
      messageQueueLength: this.messageQueue.length,
      workflowsCount: this.workflows.size,
      timestamp: new Date(),
    };
  }

  /**
   * Shutdown all agents
   */
  async shutdown(): Promise<void> {
    const agentsArray = Array.from(this.agents.values());
    for (const agent of agentsArray) {
      await agent.shutdown();
    }
    this.agents.clear();
    this.emit("shutdown");
  }
}

// Singleton instance
let orchestratorInstance: AgentOrchestrator | null = null;

export function getOrchestrator(): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator();
  }
  return orchestratorInstance;
}
