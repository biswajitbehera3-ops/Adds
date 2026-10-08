/**
 * Per-salon configuration. Every salon gets its own deployment of this app,
 * and this file is the only thing that changes between them.
 *
 * All money is in whole rupees. The numbers below are placeholder defaults,
 * not confirmed business rules — set them per salon before go-live.
 */

export type Service = {
  id: string;
  name: string;
  price: number;
  /** Days until a customer is due back for this service. Drives Reminders. */
  cycleDays: number;
};

export type AddOn = {
  id: string;
  name: string;
  price: number;
  /** Services at whose checkout this add-on is suggested as an upsell. */
  suggestWith: string[];
};

export type Staff = { id: string; name: string; chair: string };

export type TopUpTier = {
  /** Minimum deposit for this tier. */
  minDeposit: number;
  /** Bonus as a percentage of the deposit, rounded down to whole rupees. */
  bonusPercent: number;
};

export type SalonConfig = {
  /** Neutral placeholder until branding is finalised. */
  displayName: string;
  /** Used in referral share links. */
  publicUrl: string;
  services: Service[];
  addOns: AddOn[];
  staff: Staff[];
  topUpTiers: TopUpTier[];
  referral: {
    /** Credited to the existing customer who referred the new one. */
    referrerReward: number;
    /** Credited to the new customer. */
    newCustomerReward: number;
  };
  reminderTemplate: string;
};

const config: SalonConfig = {
  displayName: "Salon",
  publicUrl: "http://localhost:3000",

  services: [
    { id: "haircut", name: "Haircut", price: 300, cycleDays: 30 },
    { id: "beard", name: "Beard trim", price: 150, cycleDays: 14 },
    { id: "hair-colour", name: "Hair colour", price: 1200, cycleDays: 45 },
    { id: "facial", name: "Facial", price: 900, cycleDays: 30 },
    { id: "hair-spa", name: "Hair spa", price: 1000, cycleDays: 60 },
  ],

  addOns: [
    { id: "head-massage", name: "Head massage", price: 150, suggestWith: ["haircut", "hair-colour"] },
    { id: "hair-wash", name: "Hair wash", price: 100, suggestWith: ["haircut", "beard"] },
    { id: "beard-styling", name: "Beard styling", price: 100, suggestWith: ["haircut", "beard"] },
    { id: "colour-protect", name: "Colour-protect mask", price: 300, suggestWith: ["hair-colour", "hair-spa"] },
    { id: "cleanup", name: "Face clean-up", price: 250, suggestWith: ["facial", "beard"] },
  ],

  staff: [
    { id: "s1", name: "Stylist 1", chair: "Chair 1" },
    { id: "s2", name: "Stylist 2", chair: "Chair 2" },
    { id: "s3", name: "Stylist 3", chair: "Chair 3" },
  ],

  topUpTiers: [
    { minDeposit: 1000, bonusPercent: 5 },
    { minDeposit: 2000, bonusPercent: 10 },
    { minDeposit: 5000, bonusPercent: 15 },
  ],

  referral: {
    referrerReward: 100,
    newCustomerReward: 100,
  },

  reminderTemplate:
    "Hi {name}, it's been a while since your last {service} with us. Want us to keep a slot for you this week?",
};

export default config;
