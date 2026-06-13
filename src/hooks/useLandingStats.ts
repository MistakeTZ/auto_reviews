import { useEffect, useState } from "react";

export function useLandingStats(): number | null {
  const [totalAnswers, setTotalAnswers] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLandingReviews = async () => {
      try {
        const response = await fetch("/api/landing/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data: { total_answers?: unknown } = await response.json();
        if (
          typeof data.total_answers === "number" &&
          Number.isFinite(data.total_answers)
        ) {
          setTotalAnswers(Math.max(0, Math.trunc(data.total_answers)));
        }
      } catch {
        // Keep localized fallback metric if the request fails.
      }
    };

    const onWindowLoad = () => {
      void fetchLandingReviews();
    };

    if (document.readyState === "complete") {
      onWindowLoad();
    } else {
      window.addEventListener("load", onWindowLoad, { once: true });
    }

    return () => {
      controller.abort();
      window.removeEventListener("load", onWindowLoad);
    };
  }, []);

  return totalAnswers;
}
