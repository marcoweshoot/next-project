import React from 'react';
import Image from 'next/image';
import { CheckCircle, XCircle } from 'lucide-react';

interface InclusionItem {
  title: string;
  description?: string;
  icon?: { url: string; alternativeText?: string };
}
interface TourInclusionsSectionProps {
  includes?: InclusionItem[];
  excludes?: InclusionItem[];
}

function IconImg({ src, alt }: { src: string; alt?: string }) {
  return (
    <Image
      src={src}
      alt={alt ?? ''}
      width={20}
      height={20}
      loading="lazy"
      sizes="20px"
      quality={70}
      className="mt-0.5 flex-shrink-0 opacity-70"
    />
  );
}

const InclusionList: React.FC<{
  items: InclusionItem[];
  iconType: 'include' | 'exclude';
  title: string;
}> = ({ items, iconType, title }) => {
  const Icon = iconType === 'include' ? CheckCircle : XCircle;
  const iconColor = iconType === 'include' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="p-6 border-b">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center">
        <Icon className={`w-5 h-5 ${iconColor} mr-2`} />
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={`${iconType}-${i}`} className="flex items-start space-x-3">
            {item.icon?.url ? (
              <IconImg src={item.icon.url} alt={item.icon.alternativeText || item.title} />
            ) : (
              <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
            )}
            <div>
              <div className="text-sm font-medium text-gray-900">{item.title}</div>
              {item.description && (
                <div className="text-xs text-gray-600 mt-1">{item.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TourInclusionsSection: React.FC<TourInclusionsSectionProps> = ({ includes, excludes }) => (
  <>
    {!!includes?.length && <InclusionList items={includes} iconType="include" title="Cosa include" />}
    {!!excludes?.length && <InclusionList items={excludes} iconType="exclude" title="Cosa non include" />}
  </>
);

export default TourInclusionsSection;
