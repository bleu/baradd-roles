import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion } from "./accordion";

const ITEMS = [
  { question: "Why not a normal multisig?", answer: "Because thresholds are per category." },
  { question: "Is it audited?", answer: "No, planned." },
];

describe("Accordion", () => {
  it("starts with every answer collapsed", () => {
    render(<Accordion items={ITEMS} />);
    for (const item of ITEMS) {
      expect(screen.getByRole("button", { name: item.question })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      expect(screen.queryByText(item.answer)).not.toBeInTheDocument();
    }
  });

  it("expands an answer on click and marks it expanded", async () => {
    const user = userEvent.setup();
    render(<Accordion items={ITEMS} />);

    await user.click(screen.getByRole("button", { name: ITEMS[0].question }));

    expect(screen.getByRole("button", { name: ITEMS[0].question })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText(ITEMS[0].answer)).toBeInTheDocument();
  });

  it("collapses on a second click of the same question", async () => {
    const user = userEvent.setup();
    render(<Accordion items={ITEMS} />);

    const button = screen.getByRole("button", { name: ITEMS[0].question });
    await user.click(button);
    await user.click(button);

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(ITEMS[0].answer)).not.toBeInTheDocument();
  });

  it("only one answer is open at a time", async () => {
    const user = userEvent.setup();
    render(<Accordion items={ITEMS} />);

    await user.click(screen.getByRole("button", { name: ITEMS[0].question }));
    await user.click(screen.getByRole("button", { name: ITEMS[1].question }));

    expect(screen.getByRole("button", { name: ITEMS[0].question })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("button", { name: ITEMS[1].question })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});
