import { NextResponse } from "next/server";
import { getBookingOptions } from "@/server/booking-options";

export async function GET() {
  try {
    const options = await getBookingOptions();

    return NextResponse.json({
      ok: true,
      options
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "无法读取预约配置"
      },
      { status: 500 }
    );
  }
}
