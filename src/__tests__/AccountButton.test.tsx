import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { AccountContextType } from "@/contexts/AccountContext";

const holder = vi.hoisted((): { state: AccountContextType } => ({
  state: {
    status: "signed-out",
    user: null,
    sync: "idle",
    notice: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    retrySync: vi.fn(),
  },
}));

vi.mock("@/contexts/AccountContext", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/contexts/AccountContext")>();
  return { ...actual, useAccount: () => holder.state };
});

import { AccountButton } from "@/components/AccountButton";

function resetState(overrides: Partial<AccountContextType> = {}) {
  holder.state = {
    status: "signed-out",
    user: null,
    sync: "idle",
    notice: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    retrySync: vi.fn(),
    ...overrides,
  };
}

describe("AccountButton", () => {
  beforeEach(() => resetState());

  it("shows a skeleton while the session loads", () => {
    resetState({ status: "loading" });
    render(<AccountButton />);
    expect(document.querySelector(".animate-pulse")).not.toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders Sign in and calls signIn when signed out", () => {
    render(<AccountButton />);
    const button = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(button);
    expect(holder.state.signIn).toHaveBeenCalledTimes(1);
  });

  it("surfaces the auth notice when signed out", () => {
    resetState({ notice: "Cloud sign-in isn't configured yet" });
    render(<AccountButton />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Cloud sign-in isn't configured yet"
    );
  });

  it("opens the account menu for a signed-in user and signs out", () => {
    resetState({
      status: "signed-in",
      user: {
        sub: "g-1",
        name: "Jane Doe",
        email: "jane@example.com",
        picture: "",
      },
      sync: "ok",
    });
    render(<AccountButton />);
    expect(screen.getByText("JD")).toBeInTheDocument();
    expect(screen.getByText("Synced")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("menuitem"));
    expect(holder.state.signOut).toHaveBeenCalledTimes(1);
  });

  it("closes the menu on Escape", () => {
    resetState({
      status: "signed-in",
      user: { sub: "g-1", name: "Jane Doe", email: "j@e.com", picture: "" },
    });
    render(<AccountButton />);
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Jane Doe")).toBeNull();
  });

  it("shows sync error with a retry action", () => {
    resetState({
      status: "signed-in",
      user: { sub: "g-1", name: "Jane Doe", email: "j@e.com", picture: "" },
      sync: "error",
    });
    render(<AccountButton />);
    expect(screen.getByText("Sync error")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(holder.state.retrySync).toHaveBeenCalledTimes(1);
  });
});
