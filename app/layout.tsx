import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Production Serial Tracking",
  description: "Production serial number traceability and reconciliation system",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
