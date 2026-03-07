import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Skim Pintar – Masjid Ar-Raudhah
 * Convex Database Schema
 */
export default defineSchema({
  users: defineTable({
    nric: v.string(),
    fullName: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    phone: v.string(),
    address: v.string(),
    postalCode: v.string(),
    dateOfBirth: v.string(),
    /** "NOT_REGISTERED" | "PINTAR" | "PINTAR_PLUS" */
    membershipStatus: v.string(),
    membershipId: v.string(),
    emailVerified: v.boolean(),
    preferredLanguage: v.string(), // "en" | "ms"
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_nric", ["nric"])
    .index("by_email", ["email"])
    .index("by_membership_id", ["membershipId"]),

  dependents: defineTable({
    userId: v.id("users"),
    fullName: v.string(),
    dateOfBirth: v.string(),
    relationship: v.string(),
    sameAddress: v.boolean(),
    address: v.string(),
    nric: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_nric", ["nric"]),

  payments: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    /** "PAYNOW" | "GIRO" */
    paymentType: v.string(),
    /** "PENDING" | "COMPLETED" | "FAILED" */
    status: v.string(),
    reference: v.string(),
    qrData: v.optional(v.string()),
    bankName: v.optional(v.string()),
    mandateRef: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_reference", ["reference"])
    .index("by_status", ["status"]),
});
