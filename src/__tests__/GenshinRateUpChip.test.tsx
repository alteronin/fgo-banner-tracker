import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from "@testing-library/react";
import { ReactNode } from "react";
import { GenshinRateUpChip } from "@/components/GenshinRateUpChip";
import { UnitProvider } from "@/contexts/UnitContext";
import { findMapItemByName, type LogContext } from "@/lib/logPull";
import { getPulls, setPulls } from "@/lib/pullStorage";
import type { GamePull } from "@/types/pulls";
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
  options: {
    game?: UnitGame;
    bannerStart?: string;
    logContext?: LogContext;
  } = {}
) {
  const { game = "zzz", bannerStart = yesterday(), logContext } = options;
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
        logContext={logContext}
      />
    </Wrapper>
  );
}

function logCtx(overrides: Partial<LogContext> = {}): LogContext {
  return {
    game: "zzz",
    bannerType: "agent",
    bannerTitle: "Breeze of Solitude",
    bannerStart: yesterday(),
    bannerEnd: yesterday(),
    ...overrides,
  };
}

function seedPull(overrides: Partial<GamePull>): GamePull {
  return {
    id: "seed",
    gameId: "zzz",
    itemId: "1",
    unitId: null,
    name: "Item",
    rarity: 3,
    ts: Date.now() - 5 * 86400000,
    category: "character",
    ...overrides,
  };
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

  it("prompts the log dialog on click for a past loggable banner", () => {
    renderChip("Jane", { logContext: logCtx() });
    const chip = screen.getByRole("button", { name: /Jane/ });
    fireEvent.click(chip);

    const form = screen.getByRole("form", { name: "Log this pull" });
    expect(chip.getAttribute("title")).toBe("Click to change: Not owned");
    fireEvent.click(within(form).getByRole("button", { name: "Won 50/50" }));
    fireEvent.click(within(form).getByRole("button", { name: "Log pull" }));

    expect(
      screen.queryByRole("form", { name: "Log this pull" })
    ).toBeNull();
    expect(chip.getAttribute("title")).toBe("Click to change: Owned");
    const pulls = getPulls("zzz");
    expect(pulls).toHaveLength(1);
    expect(pulls[0]).toMatchObject({
      manual: true,
      fifty: "win",
      name: "Jane",
      unitId: "1028278",
      category: "character",
    });
    expect(document.querySelector('[data-icon="owned"]')).not.toBeNull();
  });

  it("applies the status cycle when logging is skipped", () => {
    renderChip("Jane", { logContext: logCtx() });
    const chip = screen.getByRole("button", { name: /Jane/ });
    fireEvent.click(chip);

    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(
      screen.queryByRole("form", { name: "Log this pull" })
    ).toBeNull();
    expect(getPulls("zzz")).toHaveLength(0);
    expect(chip.getAttribute("title")).toBe("Click to change: Owned");

    fireEvent.click(chip);
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(chip.getAttribute("title")).toBe(
      "Click to change: Planning to pull"
    );
  });

  it("prompts even when imports extend past the banner", () => {
    setPulls("zzz", [seedPull({ ts: Date.now() - 10 * 86400000 })]);
    renderChip("Jane", { logContext: logCtx() });
    const chip = screen.getByRole("button", { name: /Jane/ });

    fireEvent.click(chip);
    expect(
      screen.getByRole("form", { name: "Log this pull" })
    ).toBeDefined();
    expect(chip.getAttribute("title")).toBe("Click to change: Not owned");

    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(getPulls("zzz")).toHaveLength(1);
    expect(chip.getAttribute("title")).toBe("Click to change: Owned");
  });

  it("prompts again to log another copy when the unit was already pulled in the window", () => {
    const jane = findMapItemByName("zzz", "Jane")!;
    setPulls("zzz", [
      seedPull({
        ts: Date.parse(`${yesterday()}T12:00:00Z`),
        unitId: jane.unitId,
        rarity: 5,
        name: "Jane",
      }),
    ]);
    renderChip("Jane", { logContext: logCtx() });
    const chip = screen.getByRole("button", { name: /Jane/ });

    fireEvent.click(chip);
    expect(
      screen.getByRole("form", { name: "Log this pull" })
    ).toBeDefined();
    expect(screen.getByText(/already logged Jane/)).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(getPulls("zzz")).toHaveLength(1);
    expect(chip.getAttribute("title")).toBe("Click to change: Owned");
  });

  it("never prompts on future banners even with a log context", () => {
    renderChip("Jane", {
      bannerStart: tomorrow(),
      logContext: logCtx({ bannerStart: tomorrow(), bannerEnd: tomorrow() }),
    });

    fireEvent.click(screen.getByRole("button", { name: /Jane/ }));
    expect(
      screen.getByRole("button", { name: /Jane/ }).getAttribute("title")
    ).toBe("Click to change: Planning to pull");
    expect(
      screen.queryByRole("form", { name: "Log this pull" })
    ).toBeNull();
    expect(getPulls("zzz")).toHaveLength(0);
  });

  it("shows the check when the unit was pulled inside the banner window", () => {
    const jane = findMapItemByName("zzz", "Jane")!;
    setPulls("zzz", [
      seedPull({
        ts: Date.parse(`${yesterday()}T12:00:00Z`),
        unitId: jane.unitId,
        rarity: 5,
        name: "Jane",
      }),
    ]);
    renderChip("Jane");

    expect(document.querySelector('[data-icon="owned"]')).not.toBeNull();
    expect(document.querySelector('[data-icon="planning"]')).toBeNull();
  });

  it("hides the check when the only pull falls outside the banner window", () => {
    const jane = findMapItemByName("zzz", "Jane")!;
    setPulls("zzz", [
      seedPull({
        ts: Date.now() - 5 * 86400000,
        unitId: jane.unitId,
        rarity: 5,
        name: "Jane",
      }),
    ]);
    window.localStorage.setItem(
      "unit-status:zzz",
      JSON.stringify({ "1028278": "owned" })
    );
    renderChip("Jane");

    const chip = screen.getByRole("button", { name: /Jane/ });
    expect(chip.getAttribute("title")).toBe("Click to change: Owned");
    expect(document.querySelector('[data-icon="owned"]')).toBeNull();
    expect(document.querySelector('[data-icon="planning"]')).toBeNull();
  });

  it("hides the check for owned units with no pull recorded", () => {
    window.localStorage.setItem(
      "unit-status:zzz",
      JSON.stringify({ "1028278": "owned" })
    );
    renderChip("Jane");

    expect(document.querySelector('[data-icon="owned"]')).toBeNull();
  });

  it("keeps the owned check on games without pull tracking", () => {
    window.localStorage.setItem(
      "unit-status:hi3",
      JSON.stringify({ "1028278": "owned" })
    );
    renderChip("Jane", { game: "hi3" });

    expect(document.querySelector('[data-icon="owned"]')).not.toBeNull();
  });

  it("stars the chip when the unit is in the game's favorites", () => {
    window.localStorage.setItem(
      "faves:zzz",
      JSON.stringify({ "1": "1028278" })
    );
    renderChip("Jane");
    expect(screen.getByLabelText("In your favorites")).toBeInTheDocument();

    cleanup();
    window.localStorage.clear();
    renderChip("Jane");
    expect(screen.queryByLabelText("In your favorites")).toBeNull();
  });
});
