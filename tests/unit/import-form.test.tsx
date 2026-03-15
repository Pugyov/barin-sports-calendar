import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ImportForm } from "@/components/app/import-form";

describe("ImportForm", () => {
  it("uses shadcn checkbox and keeps dryRun form value in sync", async () => {
    const user = userEvent.setup();
    const { container } = render(<ImportForm />);

    const checkbox = screen.getByRole("checkbox", { name: /dry-run only/i });
    const hiddenInput = container.querySelector('input[name="dryRun"]') as HTMLInputElement;

    expect(checkbox).toBeChecked();
    expect(hiddenInput.value).toBe("1");

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(hiddenInput.value).toBe("0");
  });
});
