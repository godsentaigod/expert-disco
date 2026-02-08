/**
 * tRPC Routers for Agent Operations
 * Exposes agent functionality to the frontend
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { AgentOrchestrator } from "./orchestrator";
import { integrationHub } from "./integration-hub";
import type { AgentTask, Workflow } from "./types";

// Initialize orchestrator
const orchestrator = new AgentOrchestrator();

export const agentRouter = router({
  /**
   * Get all agents status
   */
  getAgents: publicProcedure.query(() => {
    return orchestrator.getAgents();
  }),

  /**
   * Get a specific agent status
   */
  getAgent: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(({ input }) => {
      const agents = orchestrator.getAgents();
      return agents.find((a) => a.getRole() === input.agentId);
    }),

  /**
   * Send a message to an agent
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        message: z.string(),
        directToUser: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        agentId: input.agentId,
        message: input.message,
        timestamp: new Date(),
        directToUser: input.directToUser || false,
      };
    }),

  /**
   * Create a new task for an agent
   */
  createTask: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        title: z.string(),
        description: z.string(),
        priority: z.enum(["low", "normal", "high", "critical"]).optional(),
        deadline: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const task: AgentTask = {
        id: `task-${Date.now()}`,
        agentRole: input.agentId as any,
        title: input.title,
        description: input.description,
        priority: (input.priority || "normal") as any,
        status: "pending",
        createdBy: ctx.user?.id ? ("user" as const) : ("user" as const),
        createdAt: new Date(),
        dueDate: input.deadline,
      };

      await orchestrator.assignTask(task);
      return task;
    }),

  /**
   * Get agent tasks
   */
  getTasks: publicProcedure
    .input(z.object({ agentId: z.string().optional() }))
    .query(({ input }) => {
      const allTasks = orchestrator.getTaskQueue();
      if (input.agentId) {
        return allTasks.filter((t) => t.agentRole === (input.agentId as any));
      }
      return allTasks;
    }),

  /**
   * Update task status
   */
  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        status: z.enum(["pending", "in-progress", "completed", "failed", "blocked", "approved", "rejected"]),
      })
    )
    .mutation(async ({ input }) => {
      return orchestrator.updateTaskStatus(input.taskId, input.status as any);
    }),

  /**
   * Get approval queue
   */
  getApprovalQueue: protectedProcedure.query(() => {
    return orchestrator.getTaskQueue().filter((t) => t.status === "pending");
  }),

  /**
   * Approve or reject a task
   */
  approveTask: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        approved: z.boolean(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const status = input.approved ? "approved" : "rejected";
      orchestrator.updateTaskStatus(input.taskId, status);
      return { success: true, taskId: input.taskId, status };
    }),

  /**
   * Get agent performance metrics
   */
  getMetrics: publicProcedure.query(() => {
    const agents = orchestrator.getAgents();
    return {
      totalAgents: agents.length,
      tasksCompleted: orchestrator.getTaskQueue().filter((t) => t.status === "completed").length,
      tasksFailed: orchestrator.getTaskQueue().filter((t) => t.status === "failed").length,
      activeWorkflows: orchestrator.getAllWorkflows().filter((w) => w.status !== "completed").length,
    };
  }),

  /**
   * Get system health status
   */
  getSystemHealth: publicProcedure.query(() => {
    const agents = orchestrator.getAgents();
    const integrations = integrationHub.getStatusSummary();
    const agentStates = orchestrator.getAllAgentStates();

    return {
      agents: {
        total: agents.length,
        active: agents.filter((a: any) => a.getState().status === "working").length,
        idle: agents.filter((a: any) => a.getState().status === "idle").length,
        error: agents.filter((a: any) => a.getState().status === "error").length,
      },
      integrations,
      timestamp: new Date(),
    };
  }),
});

export const integrationRouter = router({
  /**
   * Get all integrations
   */
  getIntegrations: publicProcedure.query(() => {
    return integrationHub.getIntegrations();
  }),

  /**
   * Get a specific integration
   */
  getIntegration: publicProcedure
    .input(z.object({ integrationId: z.string() }))
    .query(({ input }) => {
      return integrationHub.getIntegration(input.integrationId);
    }),

  /**
   * Connect to an integration
   */
  connect: protectedProcedure
    .input(
      z.object({
        integrationId: z.string(),
        credentials: z.record(z.string(), z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const success = await integrationHub.connect(input.integrationId, input.credentials);
      return {
        success,
        integration: integrationHub.getIntegration(input.integrationId),
      };
    }),

  /**
   * Disconnect from an integration
   */
  disconnect: protectedProcedure
    .input(z.object({ integrationId: z.string() }))
    .mutation(async ({ input }) => {
      const success = await integrationHub.disconnect(input.integrationId);
      return {
        success,
        integration: integrationHub.getIntegration(input.integrationId),
      };
    }),

  /**
   * Get integration status summary
   */
  getStatus: publicProcedure.query(() => {
    return integrationHub.getStatusSummary();
  }),

  /**
   * Call an external API
   */
  callAPI: protectedProcedure
    .input(
      z.object({
        integrationId: z.string(),
        endpoint: z.string(),
        method: z.enum(["GET", "POST", "PUT", "DELETE"]).optional(),
        data: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await integrationHub.callAPI(
          input.integrationId,
          input.endpoint,
          input.method || "GET",
          input.data
        );
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
});

export const workflowRouter = router({
  /**
   * Get all workflows
   */
  getWorkflows: publicProcedure.query(() => {
    return [];
  }),

  /**
   * Execute a workflow
   */
  executeWorkflow: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        automationLevel: z.enum(["fully-auto", "semi-auto", "manual"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const workflow: Workflow = {
        id: input.id,
        name: input.name,
        description: input.description,
        tasks: [],
        automationLevel: input.automationLevel || "semi-auto",
        status: "pending",
        createdAt: new Date(),
        createdBy: ctx.user?.id ? ("user" as const) : ("user" as const),
      };

      await orchestrator.executeWorkflow(workflow);
      return { success: true, workflow };
    }),

  /**
   * Get workflow by ID
   */
  getWorkflow: publicProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(({ input }) => {
      return { id: input.workflowId, name: "Workflow", description: "", tasks: [], status: "pending" as const, createdAt: new Date(), createdBy: "user" as const, automationLevel: "semi-auto" as const };
    }),
});
