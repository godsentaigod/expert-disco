/**
 * tRPC Routers for Agent Persistence and Configuration
 * Exposes agent conversation, task, integration, and workflow management through the API
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as agentDb from "./agent-db";

/**
 * Conversation Router - Manage agent conversations
 */
export const conversationRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        agentRole: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return agentDb.createConversation({
        userId: ctx.user.id,
        title: input.title,
        agentRole: input.agentRole,
        status: "active",
      });
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return agentDb.getUserConversations(ctx.user.id);
  }),

  get: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      return agentDb.getConversation(input.conversationId, ctx.user.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        title: z.string().optional(),
        status: z.enum(["active", "archived", "completed"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return agentDb.updateConversation(input.conversationId, ctx.user.id, {
        title: input.title,
        status: input.status,
      });
    }),

  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const conversation = await agentDb.getConversation(
        input.conversationId,
        ctx.user.id
      );
      if (!conversation) throw new Error("Conversation not found");

      return agentDb.getConversationMessages(input.conversationId);
    }),

  addMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        role: z.enum(["user", "assistant", "agent", "system"]),
        agentRole: z.string().optional(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const conversation = await agentDb.getConversation(
        input.conversationId,
        ctx.user.id
      );
      if (!conversation) throw new Error("Conversation not found");

      return agentDb.addMessage({
        conversationId: input.conversationId,
        role: input.role,
        agentRole: input.agentRole,
        content: input.content,
      });
    }),
});

/**
 * Task Router - Manage agent tasks
 */
export const taskRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        conversationId: z.number().optional(),
        agentRole: z.string(),
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return agentDb.createTask({
        userId: ctx.user.id,
        conversationId: input.conversationId,
        agentRole: input.agentRole,
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: "pending",
      });
    }),

  list: protectedProcedure
    .input(z.object({ status: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return agentDb.getUserTasks(ctx.user.id, input.status);
    }),

  get: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .query(async ({ ctx, input }) => {
      return agentDb.getTask(input.taskId, ctx.user.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        status: z.enum(["pending", "in_progress", "completed", "failed", "cancelled"]).optional(),
        result: z.string().optional(),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return agentDb.updateTask(input.taskId, ctx.user.id, {
        status: input.status,
        result: input.result,
        errorMessage: input.errorMessage,
        completedAt: input.status === "completed" ? new Date() : undefined,
      });
    }),
});

/**
 * Integration Router - Manage API integrations
 */
export const integrationRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        serviceName: z.string(),
        displayName: z.string().optional(),
        description: z.string().optional(),
        config: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return agentDb.createIntegration({
        userId: ctx.user.id,
        serviceName: input.serviceName,
        displayName: input.displayName,
        description: input.description,
        config: input.config,
        isActive: 1,
      });
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return agentDb.getUserIntegrations(ctx.user.id);
  }),

  get: protectedProcedure
    .input(z.object({ integrationId: z.number() }))
    .query(async ({ ctx, input }) => {
      return agentDb.getIntegration(input.integrationId, ctx.user.id);
    }),

  getByService: protectedProcedure
    .input(z.object({ serviceName: z.string() }))
    .query(async ({ ctx, input }) => {
      return agentDb.getIntegrationByService(ctx.user.id, input.serviceName);
    }),

  update: protectedProcedure
    .input(
      z.object({
        integrationId: z.number(),
        displayName: z.string().optional(),
        description: z.string().optional(),
        config: z.record(z.string(), z.any()).optional(),
        isActive: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return agentDb.updateIntegration(input.integrationId, ctx.user.id, {
        displayName: input.displayName,
        description: input.description,
        config: input.config,
        isActive: input.isActive,
      });
    }),

  test: protectedProcedure
    .input(z.object({ integrationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const integration = await agentDb.getIntegration(
        input.integrationId,
        ctx.user.id
      );
      if (!integration) throw new Error("Integration not found");

      try {
        // Placeholder for actual integration testing
        // In real implementation, would call the service to verify credentials
        await agentDb.updateIntegration(input.integrationId, ctx.user.id, {
          testStatus: "success",
          lastTestedAt: new Date(),
        });

        return { success: true, status: "success" };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await agentDb.updateIntegration(input.integrationId, ctx.user.id, {
          testStatus: "failed",
          testError: errorMessage,
          lastTestedAt: new Date(),
        });

        return { success: false, status: "failed", error: errorMessage };
      }
    }),
});

/**
 * Agent Configuration Router - Manage agent settings
 */
export const agentConfigRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        agentRole: z.string(),
        displayName: z.string().optional(),
        description: z.string().optional(),
        systemPrompt: z.string().optional(),
        autoApprove: z.number().optional(),
        requiredApprovals: z.number().optional(),
        config: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return agentDb.createAgentConfig({
        userId: ctx.user.id,
        agentRole: input.agentRole,
        displayName: input.displayName,
        description: input.description,
        systemPrompt: input.systemPrompt,
        autoApprove: input.autoApprove,
        requiredApprovals: input.requiredApprovals,
        config: input.config,
        isActive: 1,
      });
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return agentDb.getUserAgentConfigs(ctx.user.id);
  }),

  get: protectedProcedure
    .input(z.object({ agentRole: z.string() }))
    .query(async ({ ctx, input }) => {
      return agentDb.getAgentConfig(ctx.user.id, input.agentRole);
    }),

  update: protectedProcedure
    .input(
      z.object({
        configId: z.number(),
        displayName: z.string().optional(),
        description: z.string().optional(),
        systemPrompt: z.string().optional(),
        autoApprove: z.number().optional(),
        requiredApprovals: z.number().optional(),
        config: z.record(z.string(), z.any()).optional(),
        isActive: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return agentDb.updateAgentConfig(input.configId, ctx.user.id, {
        displayName: input.displayName,
        description: input.description,
        systemPrompt: input.systemPrompt,
        autoApprove: input.autoApprove,
        requiredApprovals: input.requiredApprovals,
        config: input.config,
        isActive: input.isActive,
      });
    }),
});

/**
 * Workflow Router - Manage automated workflows
 */
export const workflowRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        triggerType: z.string(),
        triggerConfig: z.record(z.string(), z.any()).optional(),
        steps: z.array(z.record(z.string(), z.any())),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return agentDb.createWorkflow({
        userId: ctx.user.id,
        name: input.name,
        description: input.description,
        triggerType: input.triggerType,
        triggerConfig: input.triggerConfig,
        steps: input.steps,
        isActive: 1,
      });
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return agentDb.getUserWorkflows(ctx.user.id);
  }),

  get: protectedProcedure
    .input(z.object({ workflowId: z.number() }))
    .query(async ({ ctx, input }) => {
      return agentDb.getWorkflow(input.workflowId, ctx.user.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        workflowId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        steps: z.array(z.record(z.string(), z.any())).optional(),
        isActive: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return agentDb.updateWorkflow(input.workflowId, ctx.user.id, {
        name: input.name,
        description: input.description,
        steps: input.steps,
        isActive: input.isActive,
      });
    }),

  getExecutions: protectedProcedure
    .input(z.object({ workflowId: z.number() }))
    .query(async ({ ctx, input }) => {
      const workflow = await agentDb.getWorkflow(input.workflowId, ctx.user.id);
      if (!workflow) throw new Error("Workflow not found");

      return agentDb.getWorkflowExecutions(input.workflowId);
    }),
});
