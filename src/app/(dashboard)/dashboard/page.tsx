import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  // Redirect based on user role
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  if (isAdmin) {
    redirect("/admin");
  } else {
    redirect("/");
  }
}
