import { useEffect, useState } from "react";

export function useSpamLandingStats(): number | null {
  const [totalMessages, setTotalMessages] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLandingMessages = async () => {
      try {
        const response = await fetch("/api/landing/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data: { total_messages?: unknown } = await response.json();
        if (
          typeof data.total_messages === "number" &&
          Number.isFinite(data.total_messages)
        ) {
          setTotalMessages(Math.max(0, Math.trunc(data.total_messages)));
        }
      } catch {
        // Keep localized fallback metric if the request fails.
      }
    };

    const onWindowLoad = () => {
      void fetchLandingMessages();
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

  return totalMessages;
}