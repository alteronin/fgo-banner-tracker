import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { AppSwitcher } from "@/components/AppSwitcher";

const { mockPathname } = vi.hoisted(() => ({
  mockPathname: vi.fn(() => "/"),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & Omit<React.ComponentProps<"a">, "href">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("AppSwitcher", () => {
  beforeEach(() => {
    cleanup();
    mockPathname.mockReturnValue("/");
  });

  it("renders the title and subtitle", () => {
    render(
      <AppSwitcher
        title="FGO JP Banner Tracker"
        subtitle="Track your pulls and plan your quartz"
      />
    );
    expect(
      screen.getByRole("heading", { name: "FGO JP Banner Tracker" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Track your pulls and plan your quartz")
    ).toBeInTheDocument();
  });

  it("keeps the dropdown hidden until the header is clicked", () => {
    render(
      <AppSwitcher title="FGO JP Banner Tracker" subtitle="Test subtitle" />
    );
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("lists all seven apps when open", () => {
    render(
      <AppSwitcher title="FGO JP Banner Tracker" subtitle="Test subtitle" />
    );
    fireEvent.click(screen.getByRole("button"));
    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(7);
    expect(
      screen.getByRole("menuitem", { name: /Genshin Impact/ })
    ).toHaveAttribute("href", "/genshin");
    expect(
      screen.getByRole("menuitem", { name: /Shadowverse: Worlds Beyond/ })
    ).toHaveAttribute("href", "/shadowverse");
  });

  it("marks the current app with aria-current", () => {
    mockPathname.mockReturnValue("/hsr");
    render(
      <AppSwitcher title="Honkai: Star Rail" subtitle="Test subtitle" />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(
      screen.getByRole("menuitem", { name: /Honkai: Star Rail/ })
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("menuitem", { name: /Genshin Impact/ })
    ).not.toHaveAttribute("aria-current");
  });

  it("treats all FGO routes as the FGO app", () => {
    mockPathname.mockReturnValue("/servants");
    render(
      <AppSwitcher title="Servant Collection" subtitle="Test subtitle" />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(
      screen.getByRole("menuitem", { name: /FGO JP Banner Tracker/ })
    ).toHaveAttribute("aria-current", "page");
  });

  it("closes on Escape", () => {
    render(
      <AppSwitcher title="FGO JP Banner Tracker" subtitle="Test subtitle" />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes when clicking outside", () => {
    render(
      <AppSwitcher title="FGO JP Banner Tracker" subtitle="Test subtitle" />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
