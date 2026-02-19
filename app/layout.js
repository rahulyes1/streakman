import { Inter } from "next/font/google";
import AuthSyncManager from "@/components/AuthSyncManager";
import GlobalAddButton from "@/components/GlobalAddButton";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Streak Map",
  description: "Build a city from your habits",
  manifest: "/manifest.json",
  themeColor: "#0B0B0B",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[#0B0B0B]`}>
        {children}
        <AuthSyncManager />
        <GlobalAddButton />
      </body>
    </html>
  );
}
