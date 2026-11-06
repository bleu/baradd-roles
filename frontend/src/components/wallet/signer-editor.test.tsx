import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignerEditor } from "./signer-editor";

const VALID = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

describe("SignerEditor", () => {
  it("renders existing signers and a remove button for each", async () => {
    const onChange = vi.fn();
    render(
      <SignerEditor
        signers={[{ address: VALID, label: "Gov 1" }]}
        onChange={onChange}
      />,
    );
    expect(screen.getByText("Gov 1")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("rejects an address that doesn't look like a Stellar address", async () => {
    const onChange = vi.fn();
    render(<SignerEditor signers={[]} onChange={onChange} />);
    await userEvent.type(screen.getByPlaceholderText("GABCD... signer address"), "not-an-address");
    await userEvent.click(screen.getByRole("button", { name: "Add signer" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/doesn't look like a Stellar address/)).toBeInTheDocument();
  });

  it("adds a well-formed address with its label", async () => {
    const onChange = vi.fn();
    render(<SignerEditor signers={[]} onChange={onChange} />);
    await userEvent.type(screen.getByPlaceholderText("GABCD... signer address"), VALID);
    await userEvent.type(screen.getByPlaceholderText("Label (optional)"), "Operator 1");
    await userEvent.click(screen.getByRole("button", { name: "Add signer" }));
    expect(onChange).toHaveBeenCalledWith([{ address: VALID, label: "Operator 1" }]);
  });

  it("rejects a duplicate address", async () => {
    const onChange = vi.fn();
    render(<SignerEditor signers={[{ address: VALID }]} onChange={onChange} />);
    await userEvent.type(screen.getByPlaceholderText("GABCD... signer address"), VALID);
    await userEvent.click(screen.getByRole("button", { name: "Add signer" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText("This address is already a signer.")).toBeInTheDocument();
  });
});
