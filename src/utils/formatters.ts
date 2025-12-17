const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

export function formatTimeAgo(timestamp: number | null): string {
  if (timestamp === null) {
    return "알 수 없음";
  }

  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 0) {
    return "방금 전";
  }

  if (diff < MINUTE_MS) {
    return "방금 전";
  }

  if (diff < HOUR_MS) {
    const minutes = Math.floor(diff / MINUTE_MS);
    return `${minutes}분 전`;
  }

  if (diff < DAY_MS) {
    const hours = Math.floor(diff / HOUR_MS);
    return `${hours}시간 전`;
  }

  if (diff < MONTH_MS) {
    const days = Math.floor(diff / DAY_MS);
    return `${days}일 전`;
  }

  if (diff < YEAR_MS) {
    const months = Math.floor(diff / MONTH_MS);
    return `${months}개월 전`;
  }

  const years = Math.floor(diff / YEAR_MS);
  return `${years}년 전`;
}

export function formatDateForTitle(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}년 ${month}월`;
}
