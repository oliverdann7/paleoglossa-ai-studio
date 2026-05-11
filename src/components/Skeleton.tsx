import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-parch3/60',
        className
      )}
    />
  );
}

export function ReaderSkeleton() {
  return (
    <div className="flex h-screen bg-parch">
      <div className="flex-1 flex flex-col">
        <div className="h-14 bg-parch2 border-b border-bdr flex items-center px-4 gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="h-12 border-b border-bdr/40 flex items-center px-4">
          <Skeleton className="h-4 w-32" />
          <div className="flex-1" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md ml-2" />
        </div>
        <div className="flex-1 p-8 md:p-16 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-14" />
            </div>
          ))}
        </div>
        <div className="h-12 bg-parch2 border-t border-bdr flex items-center px-4">
          <Skeleton className="h-3 w-32 rounded-full" />
          <div className="flex-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-6 space-y-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
