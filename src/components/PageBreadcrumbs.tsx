// src/components/PageBreadcrumbs.tsx
'use client';

import Link from 'next/link';
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbElement {
  name: string;
  path?: string;
}

interface PageBreadcrumbsProps {
  elements: BreadcrumbElement[];
  className?: string;
  /** Disabilita il prefetch dei link (consigliato: false per evitare GET 404 in prefetch) */
  prefetch?: boolean;
}

const PageBreadcrumbs: React.FC<PageBreadcrumbsProps> = ({
  elements,
  className,
  prefetch = false,
}) => {
  return (
    <Breadcrumb className={className} aria-label="Breadcrumb">
      <BreadcrumbList className="gap-0">
        {elements.map((element, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {element.path ? (
                <BreadcrumbLink asChild>
                  <Link
                    href={element.path}
                    prefetch={prefetch}
                    className="text-white/80 hover:text-white text-xs"
                  >
                    {element.name}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="text-white text-xs">
                  {element.name}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < elements.length - 1 && (
              <BreadcrumbSeparator className="text-white/60 text-xs mx-0.5">
                /
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default PageBreadcrumbs;
