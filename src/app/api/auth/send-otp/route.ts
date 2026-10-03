import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendVerificationOtpEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Generate cryptographically secure 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any prior OTP tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: trimmedEmail },
    });

    // Store new OTP
    await prisma.verificationToken.create({
      data: {
        identifier: trimmedEmail,
        token: code,
        expires,
      },
    });

    // Dispatch verification email via Resend
    const emailRes = await sendVerificationOtpEmail({
      to: trimmedEmail,
      code,
    });

    if (!emailRes.success) {
      return NextResponse.json(
        { error: emailRes.error || "Failed to send verification code. Please check your email address." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Verification code sent to ${trimmedEmail}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
