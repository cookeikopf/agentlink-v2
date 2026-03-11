import type { Metadata } from "next"
import { Web3Provider } from "@/components/providers/web3-provider"
import "@rainbow-me/rainbowkit/styles.css"
import "./globals.css"

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
      <body className="font-sans antialiased">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  )
}
