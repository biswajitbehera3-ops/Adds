/** ₹ with Indian digit grouping: 1,23,456. */
export function inr(n: number): string {
  const neg = n < 0;
  const s = Math.round(Math.abs(n)).toString();
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${neg ? "−" : ""}₹${rest ? rest + "," : ""}${last3}`;
}

export function formatPhone(p: string): string {
  return p.length === 10 ? `${p.slice(0, 5)} ${p.slice(5)}` : p;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function shortDate(d: Date | string): string {
  const x = typeof d === "string" ? new Date(d) : d;
  return `${x.getDate()} ${MONTHS[x.getMonth()]}`;
}

export function relativeDays(d: Date | string, now = new Date()): string {
  const x = typeof d === "string" ? new Date(d) : d;
  const days = Math.floor((now.getTime() - x.getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return shortDate(x);
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function longDate(now = new Date()): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${days[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`;
}
