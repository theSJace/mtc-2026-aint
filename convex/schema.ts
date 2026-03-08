import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Skim Pintar – Masjid Ar-Raudhah
 * Convex Database Schema v2
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
    // ── New v2 fields ──────────────────────────────────────
    /** GIRO mandate details; null if not registered */
    giro: v.optional(v.object({
      bankName: v.string(),
      accountNumberMasked: v.string(),
      accountHolderName: v.string(),
      mandateRef: v.string(),
      /** "ACTIVE" | "PENDING_MANDATE" | "CANCELLED" */
      status: v.string(),
      registeredAt: v.string(),
    })),
    /** Number of consecutive months where payment failed entirely (PayNow + both GIRO attempts) */
    consecutiveFailedMonths: v.optional(v.number()),
    /** True when deactivated due to 3 consecutive failed months */
    isDeactivated: v.optional(v.boolean()),
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
    /**
     * "SUBSCRIPTION" — the monthly membership fee ($5/$20)
     * "DONATION"     — optional additional donation
     */
    paymentCategory: v.string(),
    /** "PENDING" | "COMPLETED" | "FAILED" */
    status: v.string(),
    reference: v.string(),
    qrData: v.optional(v.string()),
    bankName: v.optional(v.string()),
    mandateRef: v.optional(v.string()),
    /** Which month this subscription payment covers (1-12); null for donations */
    periodMonth: v.optional(v.number()),
    /** Which year this subscription payment covers; null for donations */
    periodYear: v.optional(v.number()),
    /** For GIRO: which attempt number (1 = 15th, 2 = 30th) */
    giroAttempt: v.optional(v.number()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_reference", ["reference"])
    .index("by_status", ["status"])
    .index("by_user_and_period", ["userId", "periodMonth", "periodYear"]),
});
