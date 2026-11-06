import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RuleCard } from "./rule-card";
import type { ContextRule } from "@/lib/types";

const GENERIC_RULE: ContextRule = {
  id: 1,
  kind: "Rule",
  name: "Example Vault withdraw",
  roleGroups: [
    {
      role: "operator",
      threshold: 1,
      signers: [
        { address: "GOPERATOR1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", label: "Operator 1" },
        { address: "GOPERATOR2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", label: "Operator 2" },
      ],
    },
  ],
  target: {
    contract: "CEXAMPLEVAULTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    label: "Example vault",
    fns: [{ name: "withdraw", conds: [] }],
  },
};

const ADMIN_RULE: ContextRule = {
  id: 0,
  kind: "Admin",
  name: "Governance & Admin",
  roleGroups: [
    {
      role: "governance",
      threshold: 2,
      signers: [
        { address: "GGOV1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", label: "Gov 1" },
        { address: "GGOV2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", label: "Gov 2" },
        { address: "GGOV3XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", label: "Gov 3" },
      ],
    },
  ],
};

describe("RuleCard", () => {
  it("links to the rule's detail page under the given account", () => {
    render(<RuleCard accountId="CTREASURY" rule={GENERIC_RULE} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/app/CTREASURY/rules/1");
  });

  it("shows the threshold as counted-of-total signers per role group", () => {
    render(<RuleCard accountId="CTREASURY" rule={GENERIC_RULE} />);
    expect(screen.getByText("1/2 Operator")).toBeInTheDocument();
  });

  it("summarizes the attached policy's scope when one exists", () => {
    render(<RuleCard accountId="CTREASURY" rule={GENERIC_RULE} />);
    expect(screen.getByText("1 function")).toBeInTheDocument();
  });

  it("omits the policy summary for a rule with no target contract (e.g. Admin)", () => {
    render(<RuleCard accountId="CTREASURY" rule={ADMIN_RULE} />);
    expect(screen.queryByText("Policy")).not.toBeInTheDocument();
  });

  it("shows the Admin rule's role group summary", () => {
    render(<RuleCard accountId="CTREASURY" rule={ADMIN_RULE} />);
    expect(screen.getByText("2/3 Governance")).toBeInTheDocument();
  });
});
