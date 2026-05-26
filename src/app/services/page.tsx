import { getAllServices } from "@/actions/marketplace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search } from "lucide-react";
import { auth } from "@/auth";
import { LoginButton, LogoutButton } from "@/components/auth-buttons";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === "string" ? resolvedParams.q : "";
  const services = await getAllServices(q);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/services" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <span className="sr-only">ServiceHub</span>
          ServiceHub
        </Link>
        <div className="ml-auto flex items-center gap-4">
          {session?.user?.role === "PROVIDER" ? (
            <Link href="/dashboard/provider" className="text-sm font-medium hover:underline underline-offset-4">
              Provider Dashboard
            </Link>
          ) : session?.user?.role === "CLIENT" ? (
            <Link href="/dashboard/client" className="text-sm font-medium hover:underline underline-offset-4">
              Client Dashboard
            </Link>
          ) : null}
          {session ? <LogoutButton /> : <LoginButton />}
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col space-y-4 text-center md:space-y-6">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Find the perfect service
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Book appointments with top-rated professionals in your area.
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            <form className="relative flex items-center w-full" action="/services">
              <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                name="q"
                placeholder="Search for services or providers..."
                className="w-full rounded-full bg-background pl-10 pr-4 py-6 text-lg shadow-sm"
                defaultValue={q}
              />
              <Button type="submit" className="absolute right-2 rounded-full px-6">
                Search
              </Button>
            </form>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-8">
            {services.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No services found. Try adjusting your search.
              </div>
            ) : (
              services.map((service) => (
                <Card key={service.id} className="flex flex-col overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="p-4 pb-0">
                    <CardDescription className="font-semibold text-primary">
                      {service.provider.name || "Unknown Provider"}
                    </CardDescription>
                    <CardTitle className="line-clamp-1">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-4">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {service.description || "No description provided."}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="font-medium text-lg">${service.price}</span>
                      <span className="text-muted-foreground">{service.duration_minutes} mins</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full">
                      <Link href={`/services/${service.id}/book`}>Book Now</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
