export type PaymentMethod = "CASH" | "UPI" | "CARD";
export const PAYMENT_METHODS: PaymentMethod[] = ["CASH", "UPI", "CARD"];

export type Customer = {
  id: string;
  /** 10-digit Indian mobile number. */
  phone: string;
  name: string;
  referralCode: string;
  /** Always equals the sum of this customer's wallet transactions. */
  walletBalance: number;
  /** DPDP: when the customer agreed to the salon keeping their details for visits and the wallet. */
  consentAt: string | null;
  /** DPDP: separate, optional consent to WhatsApp reminders and offers. Null = no messages. */
  marketingConsentAt: string | null;
  /** Version of the privacy notice shown when consent was taken (config.legal.noticeVersion). */
  consentNotice: string;
  /** Staff member who took the consent, or null for the owner / older records. */
  consentTakenBy: string | null;
  /** The customer is under 18: the record is kept under a parent's or guardian's number, with their consent. */
  guardianConsent: boolean;
  /** Set when the customer's personal data was erased. The visits stay, without name or number, for the accounts. */
  deletedAt: string | null;
  referredById: string | null;
  /** Set once the referral reward is paid (on this customer's first paid visit). */
  referralRewardedAt: string | null;
  createdAt: string;
};

/**
 * A visit opens when the customer walks in (OPEN), is settled after the service
 * (PAID), and can be cancelled before payment or voided after it (VOID).
 */
export type VisitStatus = "OPEN" | "PAID" | "VOID";

export type Visit = {
  id: string;
  customerId: string;
  serviceIds: string[];
  /** The stylist who did the work. */
  staffId: string;
  addOnIds: string[];
  /** Service + add-ons. Recomputed while OPEN, frozen at payment. */
  total: number;
  walletPaid: number;
  directPaid: number;
  paymentMethod: PaymentMethod | null;
  status: VisitStatus;
  /** When the customer walked in. */
  createdAt: string;
  paidAt: string | null;
  voidedAt: string | null;
  voidReason: string | null;
};

export type WalletTxType =
  | "TOPUP"
  | "BONUS"
  | "SPEND"
  | "REFERRAL_REWARD"
  | "REFUND"
  | "REFERRAL_REVERSAL"
  /** Unused paid money handed back to the customer when the wallet is closed. */
  | "CASHOUT"
  /** Unused bonus / referral credit cancelled when the wallet is closed (not refundable). */
  | "WRITE_OFF";

export type WalletTx = {
  id: string;
  customerId: string;
  type: WalletTxType;
  /** Signed: credits positive, spends negative. */
  amount: number;
  visitId: string | null;
  note: string | null;
  createdAt: string;
};

export type ReminderLog = {
  id: string;
  customerId: string;
  serviceId: string;
  message: string;
  /** OPENED = handed to WhatsApp with the message prefilled. */
  status: "OPENED" | "SIMULATED";
  createdAt: string;
};

export type Secret = { salt: string; hash: string };

export type Staff = {
  id: string;
  name: string;
  /** Login id: 10-digit mobile number. */
  phone: string;
  chair: string;
  secret: Secret;
  active: boolean;
  createdAt: string;
};

export type Attendance = {
  id: string;
  staffId: string;
  /** Salon-local (IST) calendar day, YYYY-MM-DD. */
  date: string;
  checkInAt: string;
  /** Key of the stored selfie, or null when none was saved. */
  photoKey: string | null;
};

/**
 * Privacy audit trail: proof of consent and of each request handled. Holds ids
 * and times only, never names or numbers, so it can outlive an erased customer.
 */
export type PrivacyEvent = {
  id: string;
  customerId: string;
  type: "CONSENT_GIVEN" | "MARKETING_ON" | "MARKETING_OFF" | "DATA_SHARED" | "WALLET_CLOSED" | "DELETED" | "AUTO_ERASED";
  /** Staff id, "owner", "auto", or null. */
  by: string | null;
  at: string;
};

export type Data = {
  version: 3;
  customers: Customer[];
  visits: Visit[];
  walletTxs: WalletTx[];
  reminders: ReminderLog[];
  staff: Staff[];
  attendance: Attendance[];
  privacyLog: PrivacyEvent[];
  /** Null until the owner sets a password on first launch. */
  owner: { secret: Secret } | null;
  /** True while the store holds generated demo data. */
  demo: boolean;
};

export const emptyData = (): Data => ({
  version: 3,
  customers: [],
  visits: [],
  walletTxs: [],
  reminders: [],
  staff: [],
  attendance: [],
  privacyLog: [],
  owner: null,
  demo: false,
});

export type Session = { role: "owner" } | { role: "staff"; staffId: string };
