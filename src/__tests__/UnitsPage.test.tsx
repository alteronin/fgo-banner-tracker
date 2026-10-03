import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { UnitsPage } from "@/components/UnitsPage";
import { ThemeProvider } from "@/contexts/ThemeContext";
import genshinUnits from "@/data/genshin-units.json";
import hsrUnits from "@/data/hsr-units.json";

vi.mock("next/image", () => ({
  default: (props: { alt: string }) => <span role="img" aria-label={props.alt} />,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/genshin/units",
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

function renderUnits(game: Parameters<typeof UnitsPage>[0]["game"]) {
  return render(
    <ThemeProvider>
      <UnitsPage game={game} />
    </ThemeProvider>
  );
}

function groupRow(label: string): HTMLElement {
  const span = screen.getByText(label, { selector: "span" });
  const row = span.closest("div");
  expect(row).not.toBeNull();
  return row as HTMLElement;
}

function clickInGroup(label: string, buttonName: string) {
  fireEvent.click(within(groupRow(label)).getByRole("button", { name: buttonName }));
}

function showing(): string {
  return screen.getByText(/Showing \d+ of \d+/).textContent ?? "";
}

describe("UnitsPage taxonomy filters", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("shows all rows and both filter groups initially", () => {
    renderUnits("genshin");
    expect(showing()).toBe("Showing 127 of 127 characters");
    expect(screen.getByText("Element", { selector: "span" })).toBeDefined();
    expect(screen.getByText("Weapon", { selector: "span" })).toBeDefined();
    const [elementAll] = screen.getAllByRole("button", { name: "All" });
    expect(elementAll.getAttribute("aria-pressed")).toBe("true");
  });

  it("filters by a single element toggle", () => {
    renderUnits("genshin");
    clickInGroup("Element", "Anemo");
    expect(showing()).toBe(
      `Showing ${genshinUnits.filter((u) => u.element === "Anemo").length} of 127 characters`
    );
    expect(
      screen.getByRole("button", { name: "Anemo" }).getAttribute("aria-pressed")
    ).toBe("true");
  });

  it("ORs multiple selections within one group", () => {
    renderUnits("genshin");
    clickInGroup("Element", "Anemo");
    clickInGroup("Element", "Pyro");
    const expected = genshinUnits.filter(
      (u) => u.element === "Anemo" || u.element === "Pyro"
    ).length;
    expect(showing()).toBe(`Showing ${expected} of 127 characters`);
  });

  it("resets the group via its All button", () => {
    renderUnits("genshin");
    clickInGroup("Element", "Anemo");
    clickInGroup("Element", "All");
    expect(showing()).toBe("Showing 127 of 127 characters");
    expect(
      screen.getByRole("button", { name: "Anemo" }).getAttribute("aria-pressed")
    ).toBe("false");
  });

  it("filters by weapon group", () => {
    renderUnits("genshin");
    clickInGroup("Weapon", "Sword");
    expect(showing()).toBe(
      `Showing ${genshinUnits.filter((u) => u.weapon === "Sword").length} of 127 characters`
    );
  });

  it("ANDs across element and weapon groups", () => {
    renderUnits("genshin");
    clickInGroup("Element", "Anemo");
    clickInGroup("Weapon", "Sword");
    const expected = genshinUnits.filter(
      (u) => u.element === "Anemo" && u.weapon === "Sword"
    ).length;
    expect(showing()).toBe(`Showing ${expected} of 127 characters`);
  });

  it("combines with search", () => {
    renderUnits("genshin");
    clickInGroup("Element", "Geo");
    fireEvent.change(screen.getByPlaceholderText("Search characters..."), {
      target: { value: "zhongli" },
    });
    expect(showing()).toBe("Showing 1 of 127 characters");
    clickInGroup("Element", "Geo");
    clickInGroup("Element", "Anemo");
    expect(showing()).toBe("Showing 0 of 127 characters");
    expect(
      screen.getByText("No characters found matching your criteria.")
    ).toBeDefined();
  });

  it("combines with the status filter", () => {
    renderUnits("genshin");
    clickInGroup("Element", "Anemo");
    fireEvent.click(screen.getByRole("button", { name: "Owned" }));
    expect(showing()).toBe("Showing 0 of 127 characters");
  });

  it("hsr type group isolates light cones and excludes them from element filters", () => {
    renderUnits("hsr");
    clickInGroup("Type", "Light Cone");
    expect(showing()).toBe("Showing 170 of 263 characters and light cones");
    clickInGroup("Element", "Fire");
    expect(showing()).toBe("Showing 0 of 263 characters and light cones");
    clickInGroup("Type", "All");
    expect(showing()).toBe(
      `Showing ${hsrUnits.filter((u) => u.element === "Fire").length} of 263 characters and light cones`
    );
  });

  it("toggling the same value off restores the group", () => {
    renderUnits("genshin");
    clickInGroup("Element", "Cryo");
    expect(showing()).toBe(
      `Showing ${genshinUnits.filter((u) => u.element === "Cryo").length} of 127 characters`
    );
    clickInGroup("Element", "Cryo");
    expect(showing()).toBe("Showing 127 of 127 characters");
  });
});
