// Pure date helpers, kept separate from log-actions.ts (which pulls in
// Prisma/the database) so they're trivial to unit test in isolation.

// A plain "YYYY-MM-DD" from a <input type="date"> parses as UTC midnight if
// handed straight to `new Date()`, which can then display as the previous
// day once rendered in a timezone behind UTC. Building the date from local
// parts instead avoids that shift.
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
