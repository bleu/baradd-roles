import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PolicyView } from "./policy-view";
import type { Target } from "@/lib/types";

const TARGET: Target = {
  contract: "CEXAMPLEVAULTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  label: "Example vault",
  fns: [{ name: "withdraw", conds: [{ kind: "EqSelf", arg: 0 }] }],
};

describe("PolicyView", () => {
  it("renders the target label and shortened contract address", () => {
    render(<PolicyView target={TARGET} />);
    expect(screen.getByText("Example vault")).toBeInTheDocument();
    expect(screen.getByText("CEXAMP…XXXXXX")).toBeInTheDocument();
  });

  it("renders the function name and its conditions in plain language", () => {
    render(<PolicyView target={TARGET} />);
    expect(screen.getByText((_, el) => el?.textContent === "withdraw()")).toBeInTheDocument();
    expect(screen.getByText("arg[0] = this account")).toBeInTheDocument();
  });

  it("flags a function with no conditions as unconditionally allowed", () => {
    const target: Target = {
      contract: "CABCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      fns: [{ name: "deposit", conds: [] }],
    };
    render(<PolicyView target={target} />);
    expect(
      screen.getByText("No argument conditions — any call to this function is allowed."),
    ).toBeInTheDocument();
  });

  it("falls back to a generic label when the target has none", () => {
    const target: Target = {
      contract: "CNOLABELXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      fns: [{ name: "withdraw", conds: [] }],
    };
    render(<PolicyView target={target} />);
    expect(screen.getByText("Contract")).toBeInTheDocument();
  });
});
