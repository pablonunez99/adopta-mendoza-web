import PetCardSkeleton from "@/components/skeletons/PetCardSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded mx-auto mb-8 animate-pulse"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <PetCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}