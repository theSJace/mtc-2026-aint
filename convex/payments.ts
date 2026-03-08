import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** List payments for a user (newest first) */
export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return payments.sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  },
});

/** Record a PayNow payment */
export const createPayNow = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    reference: v.string(),
    qrData: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("payments", {
      userId: args.userId,
      amount: args.amount,
      paymentType: "PAYNOW",
      status: "PENDING",
      reference: args.reference,
      qrData: args.qrData,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Record a GIRO mandate */
export const createGiro = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    reference: v.string(),
    bankName: v.string(),
    mandateRef: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("payments", {
      userId: args.userId,
      amount: args.amount,
      paymentType: "GIRO",
      status: "PENDING",
      reference: args.reference,
      bankName: args.bankName,
      mandateRef: args.mandateRef,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Mark a payment as completed */
export const markCompleted = mutation({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, { paymentId }) => {
    await ctx.db.patch(paymentId, {
      status: "COMPLETED",
      updatedAt: new Date().toISOString(),
    });
  },
});

/** Mark a payment as failed */
export const markFailed = mutation({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, { paymentId }) => {
    await ctx.db.patch(paymentId, {
      status: "FAILED",
      updatedAt: new Date().toISOString(),
    });
  },
});
