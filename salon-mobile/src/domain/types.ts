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
  /** When the new customer confirmed their number with the WhatsApp code sent for a referral. */
  referralVerifiedAt?: string | null;
  /** Set once the referral reward is paid (on this customer's first paid visit). */
  referralRewardedAt: string | null;
  createdAt: string;
};

/**
 * A visit opens when the customer walks in (OPEN), is settled after the service
 * (PAID), and can be voided after it (VOID). A customer who leaves before being
 * served is kept on record as LEFT (who, when, how long they sat), never deleted.
 */
export type VisitStatus = "OPEN" | "PAID" | "VOID" | "LEFT";

/** A service not in the salon's list ("Other"): needs the owner's approval before payment. */
export type VisitExtra = { name: string; price: number; approvedAt: string | null };

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
  /** Who cancelled the bill: "owner", or the stylist's id for a 2-minute undo. */
  voidedBy?: string | null;
  /** LEFT: when the customer left without service, and which staff member recorded it. */
  leftAt?: string | null;
  leftBy?: string | null;
  /** "Other" services typed in at the counter. */
  extras?: VisitExtra[];
  /** Set when the customer confirmed a wallet spend above the salon's limit with a WhatsApp code. */
  walletCodeAt?: string | null;
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
  /** OPENED = handed to WhatsApp with the message prefilled. CALLED = the stylist phoned them (last step). */
  status: "OPENED" | "SIMULATED" | "CALLED";
  /** Staff member who sent it (null for the owner, or for reminders logged before this was kept). */
  sentBy?: string | null;
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
  /** Profile photo the owner uploads (BUILD-SPEC 6.5); null/absent shows initials. */
  photoKey?: string | null;
  /** Shift start "HH:MM" for this stylist; absent = the salon's shift. */
  shiftStart?: string;
  /** This stylist's weekly off (0 = Sunday … 6); absent = the salon's closed days. */
  weeklyOff?: number | null;
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
 * A booked visit. Usually made when a customer answers a WhatsApp reminder with a
 * day and time; staff enter it from the reply. On the day, the customer gets an
 * appointment reminder (sent by staff with one tap, or automatically once the
 * WhatsApp Business connection is set up).
 */
export type Appointment = {
  id: string;
  customerId: string;
  serviceIds: string[];
  /** Stylist booked, or null for "anyone free". */
  staffId: string | null;
  /** Start time (ISO). */
  at: string;
  /** Booked length in minutes: the services' durations added up. */
  minutes: number;
  status: "BOOKED" | "ARRIVED" | "CANCELLED" | "NO_SHOW";
  /** How the booking came in. */
  source: "WHATSAPP" | "PHONE" | "COUNTER";
  /** The customer's own words, e.g. "Yes, Saturday 5 pm" (optional, kept short). */
  note: string | null;
  /** When the on-the-day reminder went out, and how. */
  reminderSentAt: string | null;
  reminderChannel: "MANUAL" | "AUTO" | null;
  /** The visit opened when the customer arrived. */
  visitId: string | null;
  createdBy: string | null;
  createdAt: string;
  /** Who closed the booking as No-show or Cancelled ("owner" or the stylist's id), and when (SECURITY-LESSONS 4). */
  closedBy?: string | null;
  closedAt?: string | null;
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

/** A stylist's leave request (BUILD-SPEC 4.15, 4.16). Days are salon-local "YYYY-MM-DD". */
export type LeaveRequest = {
  id: string;
  staffId: string;
  from: string;
  to: string;
  type: "CASUAL" | "SICK" | "OTHER";
  halfDay: boolean;
  note: string | null;
  status: "WAITING" | "APPROVED" | "DECLINED" | "WITHDRAWN";
  /** The owner's reason when declining. */
  reason: string | null;
  decidedAt: string | null;
  /** What happened to the stylist's bookings on those days when it was approved. */
  bookings: "REASSIGNED" | "REBOOK" | null;
  /** When the stylist saw the owner's decision (the in-app notification). */
  seenAt: string | null;
  createdAt: string;
};

export type Data = {
  version: 4;
  customers: Customer[];
  visits: Visit[];
  walletTxs: WalletTx[];
  reminders: ReminderLog[];
  staff: Staff[];
  attendance: Attendance[];
  appointments: Appointment[];
  leaves: LeaveRequest[];
  privacyLog: PrivacyEvent[];
  /** Null until the owner sets a password on first launch. */
  owner: { secret: Secret } | null;
  /** True while the store holds generated demo data. */
  demo: boolean;
  /** Services and add-ons the owner edits in the app; absent = the config file's list. */
  catalog?: Catalog;
  /** Limits the owner sets for the misuse checks; absent = the config file's defaults. */
  checks?: CheckSettings;
  /** End-of-day cash counts (MISUSE-CHECKS 3). */
  dayClosings?: DayClosing[];
  /** What the phone's clock has done (SECURITY-LESSONS 1, 2): the latest time seen, times it went back, and a clean-up hold. */
  clock?: ClockWatch;
};

export type ClockWatch = {
  lastSeen: string;
  /**
   * The last time this phone trusts: it moves forward only in small steps of normal use, or when the
   * owner confirms the date. Saves are checked against it, never against a saved record's time (run 3).
   */
  anchor?: string;
  /** When the owner last confirmed the date (owner password). Clean-up runs only within 30 days of it. */
  confirmedAt?: string;
  /** The clock was set back: from the latest time seen to an earlier one. */
  backJumps: { from: string; to: string }[];
  /** The clock jumped ahead of the trusted time; automatic clean-up waits for the owner to confirm the date. */
  hold: { from: string; to: string } | null;
};

export type CatalogService = { id: string; name: string; price: number; cycleDays: number; minutes: number; active?: boolean };
export type CatalogAddOn = { id: string; name: string; price: number; suggestWith: string[]; active?: boolean };
export type Catalog = { services: CatalogService[]; addOns: CatalogAddOn[] };

export type CheckSettings = {
  /** A wallet spend above this needs the customer's WhatsApp code. */
  walletCodeAbove: number;
  /** Referral rewards one customer can earn in a calendar month. */
  referralMonthlyLimit: number;
};

export type DayClosing = {
  id: string;
  /** Salon-local day, YYYY-MM-DD. */
  date: string;
  /** Cash the app expects in the drawer: cash bills + cash wallet top-ups that day. */
  expected: number;
  counted: number;
  note: string;
  at: string;
};

export const emptyData = (): Data => ({
  version: 4,
  customers: [],
  visits: [],
  walletTxs: [],
  reminders: [],
  staff: [],
  attendance: [],
  appointments: [],
  leaves: [],
  privacyLog: [],
  owner: null,
  demo: false,
});

export type Session = { role: "owner" } | { role: "staff"; staffId: string };
