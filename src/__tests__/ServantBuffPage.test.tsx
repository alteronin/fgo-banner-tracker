import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from "@testing-library/react";
import ServantBuffsPage from "@/app/servants/buffs/page";
import { ServantBuffPage } from "@/components/ServantBuffPage";
import { ServantProvider } from "@/contexts/ServantContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

vi.mock("next/image", () => ({
  default: (props: { alt: string }) => <span role="img" aria-label={props.alt} />,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/servants/buffs",
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

function renderPageWith(element: React.ReactElement) {
  return render(
    <ThemeProvider>
      <ServantProvider>{element}</ServantProvider>
    </ThemeProvider>
  );
}

function renderPage() {
  return renderPageWith(<ServantBuffPage />);
}

function groupRow(label: string): HTMLElement {
  const span = screen.getByText(label, { selector: "span" });
  const row = span.closest("div");
  expect(row).not.toBeNull();
  return row as HTMLElement;
}

function clickPill(group: string, name: string) {
  fireEvent.click(within(groupRow(group)).getByRole("button", { name }));
}

function showing(): string {
  return screen.getByText(/Showing \d+ of \d+/).textContent ?? "";
}

function cardOf(name: string): HTMLElement {
  const nameEl = screen.getByText(name, { selector: "p" });
  const card = nameEl.closest(".rounded-lg");
  expect(card).not.toBeNull();
  return card as HTMLElement;
}

describe("ServantBuffPage", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("renders the page shell with the Buffs tab and all servants", () => {
    renderPage();
    expect(showing()).toBe("Showing 487 of 487 servants");
    const nav = screen.getByRole("navigation", { name: "Sections" });
    const buffsLink = within(nav).getByRole("link", { name: "Buffs" });
    expect(buffsLink.getAttribute("href")).toBe("/servants/buffs");
    expect(buffsLink.getAttribute("aria-current")).toBe("page");
    expect(
      within(nav).getByRole("link", { name: "Servants" }).getAttribute("href")
    ).toBe("/servants");
  });

  it("shows every buff, target, np type and class pill", () => {
    renderPage();
    const buff = groupRow("Buff");
    for (const label of [
      "Buster Up",
      "Arts Up",
      "Quick Up",
      "NP Strength Up",
      "NP Gauge Up",
      "Heal",
    ]) {
      expect(within(buff).getByRole("button", { name: label })).toBeDefined();
    }
    expect(within(groupRow("Target")).getByText("All allies")).toBeDefined();
    expect(within(groupRow("NP Type")).getByText("AoE")).toBeDefined();
    expect(within(groupRow("Class")).getByText("Berserker")).toBeDefined();
    expect(screen.queryByText("Match", { selector: "span" })).toBeNull();
  });

  it("filters by a buff category and shows matching kit details", () => {
    renderPage();
    clickPill("Buff", "Buster Up");
    const count = Number(/Showing (\d+)/.exec(showing())![1]);
    expect(count).toBeGreaterThan(50);
    expect(count).toBeLessThan(487);

    const artoria = cardOf("Altria Pendragon");
    expect(within(artoria).getByText("NP Buster · AoE")).toBeDefined();
    expect(within(artoria).getByText("★5")).toBeDefined();

    fireEvent.click(
      within(artoria).getByRole("button", { name: "Show kit details" })
    );
    expect(within(artoria).getByText(/Skill 2 — Mana Burst A/)).toBeDefined();
    expect(within(artoria).getAllByText(/Buster Up/).length).toBeGreaterThan(0);
    expect(within(artoria).getByText("Self")).toBeDefined();
  });

  it("scopes a buff to a target bucket", () => {
    renderPage();
    clickPill("Buff", "NP Gauge Up");
    clickPill("Target", "All allies");
    const count = Number(/Showing (\d+)/.exec(showing())![1]);
    expect(count).toBeGreaterThan(20);
    expect(cardOf("Zhuge Liang (El-Melloi II)")).toBeDefined();
    expect(screen.queryByText("Altria Pendragon", { selector: "p" })).toBeNull();
  });

  it("toggles Any/All matching when two buffs are selected", () => {
    renderPage();
    clickPill("Buff", "NP Gauge Up");
    clickPill("Buff", "Attack Up");
    const anyCount = Number(/Showing (\d+)/.exec(showing())![1]);
    expect(screen.getByText("Match", { selector: "span" })).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "All buffs" }));
    const allCount = Number(/Showing (\d+)/.exec(showing())![1]);
    expect(allCount).toBeGreaterThan(0);
    expect(allCount).toBeLessThan(anyCount);

    fireEvent.click(screen.getByRole("button", { name: "Any buff" }));
    expect(Number(/Showing (\d+)/.exec(showing())![1])).toBe(anyCount);
  });

  it("filters by NP type", () => {
    renderPage();
    clickPill("NP Type", "Support");
    const count = Number(/Showing (\d+)/.exec(showing())![1]);
    expect(count).toBeGreaterThan(20);
    expect(count).toBeLessThan(487);
    expect(cardOf("Altria Caster")).toBeDefined();
  });

  it("filters by class", () => {
    renderPage();
    clickPill("Class", "Shielder");
    expect(showing()).toBe("Showing 2 of 487 servants");
  });

  it("filters by owned status after toggling a servant", () => {
    renderPage();
    const artoria = cardOf("Altria Pendragon");
    fireEvent.click(within(artoria).getByRole("button", { name: "Not owned" }));

    const controls = screen.getByRole("combobox").parentElement!;
    fireEvent.click(within(controls).getByRole("button", { name: "Owned" }));
    expect(showing()).toBe("Showing 1 of 487 servants");
    expect(cardOf("Altria Pendragon")).toBeDefined();
  });

  it("prefills search from the ?search= url param", () => {
    window.history.replaceState({}, "", "/?search=zhuge");
    renderPage();
    expect(
      (screen.getByPlaceholderText("Search servants...") as HTMLInputElement).value
    ).toBe("zhuge");
    expect(showing()).toBe("Showing 1 of 487 servants");
  });

  it("resets a buff group with its All pill", () => {
    renderPage();
    clickPill("Buff", "Heal");
    const filtered = Number(/Showing (\d+)/.exec(showing())![1]);
    expect(filtered).toBeLessThan(487);
    clickPill("Buff", "All");
    expect(showing()).toBe("Showing 487 of 487 servants");
  });

  it("shows the empty state when nothing matches", () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText("Search servants..."), {
      target: { value: "zzz-not-a-servant" },
    });
    expect(
      screen.getByText("No servants found matching your criteria.")
    ).toBeDefined();
  });

  it("renders through the route page", async () => {
    const element = await ServantBuffsPage({
      searchParams: Promise.resolve({}),
    });
    renderPageWith(element);
    expect(showing()).toBe("Showing 487 of 487 servants");
  });

  it("prefills search from the server-side searchParams prop", async () => {
    const element = await ServantBuffsPage({
      searchParams: Promise.resolve({ search: "zhuge" }),
    });
    renderPageWith(element);
    expect(
      (screen.getByPlaceholderText("Search servants...") as HTMLInputElement)
        .value
    ).toBe("zhuge");
    expect(showing()).toBe("Showing 1 of 487 servants");
  });

  it("ignores an empty search param", async () => {
    const element = await ServantBuffsPage({
      searchParams: Promise.resolve({ search: "" }),
    });
    renderPageWith(element);
    expect(showing()).toBe("Showing 487 of 487 servants");
  });

  it("prefills via the client initialSearch prop", () => {
    renderPageWith(<ServantBuffPage initialSearch="zhuge" />);
    expect(
      (screen.getByPlaceholderText("Search servants...") as HTMLInputElement)
        .value
    ).toBe("zhuge");
    expect(showing()).toBe("Showing 1 of 487 servants");
  });
});
