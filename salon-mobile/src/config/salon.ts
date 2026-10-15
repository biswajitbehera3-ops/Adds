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
  /** Base URL for referral share links. */
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
  /** Marketing: only sent to customers who opted in. Must say how to stop. */
  reminderTemplate: string;
  /** Thank-you after a paid visit for customers who opted in to messages. {name} {total} {balance} {code} {salon} */
  receiptTemplate: string;
  /** Plain receipt for customers who did not opt in: no offers, no referral pitch. */
  receiptTemplatePlain: string;
  /** Who runs the salon. Shown in the app's Privacy & terms screen and in every policy. */
  business: {
    legalName: string;
    address: string;
    /** GSTIN, if registered. */
    gstin: string;
    phone: string;
    email: string;
    /** DPDP grievance contact for privacy requests and complaints. */
    grievance: { name: string; phone: string; email: string };
  };
  legal: {
    /** Bump when the privacy notice text changes; stored with each consent. */
    noticeVersion: string;
    privacyUrl: string;
    termsUrl: string;
    /** The app maker (data processor) and its support contact. */
    providerName: string;
    providerEmail: string;
  };
  /** How long data is kept before it is erased automatically. */
  retention: {
    /** Customers with no visit or wallet activity for this long are erased (wallet must be ₹0). */
    inactiveCustomerDays: number;
    /** Attendance selfies are deleted after this many days; the check-in time stays. */
    attendancePhotoDays: number;
    /** Copies of sent reminder messages are deleted after this many days. */
    reminderLogDays: number;
  };
  /** Attendance: check-ins after start + grace count as late. 24h "HH:MM", salon local time. */
  shift: { start: string; graceMinutes: number };
  /** How long after payment staff may undo a visit themselves. */
  undoWindowMinutes: number;
};

const config: SalonConfig = {
  displayName: "Salon",
  publicUrl: "https://salon.example/r",

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

  // Demo stylists only. Real staff are added by the owner inside the app.
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
    "Hi {name}, it's been a while since your last {service} with us. Want us to keep a slot for you this week? Reply STOP to stop these messages.",

  receiptTemplate:
    "Thanks for visiting {salon}, {name}! Paid {total}. Wallet balance: {balance}. Share your code {code} with friends: you both get wallet credit on their first visit. Reply STOP to stop offers.",

  receiptTemplatePlain: "Thanks for visiting {salon}, {name}. Paid {total}. Wallet balance: {balance}.",

  // Fill in per salon before go-live. Every value here appears in the app and the policies.
  business: {
    legalName: "[Salon legal name]",
    address: "[Full shop address, city, PIN]",
    gstin: "",
    phone: "[Salon phone]",
    email: "[Salon email]",
    grievance: { name: "[Owner name]", phone: "[Owner phone]", email: "[Owner email]" },
  },

  legal: {
    noticeVersion: "2026-10-15",
    privacyUrl: "[https://… privacy policy page]",
    termsUrl: "[https://… terms page]",
    providerName: "[Your business name]",
    providerEmail: "[Your support email]",
  },

  retention: {
    inactiveCustomerDays: 3 * 365,
    attendancePhotoDays: 365,
    reminderLogDays: 365,
  },

  shift: { start: "10:00", graceMinutes: 15 },

  undoWindowMinutes: 2,
};

export default config;
