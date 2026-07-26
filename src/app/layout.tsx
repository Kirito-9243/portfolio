import type { Metadata } from "next";
import { Pirata_One, Rajdhani } from "next/font/google";
import "./globals.css";

// Display face — map labels, island names, hero title. The adventure/pirate voice.
const pirataOne = Pirata_One({
  weight: "400",
  variable: "--font-pirata-one",
  subsets: ["latin"],
});

// Body/UI face — panels, nav, project text. The clean tech voice.
const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kirito — The Grand Line",
  description:
    "A portfolio built as a world: sail the Grand Line to explore my story, skills, and projects. Enter Aincrad to go deeper.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pirataOne.variable} ${rajdhani.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-abyss text-foreground">{children}</body>
    </html>
  );
}