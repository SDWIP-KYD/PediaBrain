import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-56" />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="space-y-2 border rounded-lg p-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-8 w-20 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
