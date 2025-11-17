import { cn } from "~/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'circle' | 'avatar' | 'rectangle';
  width?: string;
  height?: string;
  animate?: boolean;
}

export const LoadingSkeleton = ({ 
  className, 
  variant = 'rectangle', 
  width = 'w-full', 
  height = 'h-4',
  animate = true 
}: LoadingSkeletonProps) => {
  const baseClasses = cn(
    'bg-gray-200 rounded',
    animate && 'animate-pulse',
    className
  );

  const variantClasses = {
    card: 'rounded-2xl',
    text: 'rounded-md',
    circle: 'rounded-full',
    avatar: 'rounded-full w-12 h-12',
    rectangle: 'rounded-lg'
  };

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        width,
        height
      )}
    />
  );
};

export const ResumeCardSkeleton = () => {
  return (
    <div className="resume-card">
      <div className="resume-card-header">
        <div className="flex flex-col gap-2">
          <LoadingSkeleton variant="text" width="w-32" height="h-6" />
          <LoadingSkeleton variant="text" width="w-24" height="h-4" />
        </div>
        <div className="flex-shrink-0">
          <LoadingSkeleton variant="circle" width="w-16" height="h-16" />
        </div>
      </div>
      <div className="gradient-border">
        <LoadingSkeleton variant="rectangle" width="w-full" height="h-[350px] max-sm:h-[200px]" />
      </div>
    </div>
  );
};

export const FeedbackSkeleton = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* Summary skeleton */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <LoadingSkeleton variant="text" width="w-48" height="h-8" className="mb-4" />
        <LoadingSkeleton variant="text" width="w-full" height="h-4" className="mb-2" />
        <LoadingSkeleton variant="text" width="w-3/4" height="h-4" />
      </div>
      
      {/* ATS skeleton */}
      <div className="bg-gradient-to-b from-green-100 to-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-4 mb-6">
          <LoadingSkeleton variant="circle" width="w-12" height="h-12" />
          <LoadingSkeleton variant="text" width="w-40" height="h-8" />
        </div>
        <LoadingSkeleton variant="text" width="w-32" height="h-6" className="mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start gap-3">
              <LoadingSkeleton variant="circle" width="w-5" height="h-5" />
              <LoadingSkeleton variant="text" width="w-full" height="h-4" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Details skeleton */}
      <div className="flex flex-col gap-4">
        {['Tone & Style', 'Content', 'Structure', 'Skills'].map(category => (
          <div key={category} className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-4 mb-4">
              <LoadingSkeleton variant="text" width="w-32" height="h-7" />
              <LoadingSkeleton variant="circle" width="w-16" height="h-6" />
            </div>
            <div className="space-y-2">
              <LoadingSkeleton variant="text" width="w-full" height="h-4" />
              <LoadingSkeleton variant="text" width="w-5/6" height="h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};