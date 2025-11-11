const LAST_UPDATED_DATE = new Date("2024-11-12"); // Format: YYYY-MM-DD

export function getLastUpdatedDate() {
  const month = String(LAST_UPDATED_DATE.getMonth() + 1).padStart(2, "0");
  const day = String(LAST_UPDATED_DATE.getDate()).padStart(2, "0");
  const year = String(LAST_UPDATED_DATE.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
}
