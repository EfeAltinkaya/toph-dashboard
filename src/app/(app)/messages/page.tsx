import { prisma } from "@/lib/prisma";
import { requireFarmId } from "@/lib/session";
import { getI18n } from "@/i18n/server";
import { MessageBoard } from "@/components/MessageBoard";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const { t } = await getI18n();
  const farmId = await requireFarmId();
  const messages = await prisma.message.findMany({
    where: { farmId },
    include: { author: true },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface">{t.pages.messages.title}</h1>
        <p className="text-sm text-surface/60">{t.pages.messages.subtitle}</p>
      </div>
      <div className="mt-6">
        <MessageBoard messages={messages} />
      </div>
    </div>
  );
}
