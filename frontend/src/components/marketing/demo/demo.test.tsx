import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
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
  it("defaults to the exit-to-treasury action with no keys signed, and denies it", () => {
    render(<Demo />);
    expect(screen.getByRole("button", { name: "Exit the position to the treasury" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("Denied")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "0 of 1 required signatures" })).toBeInTheDocument();
  });

  it("always shows the 'simulated in your browser' caption", () => {
    render(<Demo />);
    expect(
      screen.getByText("Simulated in your browser. Not a live treasury. A testnet version is coming."),
    ).toBeInTheDocument();
  });
});

describe("Demo — interaction", () => {
  it("approves the default action once an EXIT signer signs", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    await user.click(screen.getByRole("button", { name: "Operator 1" }));

    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "1 of 1 required signatures" })).toBeInTheDocument();
  });

  it("denies a forced exit to an outside address even with a valid signature (case 2)", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    await user.click(screen.getByRole("button", { name: "Operator 1" }));
    await user.click(screen.getByRole("button", { name: "Exit the position to an outside address" }));

    expect(screen.getByText("Denied")).toBeInTheDocument();
    expect(
      screen.getByText("The exit rule only allows the treasury as destination, even though the signature is valid."),
    ).toBeInTheDocument();
  });

  it("requires 3 signatures to enter the position (case 3 then case 4)", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    await user.click(screen.getByRole("button", { name: "Operator 1" }));
    await user.click(screen.getByRole("button", { name: "Enter the position" }));
    expect(screen.getByText("Denied")).toBeInTheDocument();
    // O1 is an ENTRY signer too, so it's still counted after switching actions.
    expect(screen.getByRole("img", { name: "1 of 3 required signatures" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Approver 1" }));
    await user.click(screen.getByRole("button", { name: "Approver 2" }));
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "3 of 3 required signatures" })).toBeInTheDocument();
  });

  it("ignores a signer outside the active rule's signer set (case 8)", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    // Approver 1 is not an EXIT signer.
    await user.click(screen.getByRole("button", { name: "Approver 1" }));

    expect(screen.getByText("Denied")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "0 of 1 required signatures" })).toBeInTheDocument();
  });

  it("expands the evaluation steps behind 'Why?'", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    expect(screen.queryByText(/Route "/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Why?" }));
    expect(screen.getByText(/Route "/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hide why" }));
    expect(screen.queryByText(/Route "/)).not.toBeInTheDocument();
  });

  it("the classic multisig toggle changes the required threshold and ignores destination", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    await user.click(screen.getByRole("checkbox", { name: /Classic multisig/ }));
    expect(screen.getByRole("img", { name: "0 of 2 required signatures" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Operator 1" }));
    await user.click(screen.getByRole("button", { name: "Operator 2" }));
    await user.click(screen.getByRole("button", { name: "Exit the position to an outside address" }));

    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("the 'A stolen operator key' shortcut reproduces case 2 in one click", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    await user.click(screen.getByRole("button", { name: "A stolen operator key" }));

    expect(screen.getByRole("button", { name: "Operator 1" })).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Exit the position to an outside address" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Denied")).toBeInTheDocument();
  });

  it("writes the current scenario to the URL as the user interacts", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    await user.click(screen.getByRole("button", { name: "Operator 1" }));
    await user.click(screen.getByRole("button", { name: "Enter the position" }));

    const params = new URLSearchParams(window.location.search);
    expect(params.get("signed")).toBe("O1");
    expect(params.get("action")).toBe("enter");
  });
});

describe("Demo — shared-link state restore", () => {
  it("restores a scenario carried in the URL on first render", () => {
    window.history.replaceState(null, "", "/?signed=O1,A1,A2&action=enter");
    render(<Demo />);

    const whoSigns = screen.getByRole("group", { name: "Keys that have signed" });
    expect(within(whoSigns).getByRole("button", { name: "Operator 1" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Enter the position" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("ignores an unrecognized key id in the URL rather than crashing", () => {
    window.history.replaceState(null, "", "/?signed=O1,NOT-A-KEY&action=exit-to-treasury");
    render(<Demo />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });
});
