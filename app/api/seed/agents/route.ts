import { NextResponse } from "next/server"

const DEPRECATION_MESSAGE =
  "This endpoint was removed to avoid distributing mock agent templates or demo-only data. Register real agents through production onboarding flows."

export async function POST() {
  return NextResponse.json(
    {
      error: "Endpoint removed",
      message: DEPRECATION_MESSAGE,
    },
    { status: 410 }
  )
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Endpoint removed",
      message: DEPRECATION_MESSAGE,
    },
    { status: 410 }
  )
}
