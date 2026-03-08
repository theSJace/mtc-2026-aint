import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** List all payments for a user, newest first */
export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

/** Check if user has a completed SUBSCRIPTION payment for a specific month/year */
export const hasSubscriptionForPeriod = query({
  args: { userId: v.id("users"), periodMonth: v.number(), periodYear: v.number() },
  handler: async (ctx, { userId, periodMonth, periodYear }) => {
    const results = await ctx.db
      .query("payments")
      .withIndex("by_user_and_period", (q) =>
        q.eq("userId", userId).eq("periodMonth", periodMonth).eq("periodYear", periodYear)
      )
      .collect();
    return results.some(
      (p) => p.status === "COMPLETED" && p.paymentCategory === "SUBSCRIPTION"
    );
  },
});

/** Create a pending PayNow payment */
export const createPayNow = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    /** "SUBSCRIPTION" | "DONATION" */
    paymentCategory: v.string(),
    reference: v.string(),
    qrData: v.string(),
    periodMonth: v.optional(v.number()),
    periodYear: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return ctx.db.insert("payments", {
      userId: args.userId,
      amount: args.amount,
      paymentType: "PAYNOW",
      paymentCategory: args.paymentCategory,
      status: "PENDING",
      reference: args.reference,
      qrData: args.qrData,
      periodMonth: args.periodMonth,
      periodYear: args.periodYear,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Create a GIRO deduction payment (attempted automatically on 15th/30th) */
export const createGiro = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    reference: v.string(),
    bankName: v.string(),
    mandateRef: v.string(),
    periodMonth: v.number(),
    periodYear: v.number(),
    /** 1 = 15th attempt, 2 = 30th retry */
    giroAttempt: v.number(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return ctx.db.insert("payments", {
      userId: args.userId,
      amount: args.amount,
      paymentType: "GIRO",
      paymentCategory: "SUBSCRIPTION",
      status: "PENDING",
      reference: args.reference,
      bankName: args.bankName,
      mandateRef: args.mandateRef,
      periodMonth: args.periodMonth,
      periodYear: args.periodYear,
      giroAttempt: args.giroAttempt,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Mark a payment as COMPLETED */
export const markCompleted = mutation({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, { paymentId }) => {
    await ctx.db.patch(paymentId, {
      status: "COMPLETED",
      updatedAt: new Date().toISOString(),
    });
  },
});

/** Mark a payment as FAILED */
export const markFailed = mutation({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, { paymentId }) => {
    await ctx.db.patch(paymentId, {
      status: "FAILED",
      updatedAt: new Date().toISOString(),
    });
  },
});
