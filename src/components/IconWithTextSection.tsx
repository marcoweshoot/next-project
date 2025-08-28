// IconWithTextSection.tsx
import * as React from "react";
import type { LucideIcon } from "lucide-react";

type Column = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
};

interface Props {
  columns: Column[];
  align?: "center" | "left";
}

export default function IconWithTextSection({ columns, align = "center" }: Props) {
  return (
    <div
      className={`grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      {columns.map(({ icon: Icon, title, subtitle }, i) => (
        <div key={i} className="mx-auto max-w-md">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full
                          bg-primary/15 text-primary ring-1 ring-primary/20">
            <Icon className="h-6 w-6" />
          </div>

          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        </div>
      ))}
    </div>
  );
}
