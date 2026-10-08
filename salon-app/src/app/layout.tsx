import type { Metadata } from "next";
import config from "@config";

export const metadata: Metadata = { title: config.displayName };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
