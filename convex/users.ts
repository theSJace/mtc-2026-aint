import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Get user by email (for login) */
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();
  },
});

/** Get user by NRIC (for duplicate detection) */
export const getByNric = query({
  args: { nric: v.string() },
  handler: async (ctx, { nric }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_nric", (q) => q.eq("nric", nric.toUpperCase()))
      .first();
  },
});

/** Get user by their Convex document ID */
export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

/** Create a new user */
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
    preferredLanguage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("users", {
      nric: args.nric.toUpperCase(),
      fullName: args.fullName,
      email: args.email.toLowerCase(),
      passwordHash: args.passwordHash,
      phone: args.phone,
      address: args.address,
      postalCode: args.postalCode,
      dateOfBirth: args.dateOfBirth,
      membershipStatus: "NOT_REGISTERED",
      membershipId: args.membershipId,
      emailVerified: false,
      preferredLanguage: args.preferredLanguage ?? "en",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Update membership status */
export const updateMembership = mutation({
  args: {
    userId: v.id("users"),
    membershipStatus: v.string(),
  },
  handler: async (ctx, { userId, membershipStatus }) => {
    await ctx.db.patch(userId, {
      membershipStatus,
      updatedAt: new Date().toISOString(),
    });
  },
});

/** Update preferred language */
export const updateLanguage = mutation({
  args: { userId: v.id("users"), language: v.string() },
  handler: async (ctx, { userId, language }) => {
    await ctx.db.patch(userId, {
      preferredLanguage: language,
      updatedAt: new Date().toISOString(),
    });
  },
});
