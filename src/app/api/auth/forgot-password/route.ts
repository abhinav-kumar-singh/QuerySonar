import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

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

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (user) {
      // Generate a secure crypto token
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiration

      // Remove any prior tokens for this email
      await prisma.verificationToken.deleteMany({
        where: { identifier: trimmedEmail },
      });

      // Save new verification token
      await prisma.verificationToken.create({
        data: {
          identifier: trimmedEmail,
          token,
          expires,
        },
      });

      // Dispatch reset email
      await sendPasswordResetEmail({
        to: trimmedEmail,
        resetToken: token,
      });
    }

    // Always return success to prevent email enumeration
    return NextResponse.json(
      {
        success: true,
        message:
          "If an account with this email exists, a password reset link has been dispatched to your inbox.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request. Please try again." },
      { status: 500 }
    );
  }
}
