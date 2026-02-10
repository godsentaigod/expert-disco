/**
 * Agent Database Helpers
 * Provides functions for managing agent conversations, messages, tasks, and configurations
 */

import { eq, and, desc } from "drizzle-orm";
import {
  agentConversations,
  agentMessages,
  agentTasks,
  apiIntegrations,
  agentConfigurations,
  workflows,
  workflowExecutions,
  InsertAgentConversation,
  InsertAgentMessage,
  InsertAgentTask,
  InsertApiIntegration,
  InsertAgentConfiguration,
  InsertWorkflow,
  InsertWorkflowExecution,
} from "../../drizzle/schema";
import { getDb } from "./agent-db-connection";

/**
 * Conversation Management
 */
export async function createConversation(data: InsertAgentConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agentConversations).values(data);
  return result;
}

export async function getConversation(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conversation = await db
    .select()
    .from(agentConversations)
    .where(
      and(
        eq(agentConversations.id, conversationId),
        eq(agentConversations.userId, userId)
      )
    )
    .limit(1);

  return conversation[0];
}

export async function getUserConversations(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(agentConversations)
    .where(eq(agentConversations.userId, userId))
    .orderBy(desc(agentConversations.updatedAt))
    .limit(limit);
}

export async function updateConversation(
  conversationId: number,
  userId: number,
  data: Partial<InsertAgentConversation>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(agentConversations)
    .set(data)
    .where(
      and(
        eq(agentConversations.id, conversationId),
        eq(agentConversations.userId, userId)
      )
    );
}

/**
 * Message Management
 */
export async function addMessage(data: InsertAgentMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agentMessages).values(data);
  return result;
}

export async function getConversationMessages(conversationId: number, limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(agentMessages)
    .where(eq(agentMessages.conversationId, conversationId))
    .orderBy(agentMessages.createdAt)
    .limit(limit);
}

/**
 * Task Management
 */
export async function createTask(data: InsertAgentTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agentTasks).values(data);
  return result;
}

export async function getTask(taskId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const task = await db
    .select()
    .from(agentTasks)
    .where(and(eq(agentTasks.id, taskId), eq(agentTasks.userId, userId)))
    .limit(1);

  return task[0];
}

export async function getUserTasks(userId: number, status?: string, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [eq(agentTasks.userId, userId)];
  if (status) {
    conditions.push(eq(agentTasks.status, status as any));
  }

  return db
    .select()
    .from(agentTasks)
    .where(and(...conditions))
    .orderBy(desc(agentTasks.createdAt))
    .limit(limit);
}

export async function updateTask(
  taskId: number,
  userId: number,
  data: Partial<InsertAgentTask>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(agentTasks)
    .set(data)
    .where(and(eq(agentTasks.id, taskId), eq(agentTasks.userId, userId)));
}

/**
 * API Integration Management
 */
export async function createIntegration(data: InsertApiIntegration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(apiIntegrations).values(data);
  return result;
}

export async function getIntegration(integrationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const integration = await db
    .select()
    .from(apiIntegrations)
    .where(
      and(
        eq(apiIntegrations.id, integrationId),
        eq(apiIntegrations.userId, userId)
      )
    )
    .limit(1);

  return integration[0];
}

export async function getUserIntegrations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(apiIntegrations)
    .where(eq(apiIntegrations.userId, userId))
    .orderBy(desc(apiIntegrations.createdAt));
}

export async function getIntegrationByService(userId: number, serviceName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const integration = await db
    .select()
    .from(apiIntegrations)
    .where(
      and(
        eq(apiIntegrations.userId, userId),
        eq(apiIntegrations.serviceName, serviceName)
      )
    )
    .limit(1);

  return integration[0];
}

export async function updateIntegration(
  integrationId: number,
  userId: number,
  data: Partial<InsertApiIntegration>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(apiIntegrations)
    .set(data)
    .where(
      and(
        eq(apiIntegrations.id, integrationId),
        eq(apiIntegrations.userId, userId)
      )
    );
}

/**
 * Agent Configuration Management
 */
export async function createAgentConfig(data: InsertAgentConfiguration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agentConfigurations).values(data);
  return result;
}

export async function getAgentConfig(userId: number, agentRole: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const config = await db
    .select()
    .from(agentConfigurations)
    .where(
      and(
        eq(agentConfigurations.userId, userId),
        eq(agentConfigurations.agentRole, agentRole)
      )
    )
    .limit(1);

  return config[0];
}

export async function getUserAgentConfigs(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(agentConfigurations)
    .where(eq(agentConfigurations.userId, userId))
    .orderBy(agentConfigurations.agentRole);
}

export async function updateAgentConfig(
  configId: number,
  userId: number,
  data: Partial<InsertAgentConfiguration>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(agentConfigurations)
    .set(data)
    .where(
      and(
        eq(agentConfigurations.id, configId),
        eq(agentConfigurations.userId, userId)
      )
    );
}

/**
 * Workflow Management
 */
export async function createWorkflow(data: InsertWorkflow) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(workflows).values(data);
  return result;
}

export async function getWorkflow(workflowId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const workflow = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
    .limit(1);

  return workflow[0];
}

export async function getUserWorkflows(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(workflows)
    .where(eq(workflows.userId, userId))
    .orderBy(desc(workflows.createdAt));
}

export async function updateWorkflow(
  workflowId: number,
  userId: number,
  data: Partial<InsertWorkflow>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(workflows)
    .set(data)
    .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)));
}

/**
 * Workflow Execution Management
 */
export async function createWorkflowExecution(data: InsertWorkflowExecution) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(workflowExecutions).values(data);
  return result;
}

export async function getWorkflowExecutions(workflowId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(workflowExecutions)
    .where(eq(workflowExecutions.workflowId, workflowId))
    .orderBy(desc(workflowExecutions.createdAt))
    .limit(limit);
}

export async function updateWorkflowExecution(
  executionId: number,
  data: Partial<InsertWorkflowExecution>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(workflowExecutions)
    .set(data)
    .where(eq(workflowExecutions.id, executionId));
}
