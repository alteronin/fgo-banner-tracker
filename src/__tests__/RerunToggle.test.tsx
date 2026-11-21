import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RerunToggle } from "@/components/RerunToggle";

describe("RerunToggle", () => {
  it("renders On when show is true", () => {
    render(<RerunToggle show={true} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Reruns: On" })).toBeInTheDocument();
  });

  it("renders Off when show is false", () => {
    render(<RerunToggle show={false} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Reruns: Off" })).toBeInTheDocument();
  });

  it("sets aria-pressed from show", () => {
    render(<RerunToggle show={true} onChange={() => {}} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onChange with the flipped value", () => {
    const onChange = vi.fn();
    render(<RerunToggle show={true} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("calls onChange with true when currently off", () => {
    const onChange = vi.fn();
    render(<RerunToggle show={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
