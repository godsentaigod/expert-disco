/**
 * Content Creator Agent - generates marketing materials and content
 */

import { BaseAgent } from "./base-agent";
import type { AgentMessage, AgentTask } from "./types";

export class ContentCreatorAgent extends BaseAgent {
  private generatedContent: Map<string, ContentItem> = new Map();
  private contentTemplates: Map<string, string> = new Map();

  constructor() {
    super("content-creator");
    this.initializeTemplates();
  }

  /**
   * Initialize content templates
   */
  private initializeTemplates(): void {
    this.contentTemplates.set(
      "blog-post",
      "# {title}\n\n{introduction}\n\n## Key Points\n{keyPoints}\n\n## Conclusion\n{conclusion}"
    );

    this.contentTemplates.set(
      "social-post",
      "{hook}\n\n{body}\n\n{cta}\n\n{hashtags}"
    );

    this.contentTemplates.set(
      "email-campaign",
      "Subject: {subject}\n\n{greeting}\n\n{body}\n\n{cta}\n\n{signature}"
    );
  }

  /**
   * Initialize capabilities
   */
  protected initializeCapabilities(): void {
    this.registerCapability("generate-blog-posts", {
      name: "generate-blog-posts",
      description: "Generate blog posts from topics and keywords",
      requiredIntegrations: [],
      requiredModels: ["text-generation"],
      parameters: {
        wordCount: 1500,
        tone: "professional",
      },
      outputFormat: "markdown",
    });

    this.registerCapability("generate-social-content", {
      name: "generate-social-content",
      description: "Generate social media posts",
      requiredIntegrations: ["twitter", "instagram", "tiktok"],
      requiredModels: ["text-generation"],
      parameters: {
        platforms: ["twitter", "instagram", "tiktok"],
      },
      outputFormat: "json",
    });

    this.registerCapability("generate-email-campaigns", {
      name: "generate-email-campaigns",
      description: "Generate email marketing campaigns",
      requiredIntegrations: ["email"],
      requiredModels: ["text-generation"],
      parameters: {
        campaignType: "promotional",
      },
      outputFormat: "html",
    });

    this.registerCapability("generate-product-descriptions", {
      name: "generate-product-descriptions",
      description: "Generate product descriptions and copy",
      requiredIntegrations: [],
      requiredModels: ["text-generation"],
      parameters: {
        style: "persuasive",
      },
      outputFormat: "text",
    });
  }

  /**
   * Perform task
   */
  protected async performTask(task: AgentTask): Promise<void> {
    switch (task.title) {
      case "generate-blog-post":
        await this.generateBlogPost(task.metadata);
        break;
      case "generate-social-content":
        await this.generateSocialContent(task.metadata);
        break;
      case "generate-email-campaign":
        await this.generateEmailCampaign(task.metadata);
        break;
      case "generate-product-description":
        await this.generateProductDescription(task.metadata);
        break;
      case "schedule-content":
        await this.scheduleContent(task.metadata);
        break;
      default:
        throw new Error(`Unknown content creator task: ${task.title}`);
    }
  }

  /**
   * Handle incoming message
   */
  protected async handleMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case "command":
        await this.handleCommand(message);
        break;
      case "query":
        await this.handleQuery(message);
        break;
      default:
        break;
    }
  }

  /**
   * Generate blog post
   */
  private async generateBlogPost(metadata?: Record<string, any>): Promise<void> {
    const topic = metadata?.topic || "AI Automation";
    const keywords = metadata?.keywords || ["AI", "automation", "productivity"];

    const content = {
      title: `${topic}: Complete Guide and Best Practices`,
      introduction: `In this comprehensive guide, we'll explore everything you need to know about ${topic}. Learn how to implement ${topic} in your business and achieve better results.`,
      keyPoints: keywords.map((kw: string) => `- ${kw}: Key benefits and implementation strategies`).join("\n"),
      conclusion: `${topic} is transforming how businesses operate. Start implementing these strategies today to stay ahead of the competition.`,
    };

    const blogPost = this.renderTemplate("blog-post", content);

    const contentItem: ContentItem = {
      id: `blog-${Date.now()}`,
      type: "blog-post",
      title: content.title,
      content: blogPost,
      topic,
      status: "draft",
      createdAt: new Date(),
    };

    this.generatedContent.set(contentItem.id, contentItem);

    await this.sendMessage(
      "management",
      "response",
      `Blog Post Generated: ${content.title}`,
      blogPost
    );
  }

  /**
   * Generate social media content
   */
  private async generateSocialContent(metadata?: Record<string, any>): Promise<void> {
    const platforms = metadata?.platforms || ["twitter", "instagram"];
    const topic = metadata?.topic || "AI Automation";

    const socialPosts = platforms.map((platform: string) => {
      const content = {
        hook: `🚀 Discover how ${topic} can transform your business`,
        body: `Learn the secrets that top companies use to automate their operations and save thousands of hours. Our new guide covers everything you need to get started.`,
        cta: `Read the full guide →`,
        hashtags: `#${topic.replace(/\s+/g, "")} #Automation #AI #Productivity`,
      };

      return {
        platform,
        content: this.renderTemplate("social-post", content),
        status: "draft",
      };
    });

    const contentItem: ContentItem = {
      id: `social-${Date.now()}`,
      type: "social-content",
      title: `Social Posts for ${topic}`,
      content: JSON.stringify(socialPosts, null, 2),
      topic,
      status: "draft",
      createdAt: new Date(),
    };

    this.generatedContent.set(contentItem.id, contentItem);

    await this.sendMessage(
      "management",
      "response",
      `Social Content Generated for ${platforms.join(", ")}`,
      JSON.stringify(socialPosts, null, 2)
    );
  }

  /**
   * Generate email campaign
   */
  private async generateEmailCampaign(metadata?: Record<string, any>): Promise<void> {
    const campaignName = metadata?.campaignName || "Product Launch";
    const productName = metadata?.productName || "AI Solution";

    const content = {
      subject: `Introducing ${productName}: Transform Your Workflow`,
      greeting: `Hi there!`,
      body: `We're excited to announce the launch of ${productName}. This powerful solution helps you automate repetitive tasks and focus on what matters most.`,
      cta: `Get Started Free →`,
      signature: `Best regards,\nThe Team`,
    };

    const emailCampaign = this.renderTemplate("email-campaign", content);

    const contentItem: ContentItem = {
      id: `email-${Date.now()}`,
      type: "email-campaign",
      title: campaignName,
      content: emailCampaign,
      topic: productName,
      status: "draft",
      createdAt: new Date(),
    };

    this.generatedContent.set(contentItem.id, contentItem);

    await this.sendMessage(
      "management",
      "response",
      `Email Campaign Generated: ${campaignName}`,
      emailCampaign
    );
  }

  /**
   * Generate product description
   */
  private async generateProductDescription(metadata?: Record<string, any>): Promise<void> {
    const productName = metadata?.productName || "AI Product";
    const features = metadata?.features || ["Automation", "Analytics", "Integration"];

    const description = `
# ${productName}

## Overview
${productName} is a powerful solution designed to help businesses automate their operations and achieve better results.

## Key Features
${features.map((f: string) => `- **${f}**: Advanced capabilities for maximum efficiency`).join("\n")}

## Benefits
- Save time and reduce manual work
- Improve accuracy and consistency
- Scale your operations effortlessly
- Integrate with your existing tools

## Get Started
Start your free trial today and experience the power of ${productName}.
    `.trim();

    const contentItem: ContentItem = {
      id: `product-${Date.now()}`,
      type: "product-description",
      title: `Description for ${productName}`,
      content: description,
      topic: productName,
      status: "draft",
      createdAt: new Date(),
    };

    this.generatedContent.set(contentItem.id, contentItem);

    await this.sendMessage(
      "management",
      "response",
      `Product Description Generated: ${productName}`,
      description
    );
  }

  /**
   * Schedule content for publishing
   */
  private async scheduleContent(metadata?: Record<string, any>): Promise<void> {
    const contentId = metadata?.contentId;
    const publishDate = metadata?.publishDate || new Date();

    if (contentId) {
      const content = this.generatedContent.get(contentId);
      if (content) {
        content.status = "scheduled";
        content.publishDate = publishDate;

        await this.sendMessage(
          "management",
          "response",
          `Content Scheduled: ${content.title}`,
          `Content will be published on ${publishDate.toISOString()}`
        );
      }
    }
  }

  /**
   * Render template with data
   */
  private renderTemplate(templateName: string, data: Record<string, any>): string {
    let template = this.contentTemplates.get(templateName) || "";

    Object.entries(data).forEach(([key, value]) => {
      template = template.replace(`{${key}}`, String(value));
    });

    return template;
  }

  /**
   * Handle command
   */
  private async handleCommand(message: AgentMessage): Promise<void> {
    const command = message.content.toLowerCase();

    if (command.includes("blog")) {
      await this.generateBlogPost(message.data);
    } else if (command.includes("social")) {
      await this.generateSocialContent(message.data);
    } else if (command.includes("email")) {
      await this.generateEmailCampaign(message.data);
    } else if (command.includes("product")) {
      await this.generateProductDescription(message.data);
    }
  }

  /**
   * Handle query
   */
  private async handleQuery(message: AgentMessage): Promise<void> {
    const query = message.content.toLowerCase();

    if (query.includes("content")) {
      const contentList = Array.from(this.generatedContent.values())
        .map((c) => `- ${c.title} (${c.type})`)
        .join("\n");

      await this.sendMessage(
        message.from,
        "response",
        "Generated Content",
        contentList || "No content generated yet"
      );
    }
  }

  /**
   * Get generated content
   */
  getGeneratedContent(): ContentItem[] {
    return Array.from(this.generatedContent.values());
  }
}

/**
 * Content item structure
 */
interface ContentItem {
  id: string;
  type: "blog-post" | "social-content" | "email-campaign" | "product-description";
  title: string;
  content: string;
  topic: string;
  status: "draft" | "scheduled" | "published";
  createdAt: Date;
  publishDate?: Date;
}
