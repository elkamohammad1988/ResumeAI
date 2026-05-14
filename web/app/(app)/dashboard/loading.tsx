import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="px-6 py-10 md:px-10 md:py-12 max-w-6xl">
      {/* Header */}
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-3 h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </header>

      {/* Usage card */}
      <Card className="mb-10 p-5">
        <Skeleton className="h-3 w-32 mb-2" />
        <Skeleton className="h-6 w-20 mb-3" />
        <Skeleton className="h-1 w-48 rounded-full" />
      </Card>

      {/* Resume grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-10 rounded" />
              <Skeleton className="h-4 w-14 rounded" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
