import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RuleCard } from "./rule-card";
import type { ContextRule } from "@/lib/types";

const EXIT_RULE: ContextRule = {
  id: 1,
  kind: "Exit",
  name: "Exit · DeFindex",
  threshold: 1,
  signers: [
    { address: "GOPERATOR1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", label: "Operator 1" },
    { address: "GOPERATOR2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", label: "Operator 2" },
  ],
  protocolLabel: "DeFindex vault",
  config: {
    mode: "Exit",
    targets: [
      {
        contract: "CDEFINDEXVAULTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        fns: [{ name: "withdraw", conds: [] }],
      },
    ],
  },
};

const ADMIN_RULE: ContextRule = {
  id: 0,
  kind: "Admin",
  name: "Governance",
  threshold: 2,
  signers: [
    { address: "GGOV1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", label: "Gov 1" },
    { address: "GGOV2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", label: "Gov 2" },
    { address: "GGOV3XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", label: "Gov 3" },
  ],
};

describe("RuleCard", () => {
  it("links to the rule's detail page under the given account", () => {
    render(<RuleCard accountId="CTREASURY" rule={EXIT_RULE} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/app/CTREASURY/rules/1");
  });

  it("shows the threshold as counted-of-total signers", () => {
    render(<RuleCard accountId="CTREASURY" rule={EXIT_RULE} />);
    expect(screen.getByText("1 of 2")).toBeInTheDocument();
  });

  it("summarizes the attached policy's scope when one exists", () => {
    render(<RuleCard accountId="CTREASURY" rule={EXIT_RULE} />);
    expect(screen.getByText("1 contract, 1 function")).toBeInTheDocument();
  });

  it("omits the policy summary for a rule with no RolesPolicy (e.g. Admin)", () => {
    render(<RuleCard accountId="CTREASURY" rule={ADMIN_RULE} />);
    expect(screen.queryByText("Policy")).not.toBeInTheDocument();
  });

  it("truncates the signer list past two names", () => {
    render(<RuleCard accountId="CTREASURY" rule={ADMIN_RULE} />);
    expect(screen.getByText("Gov 1, Gov 2 +1")).toBeInTheDocument();
  });
});
