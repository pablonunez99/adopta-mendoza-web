export default function PetCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm overflow-hidden h-full flex flex-col border border-gray-100 dark:border-gray-800 animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-64 w-full bg-gray-200 dark:bg-gray-800"></div>

      {/* Content Skeleton */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
        </div>
        
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
        
        <div className="flex gap-2 mb-6">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    </div>
  );
}