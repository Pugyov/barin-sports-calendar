import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/calendar"
}));

import { CalendarMonthSelector } from "@/components/app/calendar-month-selector";

describe("CalendarMonthSelector", () => {
  it("navigates using initial selected month", async () => {
    const user = userEvent.setup();

    render(<CalendarMonthSelector currentMonth="2026-03" />);

    await user.click(screen.getByRole("button", { name: "Go" }));

    expect(push).toHaveBeenCalledWith("/calendar?month=2026-03");
  });
});
