import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from "@testing-library/react";
import { FavesPage, FAVES_SLOT_COUNT } from "@/components/FavesPage";
import { ThemeProvider } from "@/contexts/ThemeContext";
import genshinUnits from "@/data/genshin-units.json";

vi.mock("next/image", () => ({
  default: (props: { alt: string }) => <span role="img" aria-label={props.alt} />,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/genshin/faves",
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

const characters = genshinUnits.filter(
  (u) => u.type === "character" && u.element && u.weapon
);
const unitA =
  characters.find((u) => u.rarity === "5") ?? characters[0];
const unitB =
  characters.find((u) => u.id !== unitA.id && u.rarity === "4") ??
  characters.find((u) => u.id !== unitA.id)!;

function seedOwned(): void {
  localStorage.setItem(
    "unit-status:genshin",
    JSON.stringify({ [unitA.id]: "owned", [unitB.id]: "owned" })
  );
}

function renderFaves() {
  return render(
    <ThemeProvider>
      <FavesPage game="genshin" />
    </ThemeProvider>
  );
}

function slot(id: string): HTMLElement {
  return screen.getByTestId(`fave-slot-${id}`);
}

function chipIn(slotId: string, name: string): HTMLElement {
  const buttons = within(slot(slotId)).getAllByRole("button");
  const found = buttons.filter((button) => {
    const title = button.getAttribute("title") ?? "";
    return title === name || title.startsWith(`${name} (selected`);
  });
  expect(found.length).toBeGreaterThan(0);
  return found[0];
}

describe("FavesPage", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("renders all slots with empty states", () => {
    seedOwned();
    renderFaves();
    expect(screen.getAllByTestId(/^fave-slot-/)).toHaveLength(
      FAVES_SLOT_COUNT
    );
    expect(screen.getAllByText("Empty — pick a unit below")).toHaveLength(
      FAVES_SLOT_COUNT
    );
    expect(screen.getByText("0 of 9 selected")).toBeInTheDocument();
  });

  it("assigns a unit to a slot and deselects on second click", () => {
    seedOwned();
    renderFaves();
    fireEvent.click(chipIn("1", unitA.name));

    const featured = within(slot("1")).getByTestId("fave-featured-1");
    expect(within(featured).getByText(unitA.name)).toBeInTheDocument();
    expect(screen.getByText("1 of 9 selected")).toBeInTheDocument();

    fireEvent.click(chipIn("1", unitA.name));
    expect(within(slot("1")).queryByTestId("fave-featured-1")).toBeNull();
    expect(screen.getByText("0 of 9 selected")).toBeInTheDocument();
  });

  it("moves a unit between slots when picked from another slot's pool", () => {
    seedOwned();
    renderFaves();
    fireEvent.click(chipIn("1", unitA.name));
    fireEvent.click(chipIn("2", unitA.name));

    expect(within(slot("1")).queryByTestId("fave-featured-1")).toBeNull();
    expect(
      within(slot("2")).getByTestId("fave-featured-2")
    ).toBeInTheDocument();
    expect(screen.getByText("1 of 9 selected")).toBeInTheDocument();
  });

  it("swaps units with the next-slot arrow", () => {
    seedOwned();
    renderFaves();
    fireEvent.click(chipIn("1", unitA.name));
    fireEvent.click(chipIn("2", unitB.name));

    fireEvent.click(
      screen.getByRole("button", { name: `Move ${unitA.name} to next slot` })
    );

    expect(
      within(slot("1")).getByTestId("fave-featured-1")
    ).toHaveTextContent(unitB.name);
    expect(
      within(slot("2")).getByTestId("fave-featured-2")
    ).toHaveTextContent(unitA.name);
    expect(screen.getByText("2 of 9 selected")).toBeInTheDocument();
  });

  it("clears a slot with the clear button", () => {
    seedOwned();
    renderFaves();
    fireEvent.click(chipIn("1", unitA.name));
    fireEvent.click(screen.getByRole("button", { name: "Clear Favorite 1" }));
    expect(within(slot("1")).queryByTestId("fave-featured-1")).toBeNull();
    expect(screen.getByText("0 of 9 selected")).toBeInTheDocument();
  });

  it("edits the slot label and persists it", () => {
    seedOwned();
    renderFaves();
    fireEvent.click(
      screen.getByRole("button", { name: "Edit label for Favorite 1" })
    );
    const input = screen.getByLabelText("Label for Favorite 1");
    fireEvent.change(input, { target: { value: "Main DPS" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(within(slot("1")).getByText("Main DPS")).toBeInTheDocument();
    const stored = JSON.parse(
      localStorage.getItem("fave-notes:genshin") ?? "{}"
    );
    expect(stored["1"]).toEqual({ label: "Main DPS" });
  });

  it("edits the slot note and persists it", () => {
    seedOwned();
    renderFaves();
    fireEvent.click(
      screen.getByRole("button", { name: "Add note for Favorite 1" })
    );
    const input = screen.getByLabelText("Note for Favorite 1");
    fireEvent.change(input, { target: { value: "save for anni" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(within(slot("1")).getByText(/save for anni/)).toBeInTheDocument();
    const stored = JSON.parse(
      localStorage.getItem("fave-notes:genshin") ?? "{}"
    );
    expect(stored["1"]).toEqual({ note: "save for anni" });
  });

  it("shows cross-links for the featured unit", () => {
    seedOwned();
    renderFaves();
    fireEvent.click(chipIn("1", unitA.name));

    const featured = within(slot("1")).getByTestId("fave-featured-1");
    const banners = within(featured).getByText("Banners").closest("a");
    expect(banners?.getAttribute("href")).toBe(
      `/genshin?search=${encodeURIComponent(unitA.name)}`
    );
    const wiki = within(featured).getByText("Wiki").closest("a");
    expect(wiki?.getAttribute("href")).toBe(unitA.url);
  });

  it("shows rarity stars on owned chips and the featured card", () => {
    seedOwned();
    renderFaves();
    if (unitA.rarity !== "5") return;
    expect(within(slot("1")).getAllByText("★★★★★").length).toBeGreaterThan(0);
    fireEvent.click(chipIn("1", unitA.name));
    const featured = within(slot("1")).getByTestId("fave-featured-1");
    expect(within(featured).getByText("★★★★★")).toBeInTheDocument();
  });

  it("prompts to mark units owned when the roster is empty", () => {
    renderFaves();
    expect(screen.getByText(/No owned characters and weapons yet/)).toBeInTheDocument();
    expect(
      within(slot("1")).getByText("No owned characters and weapons to pick from yet")
    ).toBeInTheDocument();
  });
});
