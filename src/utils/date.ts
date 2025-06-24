// 오늘을 기준으로 앞뒤 2일씩 총 5일의 날짜 배열을 반환하는 함수
export type DateInfo = {
  date: number;      // 일자 (예: 23)
  day: string;       // 요일 (예: "월")
  fullDate: Date;    // 실제 Date 객체
};

const KOREAN_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function getDateRangeWithTodayCenter(range: number = 2): DateInfo[] {
  const today = new Date();
  const result: DateInfo[] = [];

  for (let i = -range; i <= range; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push({
      date: d.getDate(),
      day: KOREAN_DAYS[d.getDay()],
      fullDate: d,
    });
  }
  return result;
}

// 2025년 5월 1일부터 2025년 7월 31일까지의 모든 날짜 배열 반환
export function getCalendarDatesInRange(): DateInfo[] {
  const start = new Date(2025, 4, 1); // 5월 (월은 0-indexed)
  const end = new Date(2025, 6, 31); // 7월 31일
  const result: DateInfo[] = [];
  let d = new Date(start);
  while (d <= end) {
    result.push({
      date: d.getDate(),
      day: KOREAN_DAYS[d.getDay()],
      fullDate: new Date(d),
    });
    d.setDate(d.getDate() + 1);
  }
  return result;
} 