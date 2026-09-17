import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";

// Every route under this group requires a logged-in user. Checking once
// here (rather than in each page) is the authoritative check Proxy can't
// safely do itself, since Proxy only reads the cookie, not the database.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "worker") redirect("/log");

  const newLogCount = await prisma.employeeLog.count({ where: { isNew: true } });

  return (
    <div className="flex min-h-screen bg-accent-25">
      <Sidebar user={{ name: user.name, avatarUrl: user.avatarUrl }} newLogCount={newLogCount} />
      {/* min-w-0: without it, a flex child grows to its content's width, so
          one wide table (the use report) would push the whole page
          sideways instead of scrolling inside its own container. */}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
