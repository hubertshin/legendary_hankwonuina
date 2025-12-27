import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, User, BookOpen, Plus } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-warm-800">
              한권의나
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-warm-600 hover:text-warm-900"
              >
                <BookOpen className="h-4 w-4" />
                내 프로젝트
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/project/new">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                새 자서전
              </Button>
            </Link>

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
              <span className="hidden text-sm text-warm-700 md:block">
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
