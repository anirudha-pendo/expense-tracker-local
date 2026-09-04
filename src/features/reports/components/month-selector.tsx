import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, isAfter, startOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";

interface MonthSelectorProps {
  value: Date;
  onChange: (date: Date) => void;
}

export function MonthSelector({ value, onChange }: MonthSelectorProps) {
  const isCurrentMonth = !isAfter(startOfMonth(new Date()), startOfMonth(value));

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => onChange(subMonths(value, 1))}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="text-sm font-medium w-28 text-center tabular-nums">
        {format(value, "MMMM yyyy")}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        disabled={isCurrentMonth}
        onClick={() => onChange(addMonths(value, 1))}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
