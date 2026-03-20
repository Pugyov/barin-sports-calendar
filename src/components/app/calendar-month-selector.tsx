"use client";

import { addMonths, format, parseISO, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type CalendarMonthSelectorProps = {
  currentMonth: string;
};

function buildSearchParams(searchParams: URLSearchParams, updates: Record<string, string | null>) {
  const nextParams = new URLSearchParams(searchParams.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === "") {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
  }

  const query = nextParams.toString();
  return query ? `?${query}` : "";
}

export function CalendarMonthSelector({ currentMonth }: CalendarMonthSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const monthDate = parseISO(`${currentMonth}-01`);

  function navigate(nextMonth: string, selectedDate: string | null = null) {
    const search = buildSearchParams(searchParams, {
      month: nextMonth,
      selectedDate
    });

    router.push(`${pathname}${search}`, { scroll: false });
  }

  function goToToday() {
    const now = new Date();
    navigate(format(now, "yyyy-MM"), format(now, "yyyy-MM-dd"));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="icon" onClick={() => navigate(format(subMonths(monthDate, 1), "yyyy-MM"))} aria-label="Previous month">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="min-w-[11rem] rounded-full border bg-background px-4 py-2 text-center text-sm font-medium shadow-sm">
        {format(monthDate, "MMMM yyyy")}
      </div>
      <Button type="button" variant="outline" size="icon" onClick={() => navigate(format(addMonths(monthDate, 1), "yyyy-MM"))} aria-label="Next month">
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button type="button" variant="secondary" onClick={goToToday}>
        Today
      </Button>
    </div>
  );
}
