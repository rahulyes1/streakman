import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

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
        <Navigation />
        {children}
      </body>
    </html>
  );
}
