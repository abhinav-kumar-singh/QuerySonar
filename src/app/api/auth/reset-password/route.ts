import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, token, newPassword } = body;

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: "Email, reset token, and new password are all required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Verify token validity
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: trimmedEmail,
        token: token.trim(),
      },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Invalid or expired password reset link. Please request a new one." },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > new Date(tokenRecord.expires)) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: trimmedEmail },
      });
      return NextResponse.json(
        { error: "This password reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found associated with this email address." },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and invalidate used token
    await prisma.$transaction([
      prisma.user.update({
        where: { email: trimmedEmail },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.deleteMany({
        where: { identifier: trimmedEmail },
      }),
    ]);

    return NextResponse.json(
      { success: true, message: "Password updated successfully. You can now sign in." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
