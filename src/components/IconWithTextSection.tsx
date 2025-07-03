
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IconColumn {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

interface IconWithTextSectionProps {
  columns: IconColumn[];
}

const IconWithTextSection: React.FC<IconWithTextSectionProps> = ({ columns }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {columns.map((column, index) => {
        const IconComponent = column.icon;
        return (
          <div key={index} className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconComponent className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              {column.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {column.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default IconWithTextSection;
