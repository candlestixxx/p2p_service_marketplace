import Link from "next/link";
import { auth } from "@/auth";
import { LoginButton, LogoutButton } from "@/components/auth-buttons";

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/dashboard/provider"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <span className="sr-only">ServiceHub Dashboard</span>
            ServiceHub Provider
          </Link>
          <Link
            href="/dashboard/provider/profile"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Profile
          </Link>
          <Link
            href="/dashboard/provider/services"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Services
          </Link>
          <Link
            href="/dashboard/provider/availability"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Availability
          </Link>
          <Link
            href="/dashboard/provider/appointments"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Appointments
          </Link>
          <Link
            href="/dashboard/provider/calendar"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Calendar
          </Link>
          <Link
            href="/dashboard/provider/payments"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Payments
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/services" className="text-sm font-medium hover:underline underline-offset-4">
            Marketplace
          </Link>
          {session ? <LogoutButton /> : <LoginButton />}
        </div>
      </header>
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
          {children}
        </div>
      </main>
    </div>
  );
}
