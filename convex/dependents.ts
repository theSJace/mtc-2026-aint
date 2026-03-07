import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** List all dependents for a user */
export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("dependents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

/** Check if an NRIC is already a dependent */
export const getByNric = query({
  args: { nric: v.string() },
  handler: async (ctx, { nric }) => {
    return await ctx.db
      .query("dependents")
      .withIndex("by_nric", (q) => q.eq("nric", nric.toUpperCase()))
      .first();
  },
});

/** Add a dependent */
export const add = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.string(),
    dateOfBirth: v.string(),
    relationship: v.string(),
    sameAddress: v.boolean(),
    address: v.string(),
    nric: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("dependents", {
      userId: args.userId,
      fullName: args.fullName,
      dateOfBirth: args.dateOfBirth,
      relationship: args.relationship,
      sameAddress: args.sameAddress,
      address: args.address,
      nric: args.nric ? args.nric.toUpperCase() : undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Update a dependent */
export const update = mutation({
  args: {
    dependentId: v.id("dependents"),
    fullName: v.string(),
    dateOfBirth: v.string(),
    relationship: v.string(),
    sameAddress: v.boolean(),
    address: v.string(),
    nric: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.dependentId, {
      fullName: args.fullName,
      dateOfBirth: args.dateOfBirth,
      relationship: args.relationship,
      sameAddress: args.sameAddress,
      address: args.address,
      nric: args.nric ? args.nric.toUpperCase() : undefined,
      updatedAt: new Date().toISOString(),
    });
  },
});

/** Remove a dependent */
export const remove = mutation({
  args: { dependentId: v.id("dependents") },
  handler: async (ctx, { dependentId }) => {
    await ctx.db.delete(dependentId);
  },
});
