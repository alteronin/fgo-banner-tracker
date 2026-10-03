import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import ServantsPage from "@/app/servants/page";
import { ServantProvider } from "@/contexts/ServantContext";

vi.mock("next/image", () => ({
  default: (props: { alt: string }) => <span role="img" aria-label={props.alt} />,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/servants",
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

function renderServants() {
  return render(
    <ServantProvider>
      <ServantsPage />
    </ServantProvider>
  );
}

function classRow(): HTMLElement {
  const span = screen.getByText("Class", { selector: "span" });
  const row = span.closest("div");
  expect(row).not.toBeNull();
  return row as HTMLElement;
}

function clickClass(name: string) {
  fireEvent.click(within(classRow()).getByRole("button", { name }));
}

function showing(): string {
  return screen.getByText(/Showing \d+ of \d+/).textContent ?? "";
}

describe("ServantsPage class filter", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("shows all servants with the class group", () => {
    renderServants();
    expect(showing()).toBe("Showing 487 of 487 servants");
    expect(screen.getByText("Class", { selector: "span" })).toBeDefined();
    const [statusAll, classAll] = screen.getAllByRole("button", { name: "All" });
    expect(statusAll.getAttribute("aria-pressed")).toBe("true");
    expect(classAll.getAttribute("aria-pressed")).toBe("true");
  });

  it("filters to a single class", () => {
    renderServants();
    clickClass("Saber");
    expect(showing()).toBe("Showing 59 of 487 servants");
    expect(
      within(classRow()).getByRole("button", { name: "Saber" }).getAttribute("aria-pressed")
    ).toBe("true");
  });

  it("ORs multiple classes", () => {
    renderServants();
    clickClass("Saber");
    clickClass("Lancer");
    expect(showing()).toBe("Showing 115 of 487 servants");
  });

  it("resets via the group All button", () => {
    renderServants();
    clickClass("Beast");
    expect(showing()).toBe("Showing 14 of 487 servants");
    clickClass("All");
    expect(showing()).toBe("Showing 487 of 487 servants");
  });

  it("combines class with the status filter", () => {
    renderServants();
    clickClass("Saber");
    fireEvent.click(screen.getByRole("button", { name: "Owned" }));
    expect(showing()).toBe("Showing 0 of 487 servants");
    expect(
      screen.getByText("No servants found matching your criteria.")
    ).toBeDefined();
  });

  it("combines class with search", () => {
    renderServants();
    clickClass("Saber");
    fireEvent.change(screen.getByPlaceholderText("Search servants..."), {
      target: { value: "altria pendragon" },
    });
    const expected = showing();
    expect(expected.startsWith("Showing ")).toBe(true);
    expect(expected.endsWith(" of 487 servants")).toBe(true);
    expect(expected).not.toBe("Showing 0 of 487 servants");
  });
});
