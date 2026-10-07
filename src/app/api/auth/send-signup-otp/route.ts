import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendVerificationOtpEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 400 }
      );
    }

    // Generate 6-digit numeric OTP
    const code = crypto.randomInt(100000, 1000000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity
    const identifier = `signup-otp:${trimmedEmail}`;

    // Clean up any existing OTPs for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier },
    });

    // Save new OTP token
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: code,
        expires,
      },
    });

    // Send the verification OTP email
    const emailRes = await sendVerificationOtpEmail({
      to: trimmedEmail,
      code,
    });

    if (!emailRes.success) {
      return NextResponse.json(
        { error: emailRes.error || "Failed to dispatch verification email. Please check your email address." },
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
    console.error("Send signup OTP error:", error);
    return NextResponse.json(
      { error: "An error occurred while sending verification code. Please try again." },
      { status: 500 }
    );
  }
}
