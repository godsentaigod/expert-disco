/**
 * Core types for the autonomous AI agent framework
 */

export type AgentRole = 
  | "management"
  | "trend-predictor"
  | "content-creator"
  | "sales"
  | "operations"
  | "strategy"
  | "advanced-coder"
  | "platform-architect";

export type MessageType = 
  | "task"
  | "report"
  | "query"
  | "command"
  | "alert"
  | "response"
  | "status";

export type TaskStatus = 
  | "pending"
  | "in-progress"
  | "completed"
  | "failed"
  | "blocked"
  | "approved"
  | "rejected";

export type AgentStatus = 
  | "idle"
  | "working"
  | "waiting"
  | "error"
  | "offline";

/**
 * Agent message - core communication unit
 */
export interface AgentMessage {
  id: string;
  from: AgentRole;
  to: AgentRole | "user";
  type: MessageType;
  subject: string;
  content: string;
  data?: Record<string, any>;
  timestamp: Date;
  priority: "low" | "normal" | "high" | "critical";
  requiresApproval?: boolean;
  approvedBy?: string;
  approvalTime?: Date;
}

/**
 * Agent task - work unit assigned to an agent
 */
export interface AgentTask {
  id: string;
  agentRole: AgentRole;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "low" | "normal" | "high" | "critical";
  createdBy: AgentRole | "user";
  createdAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  result?: string;
  error?: string;
  dependencies?: string[]; // Task IDs
  metadata?: Record<string, any>;
}

/**
 * Agent state - current status and capabilities
 */
export interface AgentState {
  role: AgentRole;
  status: AgentStatus;
  lastActive: Date;
  tasksCompleted: number;
  tasksFailed: number;
  currentTask?: string;
  capabilities: string[];
  integrations: string[];
  configuration: Record<string, any>;
}

/**
 * Agent report - periodic status update
 */
export interface AgentReport {
  id: string;
  agentRole: AgentRole;
  timestamp: Date;
  status: AgentStatus;
  tasksCompleted: number;
  tasksFailed: number;
  metrics: Record<string, number>;
  insights: string[];
  recommendations: string[];
  alerts: string[];
}

/**
 * Workflow - sequence of tasks across agents
 */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  tasks: AgentTask[];
  status: TaskStatus;
  createdAt: Date;
  completedAt?: Date;
  createdBy: AgentRole | "user";
  triggerCondition?: string;
  automationLevel: "manual" | "semi-auto" | "fully-auto";
}

/**
 * Integration configuration
 */
export interface Integration {
  id: string;
  name: string;
  type: string; // e.g., "social-media", "email", "analytics"
  provider: string; // e.g., "twitter", "sendgrid", "mixpanel"
  credentials: Record<string, string>; // Encrypted
  config: Record<string, any>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  agentsUsing: AgentRole[];
}

/**
 * Command center configuration
 */
export interface CommandCenterConfig {
  id: string;
  userId: number;
  layout: "dashboard" | "kanban" | "timeline" | "custom";
  widgets: DashboardWidget[];
  theme: "light" | "dark" | "auto";
  autoRefreshInterval: number; // milliseconds
  notificationPreferences: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Dashboard widget configuration
 */
export interface DashboardWidget {
  id: string;
  type: "agent-status" | "task-queue" | "metrics" | "chat" | "workflow" | "custom";
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, any>;
  refreshInterval?: number;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  taskCompleted: boolean;
  taskFailed: boolean;
  agentAlert: boolean;
  approvalNeeded: boolean;
  dailyReport: boolean;
  criticalOnly: boolean;
}

/**
 * Chat message for natural language interface
 */
export interface ChatMessage {
  id: string;
  userId: number;
  role: "user" | "assistant" | "agent";
  agentRole?: AgentRole;
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Conversation context
 */
export interface ConversationContext {
  id: string;
  userId: number;
  messages: ChatMessage[];
  activeAgents: AgentRole[];
  recentTasks: string[];
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}

/**
 * Agent capability definition
 */
export interface AgentCapability {
  name: string;
  description: string;
  requiredIntegrations: string[];
  requiredModels?: string[];
  parameters: Record<string, any>;
  outputFormat: string;
}

/**
 * Model configuration for agents
 */
export interface ModelConfig {
  id: string;
  name: string;
  type: "huggingface" | "ollama" | "openai" | "custom";
  provider: string;
  model: string;
  apiKey?: string;
  endpoint?: string;
  parameters: Record<string, any>;
  enabled: boolean;
  usedByAgents: AgentRole[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Audit log entry
 */
export interface AuditLog {
  id: string;
  userId?: number;
  agentRole?: AgentRole;
  action: string;
  resource: string;
  changes: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
}
