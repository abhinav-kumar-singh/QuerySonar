import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, code } = body;

    if (!email || !password || !code) {
      return NextResponse.json(
        { error: "Email, password, and 6-digit verification code are required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedCode = code.toString().trim();
    const identifier = `signup-otp:${trimmedEmail}`;

    // Verify token record
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier,
        token: trimmedCode,
      },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Invalid verification code. Please check and enter the 6-digit code sent to your email." },
        { status: 400 }
      );
    }

    if (new Date() > new Date(tokenRecord.expires)) {
      await prisma.verificationToken.deleteMany({ where: { identifier } });
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      await prisma.verificationToken.deleteMany({ where: { identifier } });
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with emailVerified timestamp and clear token
    await prisma.$transaction([
      prisma.user.create({
        data: {
          email: trimmedEmail,
          password: hashedPassword,
          emailVerified: new Date(),
          plan: "FREE",
        },
      }),
      prisma.verificationToken.deleteMany({
        where: { identifier },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Account verified and created successfully.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verify signup OTP error:", error);
    return NextResponse.json(
      { error: "Failed to complete account registration. Please try again." },
      { status: 500 }
    );
  }
}
