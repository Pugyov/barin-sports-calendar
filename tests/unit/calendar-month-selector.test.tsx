import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const push = vi.fn();
const searchParams = new URLSearchParams("status=open&ownerUserId=user-1");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/calendar",
  useSearchParams: () => searchParams
}));

import { CalendarMonthSelector } from "@/components/app/calendar-month-selector";

describe("CalendarMonthSelector", () => {
  it("navigates to the previous month and preserves filters", async () => {
    const user = userEvent.setup();

    render(<CalendarMonthSelector currentMonth="2026-03" />);

    await user.click(screen.getByRole("button", { name: /previous month/i }));

    expect(push).toHaveBeenCalledWith("/calendar?status=open&ownerUserId=user-1&month=2026-02", { scroll: false });
  });
});
