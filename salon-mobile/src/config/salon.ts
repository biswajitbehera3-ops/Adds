/**
 * Per-salon configuration. Every salon gets its own deployment of this app,
 * and this file is the only thing that changes between them.
 *
 * Business, legal and retention details live in salon-details.json so the legal
 * pack (npm run legal) reads the same values.
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
  /** How long the service takes, for booking appointments. */
  minutes: number;
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
  /**
   * The reminder ladder for a customer who is due back: WhatsApp message 1 when due, message 2
   * `secondAfterDays` after it, then a phone call by the stylist who served them last
   * `callAfterDays` after message 2. After the call nobody reminds them until they visit.
   * Each step is locked for every staff member once done, so nobody repeats it.
   */
  reminderLadder: { secondAfterDays: number; callAfterDays: number };
  /** Thank-you after a paid visit for customers who opted in to messages. {name} {total} {balance} {code} {salon} */
  receiptTemplate: string;
  /** Plain receipt for customers who did not opt in: no offers, no referral pitch. */
  receiptTemplatePlain: string;
  /** Who runs the salon. Shown in the app's Privacy & terms screen and in every policy. */
  business: {
    legalName: string;
    address: string;
    city: string;
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
    effectiveDate: string;
    providerName: string;
    providerAddress: string;
    providerGstin: string;
    providerEmail: string;
    providerPhone: string;
    cloudProvider: string;
    cloudRegion: string;
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
  /** Appointments: bookable hours (salon local time), slot size, and the on-the-day reminder. */
  appointments: {
    open: string;
    close: string;
    slotMinutes: number;
    /** Days of the week the salon is closed (0 = Sunday … 6 = Saturday). */
    closedDays: number[];
    /** Sent after booking. {name} {service} {day} {time} {stylist} {salon} */
    confirmTemplate: string;
    /** Sent on the day. Same placeholders. */
    reminderTemplate: string;
    /** When the on-the-day reminder goes out (salon local time). */
    reminderAt: string;
  };
  /** Attendance: check-ins after start + grace count as late. 24h "HH:MM", salon local time. */
  shift: { start: string; graceMinutes: number };
  /** How long after payment staff may undo a visit themselves. */
  undoWindowMinutes: number;
};

import details from "./salon-details.json";

const config: SalonConfig = {
  displayName: details.salonName,
  publicUrl: "https://salon.example/r",

  services: [
    { id: "haircut", name: "Haircut", price: 300, cycleDays: 30, minutes: 30 },
    { id: "beard", name: "Beard trim", price: 150, cycleDays: 14, minutes: 15 },
    { id: "hair-colour", name: "Hair colour", price: 1200, cycleDays: 45, minutes: 90 },
    { id: "facial", name: "Facial", price: 900, cycleDays: 30, minutes: 45 },
    { id: "hair-spa", name: "Hair spa", price: 1000, cycleDays: 60, minutes: 60 },
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

  reminderLadder: { secondAfterDays: 30, callAfterDays: 30 },

  receiptTemplate:
    "Thanks for visiting {salon}, {name}! Paid {total}. Wallet balance: {balance}. Share your code {code} with friends: you both get wallet credit on their first visit. Reply STOP to stop offers.",

  receiptTemplatePlain: "Thanks for visiting {salon}, {name}. Paid {total}. Wallet balance: {balance}.",

  business: details.business,
  legal: details.legal,
  retention: details.retention,

  appointments: {
    open: "10:00",
    close: "20:00",
    slotMinutes: 30,
    closedDays: [2],
    confirmTemplate: "Booked! {name}, your {service} at {salon} is on {day} at {time}{stylist}. Reply C to cancel.",
    reminderTemplate: "Hi {name}, a reminder: your {service} at {salon} is today at {time}{stylist}. See you soon! Reply C to cancel.",
    reminderAt: "09:00",
  },

  shift: { start: "10:00", graceMinutes: 15 },

  undoWindowMinutes: 2,
};

export default config;
