import React, { memo } from 'react';
import '../styles/scroll-optimizations.css';

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
  lines?: number;
}

const SkeletonLoader = memo<SkeletonLoaderProps>(({
  width = '100%',
  height = '20px',
  className = '',
  rounded = false,
  lines = 1
}) => {
  const baseClasses = `skeleton-loader bg-gray-200 dark:bg-gray-700 ${
    rounded ? 'rounded-full' : 'rounded'
  } ${className}`;

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={baseClasses}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : style.width, // Last line is shorter
            }}
          />
        ))}
      </div>
    );
  }

  return <div className={baseClasses} style={style} />;
});

SkeletonLoader.displayName = 'SkeletonLoader';

// Skeleton específico para cards de transação
export const TransactionSkeleton = memo(() => (
  <div className="p-4 border rounded-lg space-y-3 optimized-card">
    <div className="flex justify-between items-start">
      <div className="flex-1 space-y-2">
        <SkeletonLoader height={16} width="60%" />
        <SkeletonLoader height={12} width="40%" />
      </div>
      <SkeletonLoader height={20} width={80} />
    </div>
  </div>
));

TransactionSkeleton.displayName = 'TransactionSkeleton';

// Skeleton para charts
export const ChartSkeleton = memo(({ height = 300 }: { height?: number }) => (
  <div className="p-4 border rounded-lg chart-container">
    <div className="space-y-4">
      <SkeletonLoader height={20} width="30%" />
      <SkeletonLoader height={height} width="100%" rounded={false} />
      <div className="flex justify-between">
        <SkeletonLoader height={12} width={60} />
        <SkeletonLoader height={12} width={60} />
        <SkeletonLoader height={12} width={60} />
      </div>
    </div>
  </div>
));

ChartSkeleton.displayName = 'ChartSkeleton';

// Skeleton para cards de resumo
export const SummaryCardSkeleton = memo(() => (
  <div className="p-6 border rounded-lg space-y-4 optimized-card">
    <div className="flex items-center space-x-2">
      <SkeletonLoader width={24} height={24} rounded />
      <SkeletonLoader height={16} width="40%" />
    </div>
    <SkeletonLoader height={32} width="60%" />
    <SkeletonLoader height={12} width="80%" />
  </div>
));

SummaryCardSkeleton.displayName = 'SummaryCardSkeleton';

export default SkeletonLoader;
