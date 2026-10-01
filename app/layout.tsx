import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ranking Kelas | Hyundai Jump School Batch 3",
  description: "Peringkat kelas X SMKS YPUL Lagoa",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
