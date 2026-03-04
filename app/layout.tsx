import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Web3Provider } from "@/components/providers/web3-provider"
import "@rainbow-me/rainbowkit/styles.css"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AgentLink Dashboard",
  description: "Agent-to-Agent Payment Network on Base",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}
