import { getCurrentUser } from "@/lib/session";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PageTransition } from "@/components/marketing/PageTransition";
import { ScrollProgress } from "@/components/marketing/ScrollProgress";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-wheat">
      <ScrollProgress />
      <MarketingNav loggedIn={!!user} />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <MarketingFooter />
    </div>
  );
}
