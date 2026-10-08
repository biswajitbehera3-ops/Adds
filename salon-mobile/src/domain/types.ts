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
  /** DPDP: when the customer agreed to having details stored and receiving reminders. */
  consentAt: string | null;
  referredById: string | null;
  /** Set once the referral reward is paid (on this customer's first paid visit). */
  referralRewardedAt: string | null;
  createdAt: string;
};

export type Visit = {
  id: string;
  customerId: string;
  serviceId: string;
  staffId: string;
  addOnIds: string[];
  total: number;
  walletPaid: number;
  directPaid: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
};

export type WalletTxType = "TOPUP" | "BONUS" | "SPEND" | "REFERRAL_REWARD";

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

export type Data = {
  version: 1;
  customers: Customer[];
  visits: Visit[];
  walletTxs: WalletTx[];
  reminders: ReminderLog[];
  /** True while the store holds generated demo data. */
  demo: boolean;
};

export const emptyData = (): Data => ({ version: 1, customers: [], visits: [], walletTxs: [], reminders: [], demo: false });
