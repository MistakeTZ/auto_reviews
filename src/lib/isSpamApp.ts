export function checkIsSpamApp(): boolean {
  if (typeof window !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_IS_SPAM_APP === "true" ||
      window.location.hostname.includes("spam") ||
      window.location.port === "3001"
    );
  }
  return process.env.NEXT_PUBLIC_IS_SPAM_APP === "true";
}
