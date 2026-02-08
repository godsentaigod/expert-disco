import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // PRODUCTS ROUTER
  // ============================================================================
  products: router({
    list: publicProcedure.query(async () => {
      return db.getAllProducts();
    }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getProductBySlug(input.slug);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getProductById(input.id);
      }),

    getByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return db.getProductsByCategory(input.category);
      }),
  }),

  // ============================================================================
  // BUNDLES ROUTER
  // ============================================================================
  bundles: router({
    list: publicProcedure.query(async () => {
      return db.getAllBundles();
    }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getBundleBySlug(input.slug);
      }),
  }),

  // ============================================================================
  // CHECKOUT ROUTER
  // ============================================================================
  checkout: router({
    createSession: publicProcedure
      .input(
        z.object({
          productIds: z.array(z.number()).optional(),
          bundleId: z.number().optional(),
          successUrl: z.string(),
          cancelUrl: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

          // Add products to line items
          if (input.productIds && input.productIds.length > 0) {
            for (const productId of input.productIds) {
              const product = await db.getProductById(productId);
              if (product) {
                lineItems.push({
                  price_data: {
                    currency: "usd",
                    product_data: {
                      name: product.name,
                      description: product.description || undefined,
                      images: product.image ? [product.image] : undefined,
                    },
                    unit_amount: Math.round(parseFloat(product.price.toString()) * 100),
                  },
                  quantity: 1,
                });
              }
            }
          }

          // Add bundle to line items
          if (input.bundleId) {
            const bundle = await db.getBundleBySlug("");
            if (bundle) {
              lineItems.push({
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: bundle.name,
                    description: bundle.description || undefined,
                  },
                  unit_amount: Math.round(parseFloat(bundle.price.toString()) * 100),
                },
                quantity: 1,
              });
            }
          }

          if (lineItems.length === 0) {
            throw new Error("No products or bundles selected");
          }

          if (!stripe) {
            throw new Error("Stripe is not configured");
          }

          const sessionParams: any = {
            line_items: lineItems,
            mode: "payment",
            success_url: input.successUrl,
            cancel_url: input.cancelUrl,
            metadata: {
              userId: ctx.user?.id.toString() || "guest",
              productIds: input.productIds?.join(",") || "",
              bundleId: input.bundleId?.toString() || "",
            },
          };

          if (ctx.user?.email) {
            sessionParams.customer_email = ctx.user.email;
          }

          const session = await stripe.checkout.sessions.create(sessionParams);

          return {
            sessionId: session.id,
            url: session.url,
          };
        } catch (error) {
          console.error("[Checkout] Error creating session:", error);
          throw error;
        }
      }),

    handleWebhook: publicProcedure
      .input(z.object({ event: z.any() }))
      .mutation(async ({ input }) => {
        if (!stripe) {
          throw new Error("Stripe is not configured");
        }

        const event = input.event;

        try {
          if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const userId = parseInt(session.metadata?.userId || "0");

            if (userId === 0) {
              console.warn("[Webhook] No userId in metadata");
              return { success: false };
            }

            // Create order
            const orderResult = await db.createOrder({
              userId,
              stripeSessionId: session.id,
              stripePaymentIntentId: session.payment_intent,
              amount: session.amount_total / 100,
              currency: session.currency,
              status: "completed",
              customerEmail: session.customer_email,
              customerName: session.customer_details?.name,
            });

            // Get the order ID from the result
            const orderId = (orderResult as any).insertId || (orderResult as any)[0]?.id;
            if (!orderId) {
              throw new Error("Failed to create order");
            }

            // Get product IDs from metadata
            const productIds = session.metadata?.productIds
              ?.split(",")
              .map((id: string) => parseInt(id))
              .filter((id: number) => !isNaN(id)) || [];

            // Create order items and product purchases
            for (const productId of productIds) {
              const product = await db.getProductById(productId);
              if (product) {
                await db.createOrderItem({
                  orderId,
                  productId,
                  productName: product.name,
                  price: product.price,
                });

                // Create product purchase record
                await db.createProductPurchase({
                  userId,
                  productId,
                  orderId,
                  downloadToken: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                });
              }
            }

            return { success: true, orderId };
          }

          return { success: true };
        } catch (error) {
          console.error("[Webhook] Error processing event:", error);
          throw error;
        }
      }),
  }),

  // ============================================================================
  // ORDERS ROUTER
  // ============================================================================
  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserOrders(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (!order || order.userId !== ctx.user.id) {
          throw new Error("Order not found");
        }
        return order;
      }),
  }),

  // ============================================================================
  // PURCHASES ROUTER
  // ============================================================================
  purchases: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserPurchases(ctx.user.id);
    }),

    getDownloadUrl: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input, ctx }) => {
        const purchase = await db.getUserProductPurchase(ctx.user.id, input.productId);
        if (!purchase) {
          throw new Error("Product not purchased");
        }

        const product = await db.getProductById(input.productId);
        if (!product || !product.fileUrl) {
          throw new Error("Product file not available");
        }

        return {
          downloadUrl: product.fileUrl,
          productName: product.name,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
