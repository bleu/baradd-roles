import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SignerList } from "./signer-list";
import type { Signer } from "@/lib/types";

const SIGNERS: Signer[] = [
  { address: "GOPERATOR1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", label: "Operator 1" },
  { address: "GOPERATOR2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", label: "Operator 2" },
  { address: "GAPPROVER1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
];

describe("SignerList", () => {
  it("renders one row per signer, with a label when present and a shortened address otherwise", () => {
    render(<SignerList signers={SIGNERS} threshold={2} />);
    expect(screen.getByText("Operator 1")).toBeInTheDocument();
    expect(screen.getByText("Operator 2")).toBeInTheDocument();
    expect(screen.getByText("GAPP…XXXX")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("marks the first `threshold` signers distinctly from the rest", () => {
    const { container } = render(<SignerList signers={SIGNERS} threshold={2} />);
    const keyholes = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(keyholes).toHaveLength(3);
    const boxFill = (svg: Element) => svg.querySelector("rect")?.getAttribute("style");
    expect(boxFill(keyholes[0])).toContain("fill: var(--obsidian)");
    expect(boxFill(keyholes[1])).toContain("fill: var(--obsidian)");
    expect(boxFill(keyholes[2])).toContain("fill: none");
  });
});
