import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <Skeleton className="h-8 w-40 bg-secondary" />
      <Skeleton className="mt-4 h-14 w-80 bg-secondary" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="aspect-[59/86] bg-secondary" />
        <Skeleton className="aspect-[59/86] bg-secondary" />
        <Skeleton className="aspect-[59/86] bg-secondary" />
      </div>
    </div>
  );
}
