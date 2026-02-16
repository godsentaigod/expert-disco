import { invokeLLM } from "../_core/llm";

/**
 * LLM Integration for Autonomous Agents
 * Provides real AI-powered responses for all agent operations
 */

export interface AgentPromptContext {
  agentRole: string;
  agentName: string;
  task: string;
  context?: Record<string, unknown>;
  userMessage?: string;
  previousMessages?: Array<{ role: string; content: string }>;
}

/**
 * System prompts for each agent type
 */
const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  management:
    "You are the Management Agent for an autonomous AI workforce. Your role is to coordinate all other agents, manage task queues, handle approvals, and escalate critical decisions to the user. Be strategic, decisive, and always prioritize business outcomes. Provide clear status updates and recommendations.",

  trend_predictor:
    "You are the Trend Predictor Agent. Your expertise is identifying emerging social media trends, viral opportunities, and market shifts. Analyze data patterns, predict what will trend next, and recommend optimal timing for content launches. Focus on actionable insights that drive visibility and sales.",

  content_creator:
    "You are the Content Creator Agent. Your role is generating high-quality, conversion-optimized content across all formats: blog posts, social media, email campaigns, product descriptions, and marketing copy. Write in a premium, professional tone that resonates with high-ticket buyers. Every piece should drive sales and build brand authority.",

  sales:
    "You are the Sales Agent. Your expertise is lead generation, qualification, nurturing, and conversion. Create compelling sales pitches, handle objections, design sales funnels, and optimize conversion rates. Focus on high-ticket sales and premium positioning. Track metrics and continuously optimize.",

  operations:
    "You are the Operations Agent. Your role is automating workflows, managing processes, optimizing efficiency, and ensuring smooth business operations. Design automation blueprints, identify bottlenecks, streamline processes, and scale operations without adding headcount.",

  strategy:
    "You are the Strategy Agent. Your expertise is business strategy, competitive analysis, market positioning, and long-term planning. Provide strategic recommendations, analyze market opportunities, assess risks, and guide business decisions. Think like a seasoned business strategist.",

  advanced_coder:
    "You are the Advanced Coder Agent. Your role is maintaining the platform, configuring AI models (HuggingFace, Ollama), optimizing performance, and ensuring technical excellence. Provide technical recommendations, manage infrastructure, and ensure the system runs flawlessly.",

  platform_architect:
    "You are the Platform Architect Agent. Your expertise is system design, integration architecture, customization, and building new capabilities. Design solutions, create custom forms, manage integrations, and architect the platform for scale. Report directly to the user with recommendations.",
};

/**
 * Generate an LLM response for an agent
 */
export async function generateAgentResponse(
  context: AgentPromptContext
): Promise<string> {
  const systemPrompt =
    AGENT_SYSTEM_PROMPTS[context.agentRole.toLowerCase()] ||
    AGENT_SYSTEM_PROMPTS.management;

  const messages = [
    {
      role: "system" as const,
      content: systemPrompt,
    },
    ...(context.previousMessages || []).map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    {
      role: "user" as const,
      content: context.userMessage || context.task,
    },
  ];

  try {
    const response = await invokeLLM({
      messages: messages as any,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("Invalid LLM response format");
    }

    return content;
  } catch (error) {
    console.error(`[LLM Integration] Error generating response for ${context.agentRole}:`, error);
    throw error;
  }
}

/**
 * Generate structured JSON response from LLM
 */
export async function generateStructuredResponse(
  context: AgentPromptContext,
  schema: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const systemPrompt =
    AGENT_SYSTEM_PROMPTS[context.agentRole.toLowerCase()] ||
    AGENT_SYSTEM_PROMPTS.management;

  const messages = [
    {
      role: "system" as const,
      content: systemPrompt,
    },
    {
      role: "user" as const,
      content: context.userMessage || context.task,
    },
  ];

  try {
    const response = await invokeLLM({
      messages: messages as any,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "agent_response",
          strict: true,
          schema: schema as any,
        },
      },
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("Invalid LLM response format");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error(`[LLM Integration] Error generating structured response for ${context.agentRole}:`, error);
    throw error;
  }
}

/**
 * Generate sales copy optimized for premium positioning
 */
export async function generateSalesCopy(
  productName: string,
  productDescription: string,
  targetAudience: string
): Promise<string> {
  const context: AgentPromptContext = {
    agentRole: "content_creator",
    agentName: "Content Creator",
    task: `Generate premium, high-converting sales copy for the following product:

Product Name: ${productName}
Product Description: ${productDescription}
Target Audience: ${targetAudience}

Requirements:
- Write in a luxury, premium tone
- Focus on ROI and business outcomes
- Include specific benefits and use cases
- Create urgency without being pushy
- Optimize for high-ticket buyers
- Keep it concise but compelling (200-300 words)`,
  };

  return generateAgentResponse(context);
}

/**
 * Generate social media content for a specific platform
 */
export async function generateSocialContent(
  platform: "twitter" | "linkedin" | "reddit" | "instagram",
  topic: string,
  tone: string = "professional"
): Promise<string> {
  const platformGuidelines: Record<string, string> = {
    twitter:
      "280 characters max, use hashtags, include call-to-action, make it shareable",
    linkedin:
      "Professional tone, 1-3 paragraphs, include industry insights, encourage engagement",
    reddit:
      "Authentic, conversational, add value to the community, avoid obvious promotion",
    instagram:
      "Visual-first, caption 100-150 words, use emojis, include call-to-action",
  };

  const context: AgentPromptContext = {
    agentRole: "content_creator",
    agentName: "Content Creator",
    task: `Generate ${platform} content about: ${topic}

Platform Guidelines: ${platformGuidelines[platform]}
Tone: ${tone}

Create content that drives engagement and conversions.`,
  };

  return generateAgentResponse(context);
}

/**
 * Generate lead qualification questions
 */
export async function generateLeadQualificationQuestions(
  productType: string,
  targetMarket: string
): Promise<string[]> {
  const context: AgentPromptContext = {
    agentRole: "sales",
    agentName: "Sales Agent",
    task: `Generate 5 powerful lead qualification questions for:

Product Type: ${productType}
Target Market: ${targetMarket}

Requirements:
- Questions should quickly identify high-intent buyers
- Each question should reveal buying power and need
- Format as a JSON array of strings`,
  };

  try {
    const response = await generateAgentResponse(context);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return response.split("\n").filter((q) => q.trim().length > 0);
  } catch {
    return [
      "What's your current budget for this solution?",
      "How many team members would use this?",
      "What's your timeline for implementation?",
      "Have you tried similar solutions before?",
      "What's your biggest challenge right now?",
    ];
  }
}

/**
 * Generate email subject lines optimized for open rates
 */
export async function generateEmailSubjectLines(
  topic: string,
  audience: string,
  count: number = 5
): Promise<string[]> {
  const context: AgentPromptContext = {
    agentRole: "content_creator",
    agentName: "Content Creator",
    task: `Generate ${count} high-converting email subject lines for:

Topic: ${topic}
Audience: ${audience}

Requirements:
- Each subject line should be under 50 characters
- Focus on open rates and click-through
- Include curiosity, urgency, or benefit
- Format as a JSON array of strings`,
  };

  try {
    const response = await generateAgentResponse(context);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return response.split("\n").filter((s) => s.trim().length > 0);
  } catch {
    return [
      "🚀 Save $50K/year with AI",
      "Your competitors are already using this",
      "Limited: 48-hour launch pricing",
      "Replace your expensive expert today",
      "See how founders are cutting costs 80%",
    ];
  }
}
