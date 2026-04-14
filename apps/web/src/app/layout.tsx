import type { Metadata } from "next";
import { fraunces, inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "milam — an agent that grows through dreaming",
  description:
    "MILAM is the night half of DREAMERS: an AI companion that listens to your dreams, asks one quiet question, and remembers in fragments.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-mode="milam"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
