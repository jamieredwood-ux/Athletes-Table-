import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Athletes Table – Fuel Dashboard",
  description: "Private desktop fuel compliance dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
