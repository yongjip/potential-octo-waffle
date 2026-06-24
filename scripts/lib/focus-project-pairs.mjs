export const FOCUS_PROJECT_PAIRS = [
  {
    pair_id: "songpa-09-05",
    pair_name: "잠실우성4차 vs 장미1,2,3차",
    lane: "잠실/송파 내부 비교",
    rank_a: "9",
    rank_b: "5",
    short_a: "잠실우성4차",
    short_b: "장미1,2,3차",
    life_area: "잠실/송파",
    pair_question: "관리처분 이후 속도 프리미엄이 실제 혼잡·단절을 이기는가",
    same_day_route: "잠실역 -> 잠실우성4차 -> 잠실나루역 방향 -> 장미1,2,3차",
    default_follow_up_action:
      "project-notes/09-tw2w7iwv.md; project-notes/05-jmapt1.md; analysis/transport-location-context.md; analysis/life-area-comparison-worksheet.md; analysis/focus-area-decision-memo.md",
  },
  {
    pair_id: "cross-10-25",
    pair_name: "압구정3 vs 한양연립",
    lane: "강남 vs 구의/광진 비교",
    rank_a: "10",
    rank_b: "25",
    short_a: "압구정3",
    short_b: "한양연립",
    life_area: "강남 / 구의·광진",
    pair_question: "좋은 입지의 무거운 조건과 약한 사업의 좋은 접근 중 무엇이 더 설득력 있는가",
    same_day_route: "압구정역 또는 압구정로데오역 -> 압구정3 외곽 -> 강변역 -> 한양연립",
    default_follow_up_action:
      "project-notes/10-apgujeong3.md; project-notes/25-hanyanggaro.md; analysis/transport-location-context.md; analysis/life-area-comparison-worksheet.md; analysis/focus-area-decision-memo.md",
  },
  {
    pair_id: "cross-09-10",
    pair_name: "잠실우성4차 vs 압구정3",
    lane: "잠실/송파 vs 강남 비교",
    rank_a: "9",
    rank_b: "10",
    short_a: "잠실우성4차",
    short_b: "압구정3",
    life_area: "잠실/송파 / 강남",
    pair_question: "하나는 비용·이주, 다른 하나는 공공기여·규제인데 어느 쪽이 더 무거운가",
    same_day_route: "잠실역 -> 잠실우성4차 -> 압구정역 또는 압구정로데오역 -> 압구정3 외곽",
    default_follow_up_action:
      "project-notes/09-tw2w7iwv.md; project-notes/10-apgujeong3.md; analysis/transport-location-context.md; analysis/life-area-comparison-worksheet.md; analysis/focus-area-decision-memo.md",
  },
];

export const VALID_PAIR_COMPARISON_STATUSES = new Set(["draft", "reviewed", "applied"]);

export function pairById() {
  return new Map(FOCUS_PROJECT_PAIRS.map((row) => [row.pair_id, row]));
}

