import React, { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';

interface LazyComponentProps {
  importFn: () => Promise<any>;
}

const LazyComponent: React.FC<LazyComponentProps> = ({ importFn }) => {
  const Component = React.lazy(importFn);

  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-48">
          <Spinner />
        </div>
      }
    >
      <Component />
    </Suspense>
  );
};

export default LazyComponent;
