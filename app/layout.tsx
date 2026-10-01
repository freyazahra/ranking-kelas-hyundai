import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "800", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Ranking Kelas | Hyundai Jump School Batch 3",
  description: "Peringkat kelas X SMKS YPUL Lagoa",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
