import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
const googleClientId =
  process.env.AUTH_GOOGLE_ID ||
  process.env.GOOGLE_CLIENT_ID ||
  process.env.AUTH_GOOGLE_CLIENT_ID ||
  "";
const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET ||
  process.env.GOOGLE_CLIENT_SECRET ||
  process.env.AUTH_GOOGLE_CLIENT_SECRET ||
  "";

if (!authSecret && process.env.NODE_ENV === "production") {
  console.error(
    "⚠️ [NextAuth Configuration Error]: Neither AUTH_SECRET nor NEXTAUTH_SECRET is defined in production environment variables."
  );
}
if (!googleClientId || !googleClientSecret) {
  if (process.env.NODE_ENV === "production") {
    console.error(
      `⚠️ [NextAuth Google Error]: Google OAuth credentials missing in production. ClientID present: ${Boolean(
        googleClientId
      )}, Secret present: ${Boolean(googleClientSecret)}`
    );
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      id: "credentials",
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) {
          return null;
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const code = (credentials.code as string).trim();

        // Look up verification token
        const tokenRecord = await prisma.verificationToken.findFirst({
          where: {
            identifier: email,
            token: code,
          },
        });

        if (!tokenRecord) {
          return null;
        }

        // Check expiry
        if (new Date() > new Date(tokenRecord.expires)) {
          await prisma.verificationToken.deleteMany({
            where: { identifier: email },
          });
          return null;
        }

        // Clean up used OTP token
        await prisma.verificationToken.deleteMany({
          where: { identifier: email },
        });

        // Find or create verified user account in PostgreSQL
        const user = await prisma.user.upsert({
          where: { email },
          update: {
            emailVerified: new Date(),
          },
          create: {
            email,
            emailVerified: new Date(),
            plan: "FREE",
          },
        });

        return {
          id: user.id,
          name: user.name || email.split("@")[0],
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
