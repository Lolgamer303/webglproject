import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebGL Project",
  description: "A WebGL project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
