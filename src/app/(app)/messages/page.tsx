import { prisma } from "@/lib/prisma";
import { MessageBoard } from "@/components/MessageBoard";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const messages = await prisma.message.findMany({
    include: { author: true },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Messages</h1>
        <p className="text-sm text-neutral-500">
          A shared board for the whole team, everyone with an account can post.
        </p>
      </div>
      <div className="mt-6">
        <MessageBoard messages={messages} />
      </div>
    </div>
  );
}
