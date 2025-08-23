import type { Metadata, Viewport } from "next";
import { Inter, Montserrat, Poppins } from "next/font/google";
import "./globals.css";

// Configure fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00AEEF",
};

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "HIGBEC - Hardware & Software Training Institute",
  description:
    "Professional project registration and training platform for students. Get expert guidance in hardware and software development projects.",
  keywords:
    "project registration, training, hardware, software, engineering, education",
  authors: [{ name: "HIGBEC Team" }],
  robots: "index, follow",
  openGraph: {
    title: "HIGBEC - Project Registration Platform",
    description:
      "Register your academic projects and get professional guidance from industry experts.",
    type: "website",
    locale: "en_US",
    siteName: "HIGBEC",
  },
  twitter: {
    card: "summary_large_image",
    title: "HIGBEC - Project Registration",
    description: "Professional project registration platform for students.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${montserrat.variable} ${poppins.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
      </head>
      <body className={`${poppins.className} antialiased`}>{children}</body>
    </html>
  );
}
