import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SRI Inventarios",
  description: "Sistema de gestión de inventarios multi-tenant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
