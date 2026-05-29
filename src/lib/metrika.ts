const METRIKA_COUNTER_ID = 109492496;

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

export type MetrikaGoal = "userRegistered" | "inputToken" | "firstPayment";

export function trackMetrikaGoal(goal: MetrikaGoal, dedupeKey?: string) {
  if (typeof window === "undefined" || typeof window.ym !== "function") {
    return;
  }

  if (dedupeKey) {
    const storageKey = `metrika_goal:${dedupeKey}`;
    if (window.localStorage.getItem(storageKey) === "1") {
      return;
    }
    window.localStorage.setItem(storageKey, "1");
  }

  window.ym(METRIKA_COUNTER_ID, "reachGoal", goal);
}