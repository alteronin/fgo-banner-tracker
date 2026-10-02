import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AboutHelp } from "@/components/AboutHelp";

describe("AboutHelp", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("opens the help modal", () => {
    render(<AboutHelp />);
    fireEvent.click(screen.getByTitle("Help"));
    expect(screen.getByText("How to Use")).toBeInTheDocument();
    expect(screen.getByText(/Toggle Servants/)).toBeInTheDocument();
  });

  it("closes via the Close button", () => {
    render(<AboutHelp />);
    fireEvent.click(screen.getByTitle("Help"));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByText("How to Use")).not.toBeInTheDocument();
  });

  it("closes on Escape", () => {
    render(<AboutHelp />);
    fireEvent.click(screen.getByTitle("Help"));
    expect(screen.getByText("How to Use")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText("How to Use")).not.toBeInTheDocument();
  });

  it("does not throw Escape when already closed", () => {
    render(<AboutHelp />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText("How to Use")).not.toBeInTheDocument();
  });
});
