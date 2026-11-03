import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SignatureMeter } from "./signature-meter";

describe("SignatureMeter", () => {
  it("labels the meter with counted-of-required, never color alone", () => {
    render(<SignatureMeter counted={1} required={3} approved={false} />);
    expect(screen.getByRole("img", { name: "1 of 3 required signatures" })).toBeInTheDocument();
    expect(screen.getByText("1 of 3 required")).toBeInTheDocument();
  });

  it("renders one segment per required slot when counted is within required", () => {
    const { container } = render(<SignatureMeter counted={1} required={3} approved={false} />);
    const segments = container.querySelectorAll('[aria-hidden="true"]');
    expect(segments).toHaveLength(3);
  });

  it("extends the segment count when counted exceeds required (e.g. extra signers)", () => {
    const { container } = render(<SignatureMeter counted={4} required={3} approved={true} />);
    const segments = container.querySelectorAll('[aria-hidden="true"]');
    expect(segments).toHaveLength(4);
  });
});
