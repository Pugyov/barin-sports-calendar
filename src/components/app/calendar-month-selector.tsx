"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" }
] as const;

function parseMonth(month: string): { year: string; month: string } {
  const [year, monthValue] = month.split("-");
  return {
    year,
    month: monthValue
  };
}

export function CalendarMonthSelector({ currentMonth }: { currentMonth: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const parsed = parseMonth(currentMonth);
  const [year, setYear] = useState(parsed.year);
  const [month, setMonth] = useState(parsed.month);

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, index) => `${now - 3 + index}`);
  }, []);

  function applyMonth() {
    router.push(`${pathname}?month=${year}-${month}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={month} onValueChange={setMonth}>
        <SelectTrigger className="w-40" aria-label="Select month">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((monthItem) => (
            <SelectItem key={monthItem.value} value={monthItem.value}>
              {monthItem.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={year} onValueChange={setYear}>
        <SelectTrigger className="w-24" aria-label="Select year">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((yearItem) => (
            <SelectItem key={yearItem} value={yearItem}>
              {yearItem}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" onClick={applyMonth}>
        Go
      </Button>
    </div>
  );
}
