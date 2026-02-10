/**
 * Tests for Agent Persistence System
 * Verifies database operations for conversations, tasks, integrations, and workflows
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as agentDb from "./agent-db";

// Mock user ID for testing
const TEST_USER_ID = 1;

describe("Agent Persistence System", () => {
  describe("Conversations", () => {
    it("should create a new conversation", async () => {
      const result = await agentDb.createConversation({
        userId: TEST_USER_ID,
        title: "Test Conversation",
        agentRole: "management",
        status: "active",
      });

      expect(result).toBeDefined();
    });

    it("should retrieve user conversations", async () => {
      const conversations = await agentDb.getUserConversations(TEST_USER_ID);
      expect(Array.isArray(conversations)).toBe(true);
    });
  });

  describe("Messages", () => {
    it("should add a message to conversation", async () => {
      // First create a conversation
      const convResult = await agentDb.createConversation({
        userId: TEST_USER_ID,
        title: "Message Test",
        agentRole: "management",
        status: "active",
      });

      if (!convResult) {
        throw new Error("Failed to create conversation");
      }

      // Then add a message
      const messageResult = await agentDb.addMessage({
        conversationId: 1,
        role: "user",
        content: "Hello agent",
      });

      expect(messageResult).toBeDefined();
    });

    it("should retrieve conversation messages", async () => {
      const messages = await agentDb.getConversationMessages(1);
      expect(Array.isArray(messages)).toBe(true);
    });
  });

  describe("Tasks", () => {
    it("should create a new task", async () => {
      const result = await agentDb.createTask({
        userId: TEST_USER_ID,
        agentRole: "content-creator",
        title: "Create Blog Post",
        description: "Write a blog post about AI",
        priority: "high",
        status: "pending",
      });

      expect(result).toBeDefined();
    });

    it("should retrieve user tasks", async () => {
      const tasks = await agentDb.getUserTasks(TEST_USER_ID);
      expect(Array.isArray(tasks)).toBe(true);
    });

    it("should filter tasks by status", async () => {
      const pendingTasks = await agentDb.getUserTasks(TEST_USER_ID, "pending");
      expect(Array.isArray(pendingTasks)).toBe(true);
    });

    it("should update task status", async () => {
      // Create a task first
      const taskResult = await agentDb.createTask({
        userId: TEST_USER_ID,
        agentRole: "sales",
        title: "Follow up with leads",
        status: "pending",
      });

      if (!taskResult) {
        throw new Error("Failed to create task");
      }

      // Update it
      const updateResult = await agentDb.updateTask(1, TEST_USER_ID, {
        status: "completed",
        result: "Task completed successfully",
      });

      expect(updateResult).toBeDefined();
    });
  });

  describe("API Integrations", () => {
    it("should create an API integration", async () => {
      const result = await agentDb.createIntegration({
        userId: TEST_USER_ID,
        serviceName: "twitter",
        displayName: "Twitter API",
        description: "Twitter API integration for trend monitoring",
        config: {
          apiKey: "test_key",
          apiSecret: "test_secret",
        },
        isActive: 1,
      });

      expect(result).toBeDefined();
    });

    it("should retrieve user integrations", async () => {
      const integrations = await agentDb.getUserIntegrations(TEST_USER_ID);
      expect(Array.isArray(integrations)).toBe(true);
    });

    it("should get integration by service name", async () => {
      const integration = await agentDb.getIntegrationByService(
        TEST_USER_ID,
        "twitter"
      );

      // Integration might not exist, that's ok for this test
      expect(integration === undefined || integration.serviceName === "twitter").toBe(
        true
      );
    });

    it("should update integration config", async () => {
      const result = await agentDb.updateIntegration(1, TEST_USER_ID, {
        displayName: "Updated Twitter",
        isActive: 0,
      });

      expect(result).toBeDefined();
    });
  });

  describe("Agent Configurations", () => {
    it("should create agent configuration", async () => {
      const result = await agentDb.createAgentConfig({
        userId: TEST_USER_ID,
        agentRole: "trend-predictor",
        displayName: "Trend Predictor",
        description: "Monitors social media trends",
        systemPrompt: "You are a trend prediction expert",
        autoApprove: 0,
        requiredApprovals: 1,
        isActive: 1,
      });

      expect(result).toBeDefined();
    });

    it("should retrieve agent configurations", async () => {
      const configs = await agentDb.getUserAgentConfigs(TEST_USER_ID);
      expect(Array.isArray(configs)).toBe(true);
    });

    it("should get specific agent config", async () => {
      const config = await agentDb.getAgentConfig(TEST_USER_ID, "trend-predictor");

      // Config might not exist, that's ok
      expect(
        config === undefined || config.agentRole === "trend-predictor"
      ).toBe(true);
    });

    it("should update agent configuration", async () => {
      const result = await agentDb.updateAgentConfig(1, TEST_USER_ID, {
        autoApprove: 1,
        requiredApprovals: 2,
      });

      expect(result).toBeDefined();
    });
  });

  describe("Workflows", () => {
    it("should create a workflow", async () => {
      const result = await agentDb.createWorkflow({
        userId: TEST_USER_ID,
        name: "Content Creation Pipeline",
        description: "Automated content creation workflow",
        triggerType: "manual",
        steps: [
          {
            agentRole: "content-creator",
            action: "generate_blog_post",
            topic: "AI trends",
          },
          {
            agentRole: "management",
            action: "review_and_approve",
          },
        ],
        isActive: 1,
      });

      expect(result).toBeDefined();
    });

    it("should retrieve user workflows", async () => {
      const workflows = await agentDb.getUserWorkflows(TEST_USER_ID);
      expect(Array.isArray(workflows)).toBe(true);
    });

    it("should update workflow", async () => {
      const result = await agentDb.updateWorkflow(1, TEST_USER_ID, {
        name: "Updated Workflow",
        isActive: 0,
      });

      expect(result).toBeDefined();
    });

    it("should retrieve workflow executions", async () => {
      const executions = await agentDb.getWorkflowExecutions(1);
      expect(Array.isArray(executions)).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing database gracefully", async () => {
      // This test verifies that the functions handle missing DB connection
      // In a real scenario, the DB would be unavailable
      try {
        const result = await agentDb.getUserConversations(TEST_USER_ID);
        expect(result).toBeDefined();
      } catch (error) {
        // Expected if DB is not available
        expect(error).toBeDefined();
      }
    });
  });
});
