import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <div className="px-6 py-10 md:px-10 md:py-12 max-w-3xl">
      <header className="mb-10">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="mt-3 h-4 w-56" />
      </header>

      {[1, 2, 3].map((i) => (
        <Card key={i} className="mb-6">
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardBody className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
