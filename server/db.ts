import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, orders, orderItems, productPurchases, emailLogs, bundles } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER FUNCTIONS
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// PRODUCT FUNCTIONS
// ============================================================================

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(products).where(eq(products.active, 1)).orderBy(desc(products.featured));
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(products).where(
    and(eq(products.category, category as any), eq(products.active, 1))
  );
}

export async function createProduct(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(products).values(data);
  return result;
}

// ============================================================================
// BUNDLE FUNCTIONS
// ============================================================================

export async function getAllBundles() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(bundles).where(eq(bundles.active, 1)).orderBy(desc(bundles.featured));
}

export async function getBundleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(bundles).where(eq(bundles.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// ORDER FUNCTIONS
// ============================================================================

export async function createOrder(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orders).values(data);
  return result;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByStripeSessionId(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(orders).where(eq(orders.stripeSessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(orders).set({ status: status as any }).where(eq(orders.id, orderId));
}

// ============================================================================
// ORDER ITEMS FUNCTIONS
// ============================================================================

export async function createOrderItem(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(orderItems).values(data);
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// ============================================================================
// PRODUCT PURCHASE FUNCTIONS
// ============================================================================

export async function createProductPurchase(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(productPurchases).values(data);
}

export async function getUserPurchases(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(productPurchases).where(eq(productPurchases.userId, userId));
}

export async function getUserProductPurchase(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(productPurchases).where(
    and(eq(productPurchases.userId, userId), eq(productPurchases.productId, productId))
  ).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getPurchaseByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(productPurchases).where(eq(productPurchases.downloadToken, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// EMAIL LOG FUNCTIONS
// ============================================================================

export async function createEmailLog(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(emailLogs).values(data);
}

export async function updateEmailLog(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(emailLogs).set(data).where(eq(emailLogs.id, id));
}
