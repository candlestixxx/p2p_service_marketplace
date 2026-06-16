import { getPublicProviderDetails } from "@/actions/marketplace";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, ShieldCheck, CalendarClock } from "lucide-react";
import Link from "next/link";
import { LoginButton, LogoutButton } from "@/components/auth-buttons";
import { auth } from "@/auth";

export default async function PublicProviderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const provider = await getPublicProviderDetails(resolvedParams.id);
  const session = await auth();

  if (!provider) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/services" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <span className="sr-only">ServiceHub</span>
          ServiceHub
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/services" className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block">
            Back to Search
          </Link>
          {session ? <LogoutButton /> : <LoginButton />}
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-3">

          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center">
                {provider.image ? (
                   <img src={provider.image} alt={provider.name || "Provider"} className="w-24 h-24 rounded-full object-cover mb-4 shadow-sm" />
                ) : (
                   <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4 text-3xl font-bold text-muted-foreground shadow-sm">
                     {provider.name?.[0]?.toUpperCase() || "P"}
                   </div>
                )}

                <div className="flex items-center gap-2 justify-center">
                  <h1 className="text-2xl font-bold">{provider.name}</h1>
                  {provider.isPro && <ShieldCheck className="w-5 h-5 text-amber-500" />}
                </div>

                <div className="flex items-center gap-1 text-muted-foreground mt-2">
                   <MapPin className="w-4 h-4" />
                   <span className="text-sm">{provider.city ? `${provider.city}, ${provider.state}` : 'Location unknown'}</span>
                </div>

                {provider.totalRatings > 0 && (
                  <div className="flex items-center gap-1 mt-3 bg-muted px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                    <span className="text-sm font-semibold">{provider.avgRating}</span>
                    <span className="text-xs text-muted-foreground">({provider.totalRatings} reviews)</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {provider.portfolioUrls && provider.portfolioUrls.length > 0 && (
              <Card>
                <CardHeader>
                   <CardTitle className="text-sm">Portfolio Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {provider.portfolioUrls.map((url, idx) => (
                      <div key={idx} className="aspect-square rounded-md overflow-hidden bg-muted border">
                        <img src={url} alt={`Portfolio ${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4">Services Offered</h2>
              {provider.services.length === 0 ? (
                 <p className="text-muted-foreground">This provider has not listed any active services yet.</p>
              ) : (
                 <div className="grid gap-4 sm:grid-cols-2">
                    {provider.services.map((service) => (
                       <Card key={service.id} className="flex flex-col">
                          <CardHeader className="pb-3">
                             <CardTitle className="text-lg">{service.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="flex-1">
                             <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{service.description}</p>
                             <div className="flex justify-between text-sm font-medium">
                               <span>${service.price}</span>
                               <span className="text-muted-foreground flex items-center"><CalendarClock className="w-4 h-4 mr-1" />{service.duration_minutes}m</span>
                             </div>
                          </CardContent>
                          <CardFooter>
                             <Button asChild className="w-full">
                               <Link href={`/services/${service.id}/book`}>Book Appointment</Link>
                             </Button>
                          </CardFooter>
                       </Card>
                    ))}
                 </div>
              )}
            </div>

            {provider.providerReviews && provider.providerReviews.length > 0 && (
               <div className="pt-8">
                 <h2 className="text-2xl font-bold tracking-tight mb-4">Client Reviews</h2>
                 <div className="space-y-4">
                   {provider.providerReviews.map((r, idx) => (
                      <Card key={idx}>
                         <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                               <span className="font-medium text-sm">{r.client.name || "Anonymous Client"}</span>
                               <span className="flex items-center text-sm font-semibold text-yellow-500">
                                 {r.rating} <Star className="w-4 h-4 fill-yellow-400 ml-1" />
                               </span>
                            </div>
                            {r.comment && <p className="text-muted-foreground text-sm italic">&quot;{r.comment}&quot;</p>}
                         </CardContent>
                      </Card>
                   ))}
                 </div>
               </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
