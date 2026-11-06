import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateAccountForm } from "./create-account-form";
import { __resetCacheForTests, loadUserAccounts } from "@/lib/accounts-store";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const SIGNER_1 = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const SIGNER_2 = "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";

beforeEach(() => {
  window.localStorage.clear();
  __resetCacheForTests();
  push.mockClear();
});

async function addSigner(address: string) {
  await userEvent.type(screen.getByPlaceholderText("GABCD... signer address"), address);
  await userEvent.click(screen.getByRole("button", { name: "Add signer" }));
}

describe("CreateAccountForm", () => {
  it("requires a label and at least one Governance/Admin signer before submitting", async () => {
    render(<CreateAccountForm />);
    await userEvent.click(screen.getByRole("button", { name: "Create chest" }));
    expect(screen.getByText("Give the chest a label.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText("Label"), "My chest");
    await userEvent.click(screen.getByRole("button", { name: "Create chest" }));
    expect(screen.getByText("Add at least one Governance or Admin signer.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("only offers Governance and Admin, never Operator, for the chest's admin authority", () => {
    render(<CreateAccountForm />);
    expect(screen.getByRole("button", { name: "+ Governance" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ Admin" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+ Operator" })).not.toBeInTheDocument();
  });

  it("clamps the threshold to the signer count and persists the draft", async () => {
    render(<CreateAccountForm />);
    await userEvent.type(screen.getByLabelText("Label"), "My chest");
    await userEvent.click(screen.getByRole("button", { name: "+ Governance" }));
    await addSigner(SIGNER_1);
    await addSigner(SIGNER_2);
    await userEvent.click(screen.getByRole("button", { name: "Create chest" }));

    expect(push).toHaveBeenCalledTimes(1);
    const [accounts] = [loadUserAccounts()];
    expect(accounts).toHaveLength(1);
    expect(accounts[0].label).toBe("My chest");
    const group = accounts[0].rules[0].roleGroups[0];
    expect(group.role).toBe("governance");
    expect(group.signers).toHaveLength(2);
    expect(group.threshold).toBeGreaterThanOrEqual(1);
    expect(group.threshold).toBeLessThanOrEqual(2);
    expect(push).toHaveBeenCalledWith(expect.stringMatching(/^\/app\/DRAFT-/));
  });
});
