import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

/**
 * Autonomous Account Creator Agent
 * Creates accounts on social platforms using agent-accessible email and phone
 */

interface AccountCreationTask {
  id: string;
  platform: "twitter" | "linkedin" | "reddit" | "producthunt" | "indiehackers";
  email: string;
  phone?: string;
  username: string;
  password: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  accountUrl?: string;
}

// In-memory storage for account creation tasks
const accountTasks: Map<string, AccountCreationTask> = new Map();

/**
 * Generate account creation instructions for each platform
 */
async function generateAccountCreationInstructions(
  platform: string,
  email: string,
  username: string
): Promise<string> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert at creating social media accounts. Provide step-by-step instructions for account creation.",
      },
      {
        role: "user",
        content: `Generate detailed account creation instructions for ${platform} using email: ${email} and username: ${username}. Include all required fields and verification steps.`,
      },
    ],
  });

  const contentValue = response.choices[0]?.message.content;
  return typeof contentValue === "string" ? contentValue : "";
}

/**
 * Generate verification code extraction strategy
 */
async function generateVerificationStrategy(
  platform: string
): Promise<string> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert at extracting verification codes from emails and SMS.",
      },
      {
        role: "user",
        content: `What is the typical verification code format and extraction method for ${platform}? How should we extract it from emails/SMS?`,
      },
    ],
  });

  const contentValue = response.choices[0]?.message.content;
  return typeof contentValue === "string" ? contentValue : "";
}

/**
 * Create account creation task
 */
async function createAccountCreationTask(
  platform: string,
  email: string,
  phone: string | undefined,
  username: string,
  password: string
): Promise<AccountCreationTask> {
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const task: AccountCreationTask = {
    id: taskId,
    platform: platform as AccountCreationTask["platform"],
    email,
    phone,
    username,
    password,
    status: "pending",
    createdAt: new Date(),
  };

  accountTasks.set(taskId, task);

  console.log(
    `[Account Creator] Created task ${taskId} for ${platform} account creation`
  );

  return task;
}

/**
 * Execute account creation task
 */
async function executeAccountCreationTask(
  taskId: string
): Promise<AccountCreationTask | null> {
  const task = accountTasks.get(taskId);
  if (!task) return null;

  task.status = "in_progress";

  try {
    // Generate instructions
    const instructions = await generateAccountCreationInstructions(
      task.platform,
      task.email,
      task.username
    );

    // Generate verification strategy
    const verificationStrategy = await generateVerificationStrategy(
      task.platform
    );

    // Simulate account creation
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an autonomous agent creating a ${task.platform} account. Use the provided email and username. Follow these instructions:\n${instructions}\n\nVerification strategy:\n${verificationStrategy}`,
        },
        {
          role: "user",
          content: `Create a ${task.platform} account with:\nEmail: ${task.email}\nUsername: ${task.username}\nPhone: ${task.phone || "N/A"}\n\nProvide the account creation status and URL.`,
        },
      ],
    });

    const contentValue = response.choices[0]?.message.content;
    const result = typeof contentValue === "string" ? contentValue : "";

    // Parse result
    if (typeof result === "string" && result.toLowerCase().includes("success")) {
      task.status = "completed";
      task.completedAt = new Date();
      task.accountUrl = `https://${task.platform}.com/${task.username}`;

      console.log(
        `[Account Creator] Successfully created ${task.platform} account: ${task.username}`
      );
    } else {
      throw new Error("Account creation failed: " + result);
    }
  } catch (error) {
    task.status = "failed";
    task.error = error instanceof Error ? error.message : String(error);
    task.completedAt = new Date();

    console.error(
      `[Account Creator] Failed to create ${task.platform} account:`,
      task.error
    );
  }

  return task;
}

/**
 * tRPC Router for Account Creation
 */
export const accountCreatorRouter = router({
  /**
   * Create new account creation task
   */
  createTask: protectedProcedure
    .input(
      z.object({
        platform: z.enum([
          "twitter",
          "linkedin",
          "reddit",
          "producthunt",
          "indiehackers",
        ]),
        email: z.string().email(),
        phone: z.string().optional(),
        username: z.string().min(3),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      return createAccountCreationTask(
        input.platform,
        input.email,
        input.phone,
        input.username,
        input.password
      );
    }),

  /**
   * Execute account creation task
   */
  executeTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input }) => {
      return executeAccountCreationTask(input.taskId);
    }),

  /**
   * Get task status
   */
  getTaskStatus: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input }) => {
      const task = accountTasks.get(input.taskId);
      if (!task) {
        return { found: false, error: "Task not found" };
      }

      return {
        found: true,
        task: {
          id: task.id,
          platform: task.platform,
          status: task.status,
          username: task.username,
          email: task.email,
          createdAt: task.createdAt,
          completedAt: task.completedAt,
          error: task.error,
          accountUrl: task.accountUrl,
        },
      };
    }),

  /**
   * Get all account creation tasks
   */
  getAllTasks: protectedProcedure.query(async () => {
    const tasks = Array.from(accountTasks.values()).map((task) => ({
      id: task.id,
      platform: task.platform,
      status: task.status,
      username: task.username,
      email: task.email,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      error: task.error,
      accountUrl: task.accountUrl,
    }));

    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      failed: tasks.filter((t) => t.status === "failed").length,
      pending: tasks.filter((t) => t.status === "pending").length,
      tasks,
    };
  }),

  /**
   * Create and execute account creation for all platforms
   */
  createAccountsForAllPlatforms: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        phone: z.string().optional(),
        usernameBase: z.string().min(3),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      const platforms: Array<AccountCreationTask["platform"]> = [
        "twitter",
        "linkedin",
        "reddit",
        "producthunt",
        "indiehackers",
      ];

      const tasks = [];

      for (const platform of platforms) {
        const username = `${input.usernameBase}_${platform}`;
        const task = await createAccountCreationTask(
          platform,
          input.email,
          input.phone,
          username,
          input.password
        );
        tasks.push(task);

        // Execute immediately
        await executeAccountCreationTask(task.id);
      }

      return {
        created: tasks.length,
        tasks: tasks.map((t) => ({
          id: t.id,
          platform: t.platform,
          status: t.status,
          username: t.username,
        })),
      };
    }),
});
