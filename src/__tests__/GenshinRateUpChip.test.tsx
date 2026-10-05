import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ReactNode } from "react";
import { GenshinRateUpChip } from "@/components/GenshinRateUpChip";
import { UnitProvider } from "@/contexts/UnitContext";
import type { UnitGame } from "@/types/units";

vi.mock("next/image", () => ({
  default: (props: { alt: string }) => <span role="img" aria-label={props.alt} />,
}));

const ROSTER = [
  { id: "1028278", name: "Jane" },
  { id: "lc-408531", name: "Landau's Choice" },
];

function tomorrow(): string {
  return new Date(Date.now() + 86400000).toISOString().slice(0, 10);
}

function yesterday(): string {
  return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
}

function renderChip(
  name: string,
  options: { game?: UnitGame; bannerStart?: string } = {}
) {
  const { game = "zzz", bannerStart = yesterday() } = options;
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <UnitProvider game={game} roster={ROSTER}>
      {children}
    </UnitProvider>
  );
  return render(
    <Wrapper>
      <GenshinRateUpChip
        rateUp={{ name, url: null, image: null }}
        bannerStart={bannerStart}
      />
    </Wrapper>
  );
}

describe("GenshinRateUpChip", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("renders a button for roster-resolved names and cycles none → owned → planning → none", () => {
    renderChip("Jane Doe");
    const chip = screen.getByRole("button", { name: /Jane Doe/ });
    expect(chip.getAttribute("title")).toBe("Click to change: Not owned");

    fireEvent.click(chip);
    expect(chip.getAttribute("title")).toBe("Click to change: Owned");

    fireEvent.click(chip);
    expect(chip.getAttribute("title")).toBe("Click to change: Planning to pull");

    fireEvent.click(chip);
    expect(chip.getAttribute("title")).toBe("Click to change: Not owned");
  });

  it("keeps the status visible across re-renders", () => {
    renderChip("Jane");
    const chip = screen.getByRole("button", { name: /Jane/ });
    fireEvent.click(chip);
    cleanup();
    renderChip("Jane");
    expect(
      screen.getByRole("button", { name: /Jane/ }).getAttribute("title")
    ).toBe("Click to change: Owned");
  });

  it("future banners with resolved names only cycle planning on and off", () => {
    renderChip("Jane", { bannerStart: tomorrow() });
    const chip = screen.getByRole("button", { name: /Jane/ });

    fireEvent.click(chip);
    expect(chip.getAttribute("title")).toBe("Click to change: Planning to pull");

    fireEvent.click(chip);
    expect(chip.getAttribute("title")).toBe("Click to change: Not owned");

    fireEvent.click(chip);
    expect(chip.getAttribute("title")).toBe("Click to change: Planning to pull");
  });

  it("renders an inert span for unresolved names on past banners", () => {
    renderChip("Magachiyo");
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("Magachiyo")).toBeDefined();
    expect(screen.getByTitle("Not on the roster")).toBeDefined();
  });

  it("allows a planning toggle for unresolved names on future banners", () => {
    renderChip("Nihilux - Aha", { bannerStart: tomorrow() });
    const chip = screen.getByRole("button", { name: /Nihilux - Aha/ });
    expect(chip.getAttribute("title")).toBe("Future banner: click to plan");

    fireEvent.click(chip);
    expect(chip.getAttribute("title")).toBe("Future banner: click to plan");
    const stored = JSON.parse(
      window.localStorage.getItem("unit-status:zzz") || "{}"
    );
    expect(stored["name:nihilux aha"]).toBe("planning");

    fireEvent.click(chip);
    const cleared = JSON.parse(
      window.localStorage.getItem("unit-status:zzz") || "{}"
    );
    expect(cleared["name:nihilux aha"]).toBeUndefined();
  });

  it("stops propagation so the parent card does not open", () => {
    const parentClick = vi.fn();
    const { container } = render(
      <div onClick={parentClick}>
        <UnitProvider game="zzz" roster={ROSTER}>
          <GenshinRateUpChip
            rateUp={{ name: "Jane", url: null, image: null }}
            bannerStart={yesterday()}
          />
        </UnitProvider>
      </div>
    );
    const chip = container.querySelector("button");
    expect(chip).not.toBeNull();
    fireEvent.click(chip as Element);
    expect(parentClick).not.toHaveBeenCalled();
    const stored = JSON.parse(
      window.localStorage.getItem("unit-status:zzz") || "{}"
    );
    expect(stored["1028278"]).toBe("owned");
  });

  it("resolves hsr apostrophe names through the roster", () => {
    renderChip("Landau's Choice", { game: "hsr" });
    const chip = screen.getByRole("button", { name: /Landau's Choice/ });
    fireEvent.click(chip);
    const stored = JSON.parse(
      window.localStorage.getItem("unit-status:hsr") || "{}"
    );
    expect(stored["lc-408531"]).toBe("owned");
  });
});
