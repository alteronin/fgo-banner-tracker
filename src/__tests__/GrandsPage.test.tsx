import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from "@testing-library/react";
import GrandsPage from "@/app/grands/page";
import { ServantProvider } from "@/contexts/ServantContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import servants from "@/data/servants.json";

vi.mock("next/image", () => ({
  default: (props: { alt: string }) => <span role="img" aria-label={props.alt} />,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/grands",
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

const saber = servants.find((s) => s.className === "Saber")!;
const archer = servants.find((s) => s.className === "Archer")!;

function seedOwned(): void {
  localStorage.setItem(
    "fgo-servant-status",
    JSON.stringify({ [saber.slug]: "owned", [archer.slug]: "owned" })
  );
}

function renderGrands() {
  return render(
    <ThemeProvider>
      <ServantProvider>
        <GrandsPage />
      </ServantProvider>
    </ThemeProvider>
  );
}

function slot(id: string): HTMLElement {
  return screen.getByTestId(`grand-slot-${id}`);
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

describe("GrandsPage", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("renders nine class slots with FGO nav tabs", () => {
    seedOwned();
    renderGrands();
    expect(screen.getAllByTestId(/^grand-slot-/)).toHaveLength(9);
    const nav = screen.getByRole("navigation", { name: "Sections" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual([
      "Banners",
      "Servants",
      "Grands",
      "Pulls",
    ]);
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/",
      "/servants",
      "/grands",
      "/pulls",
    ]);
    expect(links[2].getAttribute("aria-current")).toBe("page");
    expect(
      within(slot("saber")).getByText("Empty — pick a Saber below")
    ).toBeInTheDocument();
  });

  it("assigns a servant to a class slot", () => {
    seedOwned();
    renderGrands();
    fireEvent.click(chipIn("saber", saber.name));

    const featured = within(slot("saber")).getByTestId("grand-featured-saber");
    expect(within(featured).getByText(saber.name)).toBeInTheDocument();
    expect(within(featured).getByText("Saber")).toBeInTheDocument();
    expect(screen.getByText("1 of 9 selected")).toBeInTheDocument();
  });

  it("toggles off when the selected servant is clicked again", () => {
    seedOwned();
    renderGrands();
    fireEvent.click(chipIn("saber", saber.name));
    fireEvent.click(chipIn("saber", saber.name));
    expect(
      within(slot("saber")).queryByTestId("grand-featured-saber")
    ).toBeNull();
    expect(screen.getByText("0 of 9 selected")).toBeInTheDocument();
  });

  it("swaps servants across slots and marks the foreign slot", () => {
    seedOwned();
    renderGrands();
    fireEvent.click(chipIn("saber", saber.name));
    fireEvent.click(chipIn("archer", archer.name));

    fireEvent.click(
      screen.getByRole("button", { name: `Move ${saber.name} to next slot` })
    );

    expect(
      within(slot("saber")).getByTestId("grand-featured-saber")
    ).toHaveTextContent(archer.name);
    const archerFeatured = within(slot("archer")).getByTestId(
      "grand-featured-archer"
    );
    expect(archerFeatured).toHaveTextContent(saber.name);
    expect(within(archerFeatured).getByText("Archer slot")).toBeInTheDocument();
  });

  it("shows cross-links for the featured servant", () => {
    seedOwned();
    renderGrands();
    fireEvent.click(chipIn("saber", saber.name));

    const featured = within(slot("saber")).getByTestId("grand-featured-saber");
    const banners = within(featured).getByText("Banners").closest("a");
    expect(banners?.getAttribute("href")).toBe(
      `/?search=${encodeURIComponent(saber.name)}`
    );
    const servantsLink = within(featured).getByText("Servants").closest("a");
    expect(servantsLink?.getAttribute("href")).toBe(
      `/servants?search=${encodeURIComponent(saber.name)}`
    );
  });

  it("edits label and note on a class slot", () => {
    seedOwned();
    renderGrands();

    fireEvent.click(
      screen.getByRole("button", { name: "Edit label for Saber" })
    );
    const labelInput = screen.getByLabelText("Label for Saber");
    fireEvent.change(labelInput, { target: { value: "Go-to Saber" } });
    fireEvent.keyDown(labelInput, { key: "Enter" });
    expect(within(slot("saber")).getByText("Go-to Saber")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Add note for Go-to Saber" })
    );
    const noteInput = screen.getByLabelText("Note for Go-to Saber");
    fireEvent.change(noteInput, { target: { value: "grail 10/10/10" } });
    fireEvent.keyDown(noteInput, { key: "Enter" });
    expect(
      within(slot("saber")).getByText(/grail 10\/10\/10/)
    ).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem("fave-notes:fgo") ?? "{}");
    expect(stored.saber).toEqual({
      label: "Go-to Saber",
      note: "grail 10/10/10",
    });
  });
});
