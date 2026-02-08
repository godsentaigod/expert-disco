import { drizzle } from "drizzle-orm/mysql2";
import { products, bundles } from "./drizzle/schema.ts";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function seed() {
  try {
    const connection = await mysql.createConnection(DATABASE_URL);
    const db = drizzle(connection);

    console.log("Seeding products...");

    // Clear existing products
    await connection.execute("DELETE FROM products");
    await connection.execute("DELETE FROM bundles");

    // Insert products
    const productsData = [
      {
        name: "AI CTO Kit",
        slug: "ai-cto-kit",
        description: "Comprehensive prompt pack and workflow templates for replacing a technical CTO role",
        longDescription: `# AI CTO Kit

Replace your expensive CTO with AI-powered technical decision-making. This comprehensive kit includes:

## What's Included

- **12 Core Prompts** for technical strategy and architecture decisions
- **8 Specialized Modules** covering startup vs. enterprise, budget optimization, and risk management
- **15 Utility Prompts** for quick technical fixes and decisions
- **Complete Implementation Roadmap** to get started immediately
- **8,000+ Words** of actionable technical guidance

## Use Cases

- System architecture design and optimization
- Technology stack selection
- Technical debt management
- Development workflow automation
- Security and compliance decisions
- Performance optimization strategies

## Who Should Buy

- Startup founders without technical backgrounds
- Product managers needing technical guidance
- Small teams without dedicated CTOs
- Organizations looking to optimize technical decisions`,
        price: "47.00",
        category: "cto",
        featured: 1,
        active: 1,
      },
      {
        name: "AI Growth Lead Kit",
        slug: "ai-growth-lead-kit",
        description: "Complete growth strategy toolkit with prompts for user acquisition and conversion optimization",
        longDescription: `# AI Growth Lead Kit

Replace your Growth Lead with AI-powered growth strategies. This complete toolkit includes:

## What's Included

- **12 Core Prompts** for growth strategy and experimentation
- **8 Specialized Modules** for B2B vs. B2C, early stage vs. scale
- **15 Utility Prompts** for growth optimization
- **Metrics Dashboards and Frameworks** for tracking progress
- **8,000+ Words** of growth strategy guidance

## Use Cases

- User acquisition strategy
- Viral loop design
- Conversion rate optimization
- Growth experimentation frameworks
- Retention and churn reduction
- Revenue optimization

## Who Should Buy

- Startup founders
- Product managers
- Marketing teams
- Growth-focused organizations`,
        price: "47.00",
        category: "growth",
        featured: 1,
        active: 1,
      },
      {
        name: "AI Product Manager Kit",
        slug: "ai-product-manager-kit",
        description: "Product management role replacement with frameworks, templates, and decision-making guides",
        longDescription: `# AI Product Manager Kit

Replace your Product Manager with AI-powered product strategy. This comprehensive kit includes:

## What's Included

- **12 Core Prompts** for product strategy and roadmapping
- **8 Specialized Modules** for different product types and markets
- **15 Utility Prompts** for product decisions
- **User Story Templates and Frameworks** for feature development
- **8,000+ Words** of product management guidance

## Use Cases

- Feature prioritization and roadmapping
- User story generation
- Market analysis and positioning
- Stakeholder communication
- Product strategy development
- Competitive analysis

## Who Should Buy

- Startup founders
- Technical leaders without PM experience
- Small teams without dedicated PMs
- Organizations optimizing product decisions`,
        price: "47.00",
        category: "pm",
        featured: 1,
        active: 1,
      },
      {
        name: "Workflow Blueprint Pack",
        slug: "workflow-blueprint-pack",
        description: "Ready-to-deploy automation blueprints for common business workflows and processes",
        longDescription: `# Workflow Blueprint Pack

Ready-to-deploy automation blueprints that save 15-25 hours per week. This pack includes:

## What's Included

- **5 Ready-to-Deploy Workflows** with step-by-step implementation
- **Content Creation Pipeline** (saves 15-20 hours/week)
- **Customer Onboarding Sequence** (saves 10-15 hours/week)
- **Lead Qualification & Nurture** (saves 20-25 hours/week)
- **Support Automation** (saves 15-20 hours/week)
- **Social Media Management** (saves 10-15 hours/week)
- **6,000+ Words** with implementation guides

## Use Cases

- Automating repetitive business processes
- Scaling operations without hiring
- Improving consistency and quality
- Reducing manual work and errors
- Accelerating business growth

## Who Should Buy

- Solopreneurs and small business owners
- Operations teams
- Marketing and sales teams
- Organizations looking to scale efficiently`,
        price: "29.00",
        category: "workflows",
        featured: 1,
        active: 1,
      },
      {
        name: "Prompt Library",
        slug: "prompt-library",
        description: "Curated collection of 100+ production-ready prompts organized by business function",
        longDescription: `# Prompt Library

Your go-to resource for 100+ production-ready prompts. Organized by business function:

## What's Included

- **100+ Production-Ready Prompts** organized by function
- **Marketing Prompts** (content, ads, strategy)
- **Sales Prompts** (prospecting, conversations, strategy)
- **Operations Prompts** (automation, team management)
- **Strategy Prompts** (business planning, decisions)
- **Customer Success Prompts** (onboarding, support)
- **5,000+ Words** of ready-to-use content
- **Usage Examples** and customization guides

## Use Cases

- Quick access to high-quality prompts
- Consistent prompt quality across teams
- Training new team members
- Improving AI output quality
- Accelerating content creation

## Who Should Buy

- Teams using AI regularly
- Content creators and marketers
- Sales and customer success teams
- Anyone working with AI language models`,
        price: "29.00",
        category: "prompts",
        featured: 1,
        active: 1,
      },
    ];

    for (const product of productsData) {
      await db.insert(products).values(product);
      console.log(`✓ Created product: ${product.name}`);
    }

    // Create bundles
    const bundlesData = [
      {
        name: "Complete AI Business System",
        slug: "complete-ai-system",
        description: "All 5 products combined for maximum savings",
        price: "99.00",
        productIds: JSON.stringify([1, 2, 3, 4, 5]),
        discount: "45",
        featured: 1,
        active: 1,
      },
      {
        name: "Core Leadership Bundle",
        slug: "core-leadership",
        description: "CTO, Growth Lead, and Product Manager kits",
        price: "79.00",
        productIds: JSON.stringify([1, 2, 3]),
        discount: "35",
        featured: 1,
        active: 1,
      },
      {
        name: "Automation Bundle",
        slug: "automation-bundle",
        description: "Workflows and Prompt Library for immediate productivity",
        price: "39.00",
        productIds: JSON.stringify([4, 5]),
        discount: "25",
        featured: 0,
        active: 1,
      },
    ];

    for (const bundle of bundlesData) {
      await db.insert(bundles).values(bundle);
      console.log(`✓ Created bundle: ${bundle.name}`);
    }

    console.log("\n✅ Seeding completed successfully!");
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
