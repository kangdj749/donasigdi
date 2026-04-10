export function getAffiliate() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("attribution");
    if (!raw) return null;

    const data = JSON.parse(raw);

    return {
      code: data.ref,
      src: data.src,
    };
  } catch {
    return null;
  }
}