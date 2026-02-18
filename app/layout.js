import { Inter } from "next/font/google";
import GlobalAddButton from "@/components/GlobalAddButton";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Streak Manager",
  description: "Gamified habit tracker",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[#0F172A]`}>
        {children}
        <GlobalAddButton />
      </body>
    </html>
  );
}
