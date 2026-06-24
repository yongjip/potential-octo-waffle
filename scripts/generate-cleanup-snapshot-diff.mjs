#!/usr/bin/env node

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CURRENT_INPUT = "data/cleanup/cleanup-projects-gangnam-songpa-gwangjin.json";
const SNAPSHOT_DIR = "data/cleanup/snapshots";
const PRIORITY_INPUT = "analysis/priority-redevelopment-candidates.csv";
const OUT_JSON = "analysis/cleanup-snapshot-diff.json";
const OUT_CSV = "analysis/cleanup-snapshot-diff.csv";
const OUT_MD = "analysis/cleanup-snapshot-diff.md";

const FIELD_CHECKS = [
  { field: "current_stage", label: "진행단계", severity: "high" },
  { field: "public_doc_count", label: "공개자료 수", severity: "medium" },
  { field: "disclosure_timeliness", label: "공개적시성", severity: "low" },
  { field: "data_completeness", label: "자료충실도", severity: "low" },
  { field: "map_id", label: "서울도시공간포털 recordCode", severity: "medium" },
  { field: "project_type", label: "사업유형", severity: "medium" },
  { field: "representative_lot", label: "대표지번", severity: "medium" },
];

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  const fields = [
    "change_type",
    "severity",
    "priority_rank",
    "priority_tier",
    "focus_area",
    "district",
    "project_name",
    "project_type",
    "cafe_id",
    "field",
    "field_label",
    "previous_value",
    "current_value",
    "delta",
    "previous_collected_at",
    "current_collected_at",
    "recommended_action",
    "official_project_url",
    "official_map_url",
  ];
  return `${[fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n")}\n`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [headers, ...dataRows] = rows;
  if (!headers) return [];
  return dataRows
    .filter((dataRow) => dataRow.some((value) => value !== ""))
    .map((dataRow) => Object.fromEntries(headers.map((header, index) => [header, dataRow[index] ?? ""])));
}

async function optionalPriorityRows() {
  try {
    return parseCsv(await readFile(PRIORITY_INPUT, "utf8"));
  } catch {
    return [];
  }
}

function projectKey(row) {
  if (row.cafe_id) return `cafe:${row.cafe_id}`;
  return ["fallback", row.district_code, row.project_type, row.project_name, row.representative_lot].join("|");
}

function collectedAt(rows) {
  return rows.find((row) => row.collected_at)?.collected_at ?? "";
}

function numericPublicDocCount(value) {
  const number = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(number) ? number : null;
}

function snapshotCollectedAt(rows, file) {
  return {
    file,
    collected_at: collectedAt(rows),
    rows,
  };
}

async function listSnapshots() {
  let files = [];
  try {
    files = await readdir(SNAPSHOT_DIR);
  } catch {
    return [];
  }
  const jsonFiles = files
    .filter((file) => /^cleanup-projects-gangnam-songpa-gwangjin-\d+\.json$/.test(file))
    .sort();
  const snapshots = [];
  for (const file of jsonFiles) {
    const fullPath = path.join(SNAPSHOT_DIR, file);
    const rows = JSON.parse(await readFile(fullPath, "utf8"));
    if (Array.isArray(rows) && rows.length > 0) snapshots.push(snapshotCollectedAt(rows, fullPath));
  }
  return snapshots;
}

function selectPreviousSnapshot(snapshots, currentRows) {
  const currentTime = Date.parse(collectedAt(currentRows));
  const candidates = snapshots
    .filter((snapshot) => {
      const time = Date.parse(snapshot.collected_at);
      return Number.isFinite(time) && Number.isFinite(currentTime) ? time < currentTime : true;
    })
    .sort((a, b) => Date.parse(a.collected_at) - Date.parse(b.collected_at));
  return candidates.at(-1) ?? null;
}

function priorityIndex(rows) {
  const byCafeId = new Map();
  const byName = new Map();
  for (const row of rows) {
    if (row.cafe_id) byCafeId.set(row.cafe_id, row);
    byName.set(`${row.district}|${row.project_name}`, row);
  }
  return { byCafeId, byName };
}

function priorityFor(row, index) {
  return index.byCafeId.get(row.cafe_id) ?? index.byName.get(`${row.district}|${row.project_name}`) ?? {};
}

function actionFor(change) {
  if (change.change_type === "added_project") return "신규 사업장인지 확인하고 우선검토 후보 편입 여부를 판단";
  if (change.change_type === "removed_project") return "목록 제외 사유를 확인하고 해산/청산/명칭변경 여부를 점검";
  if (change.field === "current_stage") return "사업별 메모와 비교 매트릭스의 진행단계, 다음 확인 작업을 갱신";
  if (change.field === "public_doc_count") return "사업장 공개자료 목록에서 새 문서 제목과 일자를 확인";
  if (change.field === "map_id") return "서울도시공간포털 recordCode와 고시 원문 연결을 재확인";
  return "변경된 공식 항목을 사업별 메모에 기록하고 원문 근거를 대조";
}

function compareRows(previousRows, currentRows, priorityRows) {
  const previousByKey = new Map(previousRows.map((row) => [projectKey(row), row]));
  const currentByKey = new Map(currentRows.map((row) => [projectKey(row), row]));
  const priorities = priorityIndex(priorityRows);
  const previousCollectedAt = collectedAt(previousRows);
  const currentCollectedAt = collectedAt(currentRows);
  const changes = [];

  function pushChange(baseRow, patch) {
    const priority = priorityFor(baseRow, priorities);
    const change = {
      priority_rank: priority.rank ?? "",
      priority_tier: priority.priority_tier ?? "",
      focus_area: baseRow.focus_area ?? priority.focus_area ?? "",
      district: baseRow.district ?? priority.district ?? "",
      project_name: baseRow.project_name ?? priority.project_name ?? "",
      project_type: baseRow.project_type ?? priority.project_type ?? "",
      cafe_id: baseRow.cafe_id ?? priority.cafe_id ?? "",
      previous_collected_at: previousCollectedAt,
      current_collected_at: currentCollectedAt,
      official_project_url: baseRow.official_project_url ?? priority.official_project_url ?? "",
      official_map_url: baseRow.official_map_url ?? priority.official_map_url ?? "",
      ...patch,
    };
    changes.push({ ...change, recommended_action: actionFor(change) });
  }

  for (const [key, row] of currentByKey) {
    if (!previousByKey.has(key)) {
      pushChange(row, {
        change_type: "added_project",
        severity: "high",
        field: "project",
        field_label: "사업장",
        previous_value: "",
        current_value: row.current_stage || row.project_name,
        delta: "",
      });
    }
  }

  for (const [key, row] of previousByKey) {
    if (!currentByKey.has(key)) {
      pushChange(row, {
        change_type: "removed_project",
        severity: "high",
        field: "project",
        field_label: "사업장",
        previous_value: row.current_stage || row.project_name,
        current_value: "",
        delta: "",
      });
    }
  }

  for (const [key, current] of currentByKey) {
    const previous = previousByKey.get(key);
    if (!previous) continue;
    for (const check of FIELD_CHECKS) {
      const previousValue = previous[check.field] ?? "";
      const currentValue = current[check.field] ?? "";
      if (previousValue === currentValue) continue;
      const previousCount = check.field === "public_doc_count" ? numericPublicDocCount(previousValue) : null;
      const currentCount = check.field === "public_doc_count" ? numericPublicDocCount(currentValue) : null;
      const delta =
        previousCount !== null && currentCount !== null
          ? String(currentCount - previousCount)
          : "";
      pushChange(current, {
        change_type: "field_changed",
        severity: check.severity,
        field: check.field,
        field_label: check.label,
        previous_value: previousValue,
        current_value: currentValue,
        delta,
      });
    }
  }

  return changes.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return (
      (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9) ||
      Number(a.priority_rank || 9999) - Number(b.priority_rank || 9999) ||
      a.district.localeCompare(b.district, "ko") ||
      a.project_name.localeCompare(b.project_name, "ko")
    );
  });
}

function countBy(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      acc[row[field] || ""] = (acc[row[field] || ""] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, count]) => ({ name, count }));
}

function mdTable(rows, fields) {
  if (!rows.length) return "_변경 없음_";
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

function markdown({ changes, currentRows, previousRows, previousSnapshot }) {
  const highChanges = changes.filter((row) => row.severity === "high");
  const priorityChanges = changes.filter((row) => row.priority_rank);
  const stageChanges = changes.filter((row) => row.field === "current_stage");
  const docCountChanges = changes.filter((row) => row.field === "public_doc_count");
  return `# 정비사업 정보몽땅 스냅샷 변경 감시

작성 기준: ${new Date().toISOString()}

이 문서는 강남구·송파구·광진구 정비사업 정보몽땅 사업장 목록의 현재 스냅샷과 직전 스냅샷을 비교한 결과다. 단계 변경은 사업별 메모와 비교 매트릭스에 반영하고, 공개자료 수 증감은 새 문서 확인 큐로 보낸다.

## 비교 기준

| 항목 | 값 |
| --- | --- |
| 이전 스냅샷 | ${previousSnapshot?.file ?? "없음"} |
| 이전 수집시각 | ${collectedAt(previousRows) || "없음"} |
| 현재 파일 | ${CURRENT_INPUT} |
| 현재 수집시각 | ${collectedAt(currentRows) || "없음"} |
| 이전 사업장 수 | ${previousRows.length} |
| 현재 사업장 수 | ${currentRows.length} |
| 전체 변경 건수 | ${changes.length} |
| high 변경 | ${highChanges.length} |
| 우선검토 후보 관련 변경 | ${priorityChanges.length} |
| 진행단계 변경 | ${stageChanges.length} |
| 공개자료 수 변경 | ${docCountChanges.length} |

## 변경 유형

${mdTable(countBy(changes, "change_type"), [
  { key: "name", label: "유형" },
  { key: "count", label: "건수" },
])}

## 우선 확인 변경

${mdTable(changes.slice(0, 40), [
  { key: "severity", label: "중요도" },
  { key: "priority_rank", label: "후보순위" },
  { key: "focus_area", label: "생활권" },
  { key: "district", label: "자치구" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "항목" },
  { key: "previous_value", label: "이전" },
  { key: "current_value", label: "현재" },
  { key: "delta", label: "증감" },
  { key: "recommended_action", label: "권장 작업" },
])}

## 운영 규칙

1. 진행단계 변경은 \`analysis/project-comparison-matrix.md\`, \`project-notes/*.md\`, \`analysis/source-evidence-audit.md\` 순서로 반영한다.
2. 공개자료 수가 늘어난 사업장은 사업장 내부 공개자료 목록에서 새 문서 제목·일자·첨부 여부를 확인한다.
3. 신규 사업장은 우선검토 후보 30개 밖이라도 강남·잠실/송파·구의/광진 생활권 관련성이 높으면 후보 편입 여부를 검토한다.
4. 목록에서 사라진 사업장은 조합해산, 청산, 명칭 변경, 목록 필터 변화 가능성을 먼저 점검한다.
`;
}

async function main() {
  const currentRows = JSON.parse(await readFile(CURRENT_INPUT, "utf8"));
  const snapshots = await listSnapshots();
  const previousSnapshot = selectPreviousSnapshot(snapshots, currentRows);
  const previousRows = previousSnapshot?.rows ?? [];
  const priorityRows = await optionalPriorityRows();
  const changes = previousRows.length ? compareRows(previousRows, currentRows, priorityRows) : [];
  const output = {
    generated_at: new Date().toISOString(),
    current_input: CURRENT_INPUT,
    previous_snapshot: previousSnapshot?.file ?? "",
    previous_collected_at: collectedAt(previousRows),
    current_collected_at: collectedAt(currentRows),
    previous_count: previousRows.length,
    current_count: currentRows.length,
    change_count: changes.length,
    changes,
  };

  await writeFile(OUT_JSON, `${JSON.stringify(output, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(changes));
  await writeFile(OUT_MD, markdown({ changes, currentRows, previousRows, previousSnapshot }));

  console.log(
    JSON.stringify(
      {
        previous: previousSnapshot?.file ?? null,
        current: CURRENT_INPUT,
        changes: changes.length,
        output: "analysis/cleanup-snapshot-diff.{md,csv,json}",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
