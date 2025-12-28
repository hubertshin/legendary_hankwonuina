import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Determine home link based on user role
  const isAdmin = (session.user as any).role === "ADMIN";
  const homeLink = isAdmin ? "/admin" : "/";

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header */}
      <header className="bg-background/90 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={homeLink} className="flex items-center space-x-2">
              <img src="/lovable-uploads/32760d4e-6290-41fc-aacf-1898f668c43e.png" alt="한권의나 로고" className="h-12 w-12" />
              <span className="text-2xl font-bold text-foreground">한권의나</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4 text-primary" />
                  )}
                </div>
                <span className="hidden text-sm text-foreground md:block">
                  {session.user.name || session.user.email}
                </span>
              </div>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button variant="ghost" size="icon" type="submit">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
