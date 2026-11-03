import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PolicyView } from "./policy-view";
import type { RolesConfig } from "@/lib/types";

const CONFIG: RolesConfig = {
  mode: "Exit",
  targets: [
    {
      contract: "CDEFINDEXVAULTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      label: "DeFindex vault",
      fns: [{ name: "withdraw", conds: [{ kind: "EqSelf", arg: 0 }] }],
    },
  ],
};

describe("PolicyView", () => {
  it("renders the target label and shortened contract address", () => {
    render(<PolicyView config={CONFIG} />);
    expect(screen.getByText("DeFindex vault")).toBeInTheDocument();
    expect(screen.getByText("CDEFIN…XXXXXX")).toBeInTheDocument();
  });

  it("renders the function name and its conditions in plain language", () => {
    render(<PolicyView config={CONFIG} />);
    expect(screen.getByText((_, el) => el?.textContent === "withdraw()")).toBeInTheDocument();
    expect(screen.getByText("arg[0] = this account")).toBeInTheDocument();
  });

  it("flags a function with no conditions as unconditionally allowed", () => {
    const config: RolesConfig = {
      mode: "Entry",
      targets: [{ contract: "CABCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", fns: [{ name: "deposit", conds: [] }] }],
    };
    render(<PolicyView config={config} />);
    expect(
      screen.getByText("No argument conditions — any call to this function is allowed."),
    ).toBeInTheDocument();
  });

  it("falls back to a generic label when the target has none", () => {
    const config: RolesConfig = {
      mode: "Exit",
      targets: [{ contract: "CNOLABELXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", fns: [{ name: "withdraw", conds: [] }] }],
    };
    render(<PolicyView config={config} />);
    expect(screen.getByText("Contract")).toBeInTheDocument();
  });
});
