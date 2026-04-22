const KEY = "datawave_fp";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getFingerprint(): string {
  if (typeof window === "undefined") return "ssr";
  let fp = localStorage.getItem(KEY);
  if (!fp) {
    fp = uuid();
    localStorage.setItem(KEY, fp);
  }
  return fp;
}
