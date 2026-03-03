import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

export default async function HomePage() {
  const session = await auth()
  
  if (session.userId) {
    redirect("/dashboard")
  }
  
  redirect("/sign-in")
}
