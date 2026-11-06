import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Demo } from "./demo";

// Demo reads its initial state from the URL (lazy initializer) and writes it
// back via history.replaceState as the user interacts — reset the URL
// between tests so they don't leak into each other.
beforeEach(() => {
  window.history.replaceState(null, "", "/");
});
afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("Demo — rendering", () => {
  it("defaults to the exit action with no keys signed, and denies it", () => {
    render(<Demo />);
    expect(screen.getByRole("button", { name: /^Exit to the chest/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("✕ Denied")).toBeInTheDocument();
  });

  it("always shows the 'eight fictional keys' caption", () => {
    render(<Demo />);
    expect(
      screen.getByText("Eight fictional keys. Pick who has signed, pick an action, and see exactly why it passes or fails."),
    ).toBeInTheDocument();
  });
});

describe("Demo — interaction", () => {
  it("approves the default exit action once an operator key signs", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    await user.click(screen.getByRole("button", { name: "Governance 1" }));
    // Governance isn't an exit group, so this alone doesn't approve it.
    expect(screen.getByText("✕ Denied")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Operator 1" }));
    expect(screen.getByText("✓ Approved")).toBeInTheDocument();
  });

  it("denies a forced exit to an outside address even with a valid signer", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    await user.click(screen.getByRole("button", { name: "Operator 1" }));
    await user.click(screen.getByRole("button", { name: /^Exit to an outside address/ }));

    expect(screen.getByText("✕ Denied")).toBeInTheDocument();
    expect(screen.getByText("Destination is not this chest. Failed.")).toBeInTheDocument();
  });

  it("accepts either independent group for entering a position", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    await user.click(screen.getByRole("button", { name: /^Enter a new position/ }));
    await user.click(screen.getByRole("button", { name: "Admin 1" }));
    await user.click(screen.getByRole("button", { name: "Admin 2" }));
    expect(screen.getByText("✓ Approved")).toBeInTheDocument();
  });

  it("the classic multisig toggle switches to a single pooled threshold", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    await user.click(screen.getByRole("button", { name: /Classic multisig/ }));
    expect(screen.getByRole("button", { name: /Classic multisig/ })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /^Exit to an outside address/ }));
    await user.click(screen.getByRole("button", { name: "Operator 1" }));
    await user.click(screen.getByRole("button", { name: "Operator 2" }));
    await user.click(screen.getByRole("button", { name: "Admin 1" }));
    await user.click(screen.getByRole("button", { name: "Admin 2" }));
    await user.click(screen.getByRole("button", { name: "Admin 3" }));

    expect(screen.getByText("✓ Approved")).toBeInTheDocument();
  });

  it("the 'Exit to a stranger' shortcut reproduces the denied-by-policy case in one click", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    await user.click(screen.getByRole("button", { name: "Exit to a stranger" }));

    expect(screen.getByRole("button", { name: "Operator 1" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /^Exit to an outside address/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("✕ Denied")).toBeInTheDocument();
  });

  it("reset clears signed keys back to the default scenario", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    await user.click(screen.getByRole("button", { name: "Operator 1" }));
    expect(screen.getByText("✓ Approved")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("button", { name: "Operator 1" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("✕ Denied")).toBeInTheDocument();
  });

  it("writes the current scenario to the URL as the user interacts", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    await user.click(screen.getByRole("button", { name: "Operator 1" }));
    await user.click(screen.getByRole("button", { name: /^Enter a new position/ }));

    const params = new URLSearchParams(window.location.search);
    expect(params.get("signed")).toBe("O1");
    expect(params.get("action")).toBe("enter");
  });

  it("copies the current URL to the clipboard", async () => {
    // userEvent.setup() installs its own navigator.clipboard stub, so the
    // mock must be defined after setup() or it gets overwritten.
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<Demo />);

    await user.click(screen.getByRole("button", { name: "Copy link to this scenario" }));
    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });
});

describe("Demo — shared-link state restore", () => {
  it("restores a scenario carried in the URL on first render", () => {
    window.history.replaceState(null, "", "/?signed=A1,A2&action=enter");
    render(<Demo />);

    expect(screen.getByRole("button", { name: "Admin 1" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /^Enter a new position/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("✓ Approved")).toBeInTheDocument();
  });

  it("ignores an unrecognized key id in the URL rather than crashing", () => {
    window.history.replaceState(null, "", "/?signed=O1,NOT-A-KEY&action=exit");
    render(<Demo />);
    expect(screen.getByText("✓ Approved")).toBeInTheDocument();
  });
});
