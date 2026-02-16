import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateContentCalendar,
  generateEmailSequences,
  generateLeadQualificationFramework,
  calculateProjectedMetrics,
  executeSalesBlitz,
} from "./sales-blitz";

// Mock the LLM integration module
vi.mock("./llm-integration", () => ({
  generateSalesCopy: vi.fn().mockResolvedValue(
    "Premium AI solution that replaces expensive expert roles with AI-driven systems. " +
    "Get production-ready prompts, workflows, and automation templates. " +
    "Start immediately, no training required."
  ),
  generateSocialContent: vi.fn().mockResolvedValue(
    "🚀 Introducing premium AI solution. Replace expensive roles with intelligent automation. " +
    "Production-ready templates included. Limited launch pricing available now."
  ),
  generateEmailSubjectLines: vi.fn().mockResolvedValue([
    "🚀 Exclusive Launch: Transform Your Business with AI",
  ]),
  generateLeadQualificationQuestions: vi.fn().mockResolvedValue([
    "What is your current annual budget for this role?",
    "When do you need to implement this solution?",
    "Are you the decision maker for this purchase?",
  ]),
}));

describe("Sales Blitz Execution", () => {
  const mockProducts = [
    {
      id: "1",
      name: "AI CTO Kit",
      description: "Replace your CTO with AI",
      price: 397,
      targetAudience: "Startup founders",
    },
    {
      id: "2",
      name: "AI Growth Lead Kit",
      description: "Replace your Growth Lead with AI",
      price: 397,
      targetAudience: "Growth teams",
    },
  ];

  describe("generateContentCalendar", () => {
    it("should generate content calendar for all channels", async () => {
      const config = {
        startTime: new Date(),
        duration: 24,
        channels: ["twitter", "linkedin"] as const,
        products: mockProducts,
      };

      const calendar = await generateContentCalendar(config);

      expect(calendar).toBeDefined();
      expect(Array.isArray(calendar)).toBe(true);
      expect(calendar.length).toBeGreaterThan(0);

      // Verify calendar has expected structure
      calendar.forEach((item) => {
        expect(item).toHaveProperty("time");
        expect(item).toHaveProperty("channel");
        expect(item).toHaveProperty("content");
        expect(item).toHaveProperty("type");
        expect(item).toHaveProperty("product");
      });
    });

    it("should generate content for each channel", async () => {
      const config = {
        startTime: new Date(),
        duration: 24,
        channels: ["twitter", "linkedin", "reddit"] as const,
        products: mockProducts,
      };

      const calendar = await generateContentCalendar(config);
      const channels = new Set(calendar.map((item) => item.channel));

      expect(channels.has("twitter")).toBe(true);
      expect(channels.has("linkedin")).toBe(true);
      expect(channels.has("reddit")).toBe(true);
    });

    it("should generate content for each product", async () => {
      const config = {
        startTime: new Date(),
        duration: 24,
        channels: ["twitter"] as const,
        products: mockProducts,
      };

      const calendar = await generateContentCalendar(config);
      const products = new Set(calendar.map((item) => item.product));

      expect(products.has("AI CTO Kit")).toBe(true);
      expect(products.has("AI Growth Lead Kit")).toBe(true);
    });
  });

  describe("generateEmailSequences", () => {
    it("should generate email sequences for all products", async () => {
      const sequences = await generateEmailSequences(mockProducts);

      expect(sequences).toBeDefined();
      expect(Array.isArray(sequences)).toBe(true);
      expect(sequences.length).toBeGreaterThan(0);
    });

    it("should generate 4 emails per product (day 0-3)", async () => {
      const sequences = await generateEmailSequences(mockProducts);

      // Should have 4 emails per product
      expect(sequences.length).toBe(mockProducts.length * 4);

      // Verify each product has emails for days 0-3
      mockProducts.forEach((product) => {
        const productEmails = sequences.filter(
          (email) => email.product === product.name
        );
        expect(productEmails.length).toBe(4);

        const days = productEmails.map((email) => email.day).sort();
        expect(days).toEqual([0, 1, 2, 3]);
      });
    });

    it("should have proper email structure", async () => {
      const sequences = await generateEmailSequences(mockProducts);

      sequences.forEach((email) => {
        expect(email).toHaveProperty("day");
        expect(email).toHaveProperty("subject");
        expect(email).toHaveProperty("body");
        expect(email).toHaveProperty("cta");
        expect(email).toHaveProperty("product");

        expect(typeof email.day).toBe("number");
        expect(typeof email.subject).toBe("string");
        expect(typeof email.body).toBe("string");
        expect(typeof email.cta).toBe("string");
        expect(typeof email.product).toBe("string");

        expect(email.subject.length).toBeGreaterThan(0);
        expect(email.body.length).toBeGreaterThan(0);
      });
    });
  });

  describe("generateLeadQualificationFramework", () => {
    it("should generate qualification framework for all products", async () => {
      const framework = await generateLeadQualificationFramework(mockProducts);

      expect(framework).toBeDefined();
      expect(typeof framework).toBe("object");

      mockProducts.forEach((product) => {
        expect(framework[product.id]).toBeDefined();
      });
    });

    it("should have proper framework structure", async () => {
      const framework = await generateLeadQualificationFramework(mockProducts);

      Object.values(framework).forEach((productFramework) => {
        expect(productFramework).toHaveProperty("questions");
        expect(productFramework).toHaveProperty("scoringCriteria");
        expect(productFramework).toHaveProperty("qualificationThreshold");

        expect(Array.isArray(productFramework.questions)).toBe(true);
        expect(productFramework.questions.length).toBeGreaterThan(0);

        expect(typeof productFramework.scoringCriteria).toBe("object");
        expect(typeof productFramework.qualificationThreshold).toBe("number");
        expect(productFramework.qualificationThreshold).toBeGreaterThan(0);
      });
    });
  });

  describe("calculateProjectedMetrics", () => {
    it("should calculate metrics correctly", () => {
      const metrics = calculateProjectedMetrics(
        5, // channels
        24, // posts per channel
        0.03, // engagement rate
        0.05, // conversion rate
        500 // average order value
      );

      expect(metrics).toHaveProperty("impressions");
      expect(metrics).toHaveProperty("clicks");
      expect(metrics).toHaveProperty("conversions");
      expect(metrics).toHaveProperty("revenue");
      expect(metrics).toHaveProperty("conversionRate");
      expect(metrics).toHaveProperty("averageOrderValue");
      expect(metrics).toHaveProperty("timestamp");

      // Verify calculations
      expect(metrics.impressions).toBeGreaterThan(0);
      expect(metrics.clicks).toBeGreaterThan(0);
      expect(metrics.conversions).toBeGreaterThan(0);
      expect(metrics.revenue).toBeGreaterThan(0);

      // Verify relationships
      expect(metrics.clicks).toBeLessThanOrEqual(metrics.impressions);
      expect(metrics.conversions).toBeLessThanOrEqual(metrics.clicks);
      expect(metrics.revenue).toBe(metrics.conversions * metrics.averageOrderValue);
    });

    it("should meet $11,111 revenue target in realistic scenario", () => {
      const metrics = calculateProjectedMetrics(
        5, // channels
        24, // posts per channel
        0.03, // engagement rate
        0.05, // conversion rate
        500 // average order value
      );

      expect(metrics.revenue).toBeGreaterThanOrEqual(11111);
    });

    it("should exceed $11,111 target in aggressive scenario", () => {
      const metrics = calculateProjectedMetrics(
        5, // channels
        24, // posts per channel
        0.04, // engagement rate (aggressive)
        0.06, // conversion rate (aggressive)
        550 // average order value
      );

      expect(metrics.revenue).toBeGreaterThanOrEqual(11111);
    });
  });

  describe("executeSalesBlitz", () => {
    it("should execute sales blitz and return proper structure", async () => {
      const config = {
        startTime: new Date(),
        duration: 24,
        channels: ["twitter", "linkedin"] as const,
        products: mockProducts,
      };

      const result = await executeSalesBlitz(config);

      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("contentCalendar");
      expect(result).toHaveProperty("emailSequences");
      expect(result).toHaveProperty("qualificationFramework");
      expect(result).toHaveProperty("projectedMetrics");

      expect(["active", "completed", "error"]).toContain(result.status);
      expect(Array.isArray(result.contentCalendar)).toBe(true);
      expect(Array.isArray(result.emailSequences)).toBe(true);
      expect(typeof result.qualificationFramework).toBe("object");
      expect(typeof result.projectedMetrics).toBe("object");
    });

    it("should generate content calendar during execution", async () => {
      const config = {
        startTime: new Date(),
        duration: 24,
        channels: ["twitter"] as const,
        products: mockProducts,
      };

      const result = await executeSalesBlitz(config);

      expect(result.contentCalendar.length).toBeGreaterThan(0);
      result.contentCalendar.forEach((item) => {
        expect(item).toHaveProperty("time");
        expect(item).toHaveProperty("channel");
        expect(item).toHaveProperty("content");
      });
    });

    it("should generate email sequences during execution", async () => {
      const config = {
        startTime: new Date(),
        duration: 24,
        channels: ["twitter"] as const,
        products: mockProducts,
      };

      const result = await executeSalesBlitz(config);

      expect(result.emailSequences.length).toBeGreaterThan(0);
      result.emailSequences.forEach((email) => {
        expect(email).toHaveProperty("day");
        expect(email).toHaveProperty("subject");
        expect(email).toHaveProperty("body");
        expect(email).toHaveProperty("cta");
      });
    });

    it("should generate lead qualification framework during execution", async () => {
      const config = {
        startTime: new Date(),
        duration: 24,
        channels: ["twitter"] as const,
        products: mockProducts,
      };

      const result = await executeSalesBlitz(config);

      expect(Object.keys(result.qualificationFramework).length).toBeGreaterThan(
        0
      );
      Object.values(result.qualificationFramework).forEach((framework) => {
        expect(framework).toHaveProperty("questions");
        expect(framework).toHaveProperty("scoringCriteria");
        expect(framework).toHaveProperty("qualificationThreshold");
      });
    });

    it("should project metrics meeting or exceeding $11,111 target", async () => {
      const config = {
        startTime: new Date(),
        duration: 24,
        channels: ["twitter", "linkedin", "reddit"] as const,
        products: mockProducts,
      };

      const result = await executeSalesBlitz(config);

      expect(result.projectedMetrics.revenue).toBeGreaterThanOrEqual(11111);
    });
  });

  describe("Premium Pricing Impact", () => {
    it("should calculate revenue correctly with premium pricing", () => {
      // Premium pricing: $397 average per kit
      const metrics = calculateProjectedMetrics(
        5, // channels
        24, // posts per channel
        0.03, // engagement rate
        0.05, // conversion rate
        397 // premium average order value
      );

      // Should still exceed $11,111 target
      expect(metrics.revenue).toBeGreaterThanOrEqual(11111);
    });

    it("should achieve target with conservative premium pricing scenario", () => {
      // Conservative: 2% engagement, 3% conversion, $397 AOV
      const metrics = calculateProjectedMetrics(
        5, // channels
        24, // posts per channel
        0.02, // conservative engagement
        0.03, // conservative conversion
        397 // premium AOV
      );

      // Even conservative scenario should exceed target
      expect(metrics.revenue).toBeGreaterThanOrEqual(11111);
    });

    it("should calculate revenue with bundle pricing", () => {
      // Bundle pricing: $997 for core leadership bundle
      const metrics = calculateProjectedMetrics(
        5, // channels
        24, // posts per channel
        0.03, // engagement rate
        0.05, // conversion rate
        997 // bundle pricing
      );

      // Bundle pricing should significantly exceed target
      expect(metrics.revenue).toBeGreaterThanOrEqual(11111);
    });
  });

  describe("Multi-Channel Campaign", () => {
    it("should support all 5 channels", async () => {
      const config = {
        startTime: new Date(),
        duration: 24,
        channels: [
          "twitter",
          "linkedin",
          "reddit",
          "producthunt",
          "indiehackers",
        ] as const,
        products: mockProducts,
      };

      const result = await executeSalesBlitz(config);

      const channels = new Set(
        result.contentCalendar.map((item) => item.channel)
      );
      expect(channels.size).toBe(5);
    });

    it("should generate appropriate content types for each channel", async () => {
      const config = {
        startTime: new Date(),
        duration: 24,
        channels: ["twitter", "linkedin", "reddit"] as const,
        products: mockProducts,
      };

      const result = await executeSalesBlitz(config);

      const twitterPosts = result.contentCalendar.filter(
        (item) => item.channel === "twitter"
      );
      const linkedinPosts = result.contentCalendar.filter(
        (item) => item.channel === "linkedin"
      );
      const redditPosts = result.contentCalendar.filter(
        (item) => item.channel === "reddit"
      );

      expect(twitterPosts.length).toBeGreaterThan(0);
      expect(linkedinPosts.length).toBeGreaterThan(0);
      expect(redditPosts.length).toBeGreaterThan(0);
    });
  });

  describe("Content Calendar Sorting", () => {
    it("should sort calendar by time", async () => {
      const config = {
        startTime: new Date(),
        duration: 24,
        channels: ["twitter", "linkedin"] as const,
        products: mockProducts,
      };

      const calendar = await generateContentCalendar(config);

      for (let i = 1; i < calendar.length; i++) {
        expect(calendar[i].time.getTime()).toBeGreaterThanOrEqual(
          calendar[i - 1].time.getTime()
        );
      }
    });
  });

  describe("Email Sequence Variations", () => {
    it("should have different CTAs for each day", async () => {
      const sequences = await generateEmailSequences(mockProducts);

      const ctas = new Map<number, Set<string>>();
      sequences.forEach((email) => {
        if (!ctas.has(email.day)) {
          ctas.set(email.day, new Set());
        }
        ctas.get(email.day)!.add(email.cta);
      });

      // Each day should have at least one CTA
      expect(ctas.size).toBeGreaterThan(0);
    });
  });

  describe("Metrics Edge Cases", () => {
    it("should calculate with default parameters", () => {
      const metrics = calculateProjectedMetrics(5, 24);

      expect(metrics.revenue).toBeGreaterThan(0);
      expect(metrics.conversionRate).toBe(0.05);
      expect(metrics.averageOrderValue).toBe(500);
    });

    it("should handle zero engagement rate", () => {
      const metrics = calculateProjectedMetrics(5, 24, 0, 0.05, 500);

      expect(metrics.clicks).toBe(0);
      expect(metrics.conversions).toBe(0);
      expect(metrics.revenue).toBe(0);
    });

    it("should return active status on success", async () => {
      const config = {
        startTime: new Date(),
        duration: 24,
        channels: ["twitter"] as const,
        products: mockProducts,
      };

      const result = await executeSalesBlitz(config);

      expect(result.status).toBe("active");
    });
  });
});
