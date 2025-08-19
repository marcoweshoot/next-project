import React from "react";

interface ColumnItem {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}

interface Props {
  columns: ColumnItem[];
}

const IconWithTextSection: React.FC<Props> = ({ columns }) => {
  return (
    <div
      role="list"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
    >
      {columns.map(({ icon: Icon, title, subtitle }, index) => (
        <div
          key={index}
          role="listitem"
          className="text-center flex flex-col items-center px-4"
        >
          <div
            className="mb-4 rounded-full bg-red-100 p-4"
            aria-hidden="true"
          >
            <Icon className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-base text-gray-600">{subtitle}</p>
        </div>
      ))}
    </div>
  );
};

export default IconWithTextSection;
