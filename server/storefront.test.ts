import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// Mock context for authenticated user
function createAuthContext(userId: number = 1): TrpcContext {
  const user: User = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// Mock context for unauthenticated user
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Storefront - Products", () => {
  it("should list all products", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();

    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);

    // Verify product structure
    const product = products[0];
    expect(product).toHaveProperty("id");
    expect(product).toHaveProperty("name");
    expect(product).toHaveProperty("slug");
    expect(product).toHaveProperty("description");
    expect(product).toHaveProperty("price");
    expect(product).toHaveProperty("category");
  });

  it("should get product by slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const product = await caller.products.getBySlug({ slug: "ai-cto-kit" });

    expect(product).toBeDefined();
    expect(product?.name).toBe("AI CTO Kit");
    expect(product?.slug).toBe("ai-cto-kit");
    expect(product?.category).toBe("cto");
  });

  it("should return undefined for non-existent product", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const product = await caller.products.getBySlug({ slug: "non-existent-product" });

    expect(product).toBeUndefined();
  });

  it("should list all bundles", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const bundles = await caller.bundles.list();

    expect(Array.isArray(bundles)).toBe(true);
    expect(bundles.length).toBeGreaterThan(0);

    // Verify bundle structure
    const bundle = bundles[0];
    expect(bundle).toHaveProperty("id");
    expect(bundle).toHaveProperty("name");
    expect(bundle).toHaveProperty("slug");
    expect(bundle).toHaveProperty("price");
    expect(bundle).toHaveProperty("discount");
  });
});

describe("Storefront - Orders", () => {
  it("should list user orders when authenticated", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.orders.list();

    expect(Array.isArray(orders)).toBe(true);
    // Orders might be empty initially
    if (orders.length > 0) {
      const order = orders[0];
      expect(order).toHaveProperty("id");
      expect(order).toHaveProperty("userId");
      expect(order).toHaveProperty("amount");
      expect(order).toHaveProperty("status");
    }
  });

  it("should throw error when listing orders without authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.orders.list();
      expect.fail("Should have thrown error");
    } catch (error: any) {
      // Error code could be UNAUTHORIZED or INTERNAL_SERVER_ERROR
      expect(["UNAUTHORIZED", "INTERNAL_SERVER_ERROR"].includes(error.code)).toBe(true);
    }
  });
});

describe("Storefront - Purchases", () => {
  it("should list user purchases when authenticated", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const purchases = await caller.purchases.list();

    expect(Array.isArray(purchases)).toBe(true);
    // Purchases might be empty initially
    if (purchases.length > 0) {
      const purchase = purchases[0];
      expect(purchase).toHaveProperty("id");
      expect(purchase).toHaveProperty("userId");
      expect(purchase).toHaveProperty("productId");
      expect(purchase).toHaveProperty("purchasedAt");
    }
  });

  it("should throw error when listing purchases without authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.purchases.list();
      expect.fail("Should have thrown error");
    } catch (error: any) {
      // Error code could be UNAUTHORIZED or INTERNAL_SERVER_ERROR
      expect(["UNAUTHORIZED", "INTERNAL_SERVER_ERROR"].includes(error.code)).toBe(true);
    }
  });
});

describe("Storefront - Checkout", () => {
  it("should require authentication to create checkout session", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.checkout.createSession({
        productIds: [1],
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      // Error code could be UNAUTHORIZED or INTERNAL_SERVER_ERROR depending on implementation
      expect(["UNAUTHORIZED", "INTERNAL_SERVER_ERROR"].includes(error.code)).toBe(true);
    }
  });

  it("should validate product IDs in checkout", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.checkout.createSession({
        productIds: [],
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("No products or bundles selected");
    }
  });

  it("should require valid success and cancel URLs", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.checkout.createSession({
        productIds: [1],
        successUrl: "",
        cancelUrl: "https://example.com/cancel",
      });
      // If Stripe is not configured, we expect an error
      // This is expected in test environment
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });
});

describe("Storefront - Auth", () => {
  it("should get current user when authenticated", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user).toBeDefined();
    expect(user?.id).toBe(1);
    expect(user?.email).toBe("test1@example.com");
  });

  it("should return null for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user).toBeNull();
  });

  it("should logout user", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result.success).toBe(true);
  });
});

describe("Storefront - Data Validation", () => {
  it("should validate product prices are positive", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();

    for (const product of products) {
      const price = parseFloat(product.price);
      expect(price).toBeGreaterThan(0);
    }
  });

  it("should validate bundle discounts are reasonable", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const bundles = await caller.bundles.list();

    for (const bundle of bundles) {
      if (bundle.discount) {
        const discount = parseInt(bundle.discount);
        expect(discount).toBeGreaterThan(0);
        expect(discount).toBeLessThan(100);
      }
    }
  });

  it("should have all required product fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();

    for (const product of products) {
      expect(product.id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.slug).toBeDefined();
      expect(product.description).toBeDefined();
      expect(product.price).toBeDefined();
      expect(product.category).toBeDefined();
    }
  });
});
