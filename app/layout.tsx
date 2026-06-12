import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Velme Studio — Uñas & Pestañas · Tingo María",
  description:
    "Salón premium de uñas y pestañas en Tingo María. Reserva tu cita en línea.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${jost.variable} ${montserrat.variable}`}
    >
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
