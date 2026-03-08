import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) =>
    ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).first(),
});

export const getByNric = query({
  args: { nric: v.string() },
  handler: async (ctx, { nric }) =>
    ctx.db.query("users").withIndex("by_nric", (q) => q.eq("nric", nric)).first(),
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => ctx.db.get(userId),
});

export const create = mutation({
  args: {
    nric: v.string(),
    fullName: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    phone: v.string(),
    address: v.string(),
    postalCode: v.string(),
    dateOfBirth: v.string(),
    membershipId: v.string(),
    preferredLanguage: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return ctx.db.insert("users", {
      ...args,
      membershipStatus: "NOT_REGISTERED",
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
      consecutiveFailedMonths: 0,
      isDeactivated: false,
    });
  },
});

export const updateMembership = mutation({
  args: { userId: v.id("users"), membershipStatus: v.string() },
  handler: async (ctx, { userId, membershipStatus }) => {
    await ctx.db.patch(userId, {
      membershipStatus,
      consecutiveFailedMonths: 0,
      isDeactivated: false,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateLanguage = mutation({
  args: { userId: v.id("users"), language: v.string() },
  handler: async (ctx, { userId, language }) => {
    await ctx.db.patch(userId, { preferredLanguage: language, updatedAt: new Date().toISOString() });
  },
});

/** Register or update a GIRO mandate on the user profile */
export const registerGiro = mutation({
  args: {
    userId: v.id("users"),
    bankName: v.string(),
    accountNumberMasked: v.string(),
    accountHolderName: v.string(),
    mandateRef: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      giro: {
        bankName: args.bankName,
        accountNumberMasked: args.accountNumberMasked,
        accountHolderName: args.accountHolderName,
        mandateRef: args.mandateRef,
        status: "ACTIVE",
        registeredAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    });
  },
});

/** Cancel a GIRO mandate */
export const cancelGiro = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user?.giro) return;
    await ctx.db.patch(userId, {
      giro: { ...user.giro, status: "CANCELLED" },
      updatedAt: new Date().toISOString(),
    });
  },
});

/**
 * Record a GIRO failure for a month.
 * Increments consecutiveFailedMonths; deactivates subscription if >= 3.
 */
export const recordGiroFailure = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return;
    const count = (user.consecutiveFailedMonths ?? 0) + 1;
    const updates: Record<string, unknown> = {
      consecutiveFailedMonths: count,
      updatedAt: new Date().toISOString(),
    };
    if (count >= 3) {
      updates.membershipStatus = "NOT_REGISTERED";
      updates.isDeactivated = true;
    }
    await ctx.db.patch(userId, updates as Parameters<typeof ctx.db.patch>[1]);
  },
});

/** Reset consecutive failed month counter (called on successful payment) */
export const resetFailedMonths = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, {
      consecutiveFailedMonths: 0,
      isDeactivated: false,
      updatedAt: new Date().toISOString(),
    });
  },
});
