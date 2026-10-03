import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  let session = null;
  try {
    session = await auth();
  } catch (err: unknown) {
    const errorObj = err as { digest?: string };
    if (
      typeof errorObj?.digest === "string" &&
      (errorObj.digest.startsWith("DYNAMIC_SERVER_USAGE") || errorObj.digest.startsWith("NEXT_REDIRECT"))
    ) {
      throw err;
    }
    console.error("Dashboard auth check error:", err);
  }

  if (!session || !session.user) {
    redirect("/?auth=signin");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
