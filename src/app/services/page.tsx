import { getAllServices } from "@/actions/marketplace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, MapPin, ChevronLeft, ChevronRight, Star } from "lucide-react";
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
  const loc = typeof resolvedParams.loc === "string" ? resolvedParams.loc : "";
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page, 10) : 1;

  const { services, totalPages } = await getAllServices(q, loc, page);

  // Helper to maintain other search params when changing pages
  const createPageUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (loc) params.set("loc", loc);
    params.set("page", newPage.toString());
    return `/services?${params.toString()}`;
  };

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

          <div className="mx-auto max-w-3xl bg-background rounded-2xl shadow-sm border p-2">
            <form className="flex flex-col sm:flex-row items-center gap-2" action="/services">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  name="q"
                  placeholder="What service do you need?"
                  className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent pl-10 text-base"
                  defaultValue={q}
                />
              </div>
              <div className="hidden sm:block w-[1px] h-8 bg-border"></div>
              <div className="relative flex-1 w-full border-t sm:border-t-0">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  name="loc"
                  placeholder="City or Zip Code"
                  className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent pl-10 text-base"
                  defaultValue={loc}
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto rounded-xl px-8 mt-2 sm:mt-0">
                Search
              </Button>
            </form>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-8">
            {services.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No services found matching your criteria.
              </div>
            ) : (
              services.map((service) => (
                <Card key={service.id} className="flex flex-col overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="p-4 pb-0">
                    <CardDescription className="font-semibold text-primary flex items-center justify-between">
                      <span className="truncate mr-2">{service.provider.name || "Unknown Provider"}</span>
                      {service.provider.city && (
                        <span className="text-xs font-normal text-muted-foreground truncate shrink-0">
                          {service.provider.city}, {service.provider.state}
                        </span>
                      )}
                    </CardDescription>
                    <CardTitle className="line-clamp-1">{service.title}</CardTitle>
                    {service.provider.totalRatings > 0 && (
                       <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" />
                          <span className="text-sm font-medium">{service.provider.avgRating}</span>
                          <span className="text-xs text-muted-foreground">({service.provider.totalRatings})</span>
                       </div>
                    )}
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

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-8">
              <Button
                variant="outline"
                asChild
                disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              >
                <Link href={createPageUrl(page - 1)}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                asChild
                disabled={page >= totalPages}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
              >
                <Link href={createPageUrl(page + 1)}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
