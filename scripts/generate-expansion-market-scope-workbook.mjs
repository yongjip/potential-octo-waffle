#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const DATA_DIR = "data/market";
const OUT_MD = path.join(OUT_DIR, "expansion-market-scope-workbook.md");
const OUT_CSV = path.join(OUT_DIR, "expansion-market-scope-workbook.csv");
const OUT_JSON = path.join(OUT_DIR, "expansion-market-scope-workbook.json");
const OUT_SCOPE_JSON = path.join(DATA_DIR, "expansion-market-areas.json");
const OUT_SCOPE_CSV = path.join(DATA_DIR, "expansion-market-areas.csv");

const INPUTS = {
  expansionBrief: "analysis/expansion-interest-zone-brief.json",
  expansionShortlist: "analysis/expansion-interest-zone-shortlist.json",
  expansionCandidates: "data/research/expansion-interest-zone-candidates.json",
  coreMarketAreas: "data/market/project-market-areas.json",
  manualWorkbook: "analysis/market-manual-download-workbook.json",
  coreNormalizedTransactions: "data/market/transactions/manual-official-transactions-normalized.csv",
  expansionNormalizedTransactions: "data/market/transactions/expansion-manual-official-transactions-normalized.csv",
};

const ROOT = "/Users/yongjip/Projects/potential-octo-waffle";

const SOURCE_LABELS = {
  "seoul-open-data": "서울시 실거래 전체 원자료",
  "molit-apt-trade": "국토부 아파트 매매",
  "molit-apt-rent": "국토부 아파트 전월세",
  "molit-rowhouse-trade": "국토부 연립·다세대 매매",
  "molit-rowhouse-rent": "국토부 연립·다세대 전월세",
};

const SCOPE_DEFS = [
  {
    scope_id: "exp-market-gd-cheonho",
    zone_id: "exp-gangdong",
    zone_name: "강동권",
    seed_ref: "gd-seed-cheonho",
    district: "강동구",
    lawd_cd: "11740",
    dong: "천호동",
    emd_cd: "",
    emd_cd_status: "local_unconfirmed",
    market_role: "direct_baseline",
    core_reference: "잠실/송파",
    representative_projects: "천호3구역",
    shortlist_refs: ["exp-short-gd-cheonho3"],
    preferred_asset_types: "apartment,apt_rent,rowhouse,rowhouse_rent",
    transaction_scope: "법정동 baseline",
    seoul_open_data_filter: "자치구=강동구; 법정동=천호동",
    molit_rtms_query_keys: "LAWD_CD=11740; DEAL_YMD=YYYYMM",
    first_market_questions: "잠실/송파 동측 연장축으로 볼 때 천호동 거래량과 가격 방향이 같은 시기 잠실축과 얼마나 다르게 움직이는가? direct hit 후보 천호3구역 고시 전후 6개월/12개월 baseline 변화가 있는가?",
    data_quality_notes: "천호동 전체 baseline이라 개별 재정비촉진구역 프리미엄과 일반 주거 거래가 섞인다. 초기 단계에서는 dong-level 반응만 읽고 project-level 가격 해석은 보류한다.",
  },
  {
    scope_id: "exp-market-gd-seongnae",
    zone_id: "exp-gangdong",
    zone_name: "강동권",
    seed_ref: "gd-seed-seongnae",
    district: "강동구",
    lawd_cd: "11740",
    dong: "성내동",
    emd_cd: "",
    emd_cd_status: "local_unconfirmed",
    market_role: "direct_baseline",
    core_reference: "잠실/송파",
    representative_projects: "성내미주아파트 주택재건축정비사업",
    shortlist_refs: ["exp-short-gd-seongnaemiju"],
    preferred_asset_types: "apartment,apt_rent,rowhouse,rowhouse_rent",
    transaction_scope: "법정동 baseline",
    seoul_open_data_filter: "자치구=강동구; 법정동=성내동",
    molit_rtms_query_keys: "LAWD_CD=11740; DEAL_YMD=YYYYMM",
    first_market_questions: "올림픽공원 북측-성내동 내부 생활권이 잠실 배후축과 다른 가격 체급으로 움직이는가? 성내미주 기준 재건축 직접 hit가 장기 baseline과 얼마나 괴리되는가?",
    data_quality_notes: "성내동은 소규모 정비와 일반 아파트 거래가 섞일 수 있다. 2016년 고시 direct hit를 baseline 보조축으로 읽고 최신 단계 해석과 분리한다.",
  },
  {
    scope_id: "exp-market-gd-gildong",
    zone_id: "exp-gangdong",
    zone_name: "강동권",
    seed_ref: "gd-seed-gildong",
    district: "강동구",
    lawd_cd: "11740",
    dong: "길동",
    emd_cd: "",
    emd_cd_status: "local_unconfirmed",
    market_role: "direct_baseline",
    core_reference: "잠실/송파",
    representative_projects: "신동아1·2차아파트 주택재건축 정비사업; 길동 신동아3차아파트 주택재건축 정비구역",
    shortlist_refs: ["exp-short-gd-sindonga12", "exp-short-gd-gildong43"],
    preferred_asset_types: "apartment,apt_rent,rowhouse,rowhouse_rent",
    transaction_scope: "법정동 baseline",
    seoul_open_data_filter: "자치구=강동구; 법정동=길동",
    molit_rtms_query_keys: "LAWD_CD=11740; DEAL_YMD=YYYYMM",
    first_market_questions: "길동역-굽은다리역 배후의 거래층이 잠실 핵심축보다 낮은 체급에서도 안정적으로 유지되는가? 신동아1·2차 최신 고시 시점 전후 baseline에 거래량 변화가 있는가?",
    data_quality_notes: "길동 43번지 generic 카드와 신동아1·2차를 구분해야 한다. 시장 baseline은 길동 전체로 잡되 사업장 식별은 공식 원문과 정보몽땅 매칭이 더 닫힌 뒤에 세분화한다.",
  },
  {
    scope_id: "exp-market-ys-sindang",
    zone_id: "exp-yaksu",
    zone_name: "약수동 주변",
    seed_ref: "ys-seed-yaksu-sindang",
    district: "중구",
    lawd_cd: "11140",
    dong: "신당동",
    emd_cd: "",
    emd_cd_status: "local_unconfirmed",
    market_role: "adjacent_baseline",
    core_reference: "도심 경사 대조군",
    representative_projects: "신당 제8구역 주택재개발정비사업; 신당 제9주택재개발정비구역",
    shortlist_refs: ["exp-short-ys-sindang8", "exp-short-ys-sindang9"],
    preferred_asset_types: "apartment,apt_rent,rowhouse,rowhouse_rent",
    transaction_scope: "법정동 baseline",
    seoul_open_data_filter: "자치구=중구; 법정동=신당동",
    molit_rtms_query_keys: "LAWD_CD=11140; DEAL_YMD=YYYYMM",
    first_market_questions: "약수역 direct hit가 없는 상태에서 신당동 baseline이 약수-버티고개 경사 생활권의 대조군으로 충분한가? 신당8·9의 고시 기준값 전후에 거래 방향 변화가 있는가?",
    data_quality_notes: "신당동 baseline은 약수역 직접 보행권과 완전히 같지 않다. 약수권 해석은 direct hit가 생기기 전까지 adjacent 대조군이라는 점을 유지한다.",
  },
  {
    scope_id: "exp-market-ys-geumho",
    zone_id: "exp-yaksu",
    zone_name: "약수동 주변",
    seed_ref: "ys-seed-cheonggu",
    district: "성동구",
    lawd_cd: "11200",
    dong: "금호동",
    emd_cd: "",
    emd_cd_status: "local_unconfirmed",
    market_role: "adjacent_corridor_baseline",
    core_reference: "도심 경사 대조군",
    representative_projects: "금호 제14-1 주택재개발 정비사업",
    shortlist_refs: ["exp-short-ys-geumho14-1"],
    preferred_asset_types: "apartment,apt_rent,rowhouse,rowhouse_rent",
    transaction_scope: "법정동 baseline (금호동1가~4가 수동 포함 검토)",
    seoul_open_data_filter: "자치구=성동구; 법정동 like 금호동%",
    molit_rtms_query_keys: "LAWD_CD=11200; DEAL_YMD=YYYYMM",
    first_market_questions: "청구역-신금호 연결축을 약수권 보조 corridor로 읽을 때 금호 생활권 거래층은 얼마나 두꺼운가? 금호14-1 기준값은 약수권 direct 후보 부재를 보완하는 대조군으로 충분한가?",
    data_quality_notes: "실거래 원자료는 금호동1가~4가로 분리될 수 있다. 처음부터 exact one-dong처럼 가정하지 말고 금호동 계열 전체를 수동 필터로 묶는다.",
  },
  {
    scope_id: "exp-market-ys-oksu",
    zone_id: "exp-yaksu",
    zone_name: "약수동 주변",
    seed_ref: "ys-seed-oksu-edge",
    district: "성동구",
    lawd_cd: "11200",
    dong: "옥수동",
    emd_cd: "",
    emd_cd_status: "local_unconfirmed",
    market_role: "edge_context_baseline",
    core_reference: "도심 경사 대조군",
    representative_projects: "약수-옥수/한남 경계축 context",
    shortlist_refs: [],
    preferred_asset_types: "apartment,apt_rent,rowhouse,rowhouse_rent",
    transaction_scope: "법정동 baseline",
    seoul_open_data_filter: "자치구=성동구; 법정동=옥수동",
    molit_rtms_query_keys: "LAWD_CD=11200; DEAL_YMD=YYYYMM",
    first_market_questions: "약수-옥수 경계축이 경사·보행·규제 차이 때문에 신당/금호와 다른 시장 반응을 보이는가? direct 사업장 부재 상태에서 edge context baseline으로 유지할 가치가 있는가?",
    data_quality_notes: "옥수동은 아직 direct/adjacent official shortlist가 아니라 규제·보행 경계 비교군이다. 시장 반응을 넣더라도 project-level 신호가 아니라 생활권 edge context로만 읽는다.",
  },
];

function kstDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function fileLink(relPath) {
  return `[${relPath}](${ROOT}/${relPath})`;
}

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const fields = Object.keys(rows[0]);
  return `${[fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n")}\n`;
}

function mdTable(rows, fields) {
  if (!rows.length) return "_없음_";
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function readCsv(file) {
  const raw = await readFile(file, "utf8");
  const [headerLine, ...lines] = raw.trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  return lines.map((line) => {
    const values = [];
    let current = "";
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];
      if (char === '"') {
        if (quoted && next === '"') {
          current += '"';
          index += 1;
        } else {
          quoted = !quoted;
        }
      } else if (char === "," && !quoted) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current);
    return Object.fromEntries(headers.map((header, idx) => [header, values[idx] ?? ""]));
  });
}

async function readCsvOptional(file) {
  try {
    return await readCsv(file);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = String(row[field] || "").trim();
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countText(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"))
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function compact(values) {
  return unique(values.map((value) => String(value ?? "").trim())).join("; ");
}

function parseShortlistRefs(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeDong(value) {
  return String(value || "").trim();
}

function matchesDong(txDong, scopeDong) {
  const dong = normalizeDong(txDong);
  const scope = normalizeDong(scopeDong);
  if (!dong || !scope) return false;
  if (dong === scope) return true;
  if (scope === "금호동" && /^금호동[1-4]가$/.test(dong)) return true;
  return false;
}

function sourceWindows(workbookRows, source) {
  return unique(
    workbookRows
      .filter((row) => row.source === source)
      .map((row) => `${row.coverage_from}|${row.coverage_to}`),
  )
    .map((value) => {
      const [coverage_from, coverage_to] = value.split("|");
      return { coverage_from, coverage_to };
    })
    .sort((a, b) => `${a.coverage_from}|${a.coverage_to}`.localeCompare(`${b.coverage_from}|${b.coverage_to}`));
}

function expectedFilename(task) {
  return `${[task.source, task.district, task.dong, task.coverage_from, task.coverage_to].filter(Boolean).join("_").replace(/[^\w가-힣-%]+/g, "-")}.csv`;
}

function yearsForCoverage(coverageFrom) {
  const text = String(coverageFrom || "");
  return text.includes("-") ? text.slice(0, 4) : text.slice(0, 4);
}

async function main() {
  const expansionBrief = await readJson(INPUTS.expansionBrief);
  const expansionShortlist = await readJson(INPUTS.expansionShortlist);
  const expansionCandidates = await readJson(INPUTS.expansionCandidates);
  const coreMarketAreas = await readJson(INPUTS.coreMarketAreas);
  const manualWorkbook = await readJson(INPUTS.manualWorkbook);
  const [coreNormalizedTransactions, expansionNormalizedTransactions] = await Promise.all([
    readCsvOptional(INPUTS.coreNormalizedTransactions),
    readCsvOptional(INPUTS.expansionNormalizedTransactions),
  ]);
  const normalizedTransactions = [...coreNormalizedTransactions, ...expansionNormalizedTransactions];

  const shortlistById = new Map((expansionShortlist.rows || []).map((row) => [row.shortlist_id, row]));
  const candidateById = new Map(expansionCandidates.map((row) => [row.candidate_id, row]));
  const zoneBriefByName = new Map((expansionBrief.rows || []).map((row) => [row.zone_name, row]));
  const coreManifestDongs = new Set(coreMarketAreas.map((row) => String(row.dong || "").trim()).filter(Boolean));
  const workbookRows = manualWorkbook.rows || [];

  const scopeRows = SCOPE_DEFS.map((scope) => {
    const shortlistRows = scope.shortlist_refs.map((ref) => shortlistById.get(ref)).filter(Boolean);
    const candidate = candidateById.get(scope.seed_ref);
    const zoneBrief = zoneBriefByName.get(scope.zone_name);
    const normalizedRowCount = normalizedTransactions.filter((row) => matchesDong(row.legal_dong, scope.dong)).length;
    const currentManifestCoverage = coreManifestDongs.has(scope.dong) ? "already_in_core_manifest" : "not_in_core_manifest";
    const marketDataStatus = normalizedRowCount > 0 ? "latest_window_manual_data_present" : "scope_defined_not_integrated";
    return {
      ...scope,
      candidate_name: candidate?.candidate_name || "",
      candidate_search_scope: candidate?.search_scope || "",
      candidate_priority: candidate?.priority || "",
      comparison_to_core: candidate?.comparison_to_core || "",
      zone_activation_gap: zoneBrief?.activation_gap || "",
      zone_current_system_status: zoneBrief?.current_system_status || "",
      shortlist_count: shortlistRows.length,
      shortlist_project_names: compact(shortlistRows.map((row) => row.project_name)),
      shortlist_notice_refs: compact(shortlistRows.map((row) => `${row.notice_no} (${row.notice_date})`)),
      current_manifest_coverage: currentManifestCoverage,
      normalized_transaction_rows: normalizedRowCount,
      market_data_status: marketDataStatus,
      integration_next_step:
        normalizedRowCount > 0
          ? "latest-window 정규화 거래가 들어온 scope다. 남은 scope latest-window 수집과 backfill을 분리해서 닫고, 현재는 dong-level baseline으로만 읽는다."
          : "확장권 전용 scope/workbook로 먼저 운영하고, 수동 원자료가 쌓인 뒤 core market chain 병합 여부를 판단",
    };
  });

  const sourceCounts = {
    scope_rows: scopeRows.length,
    current_core_manifest_dongs: coreManifestDongs.size,
    normalized_rows_covering_expansion: scopeRows.reduce((sum, row) => sum + Number(row.normalized_transaction_rows || 0), 0),
  };

  const downloadRows = [];
  const seoulWindows = sourceWindows(workbookRows, "seoul-open-data");
  const molitSources = [
    "molit-apt-trade",
    "molit-apt-rent",
    "molit-rowhouse-trade",
    "molit-rowhouse-rent",
  ];

  for (const scope of scopeRows) {
    for (const window of seoulWindows) {
      const year = yearsForCoverage(window.coverage_from);
      downloadRows.push({
        section: "download_task",
        task_id: `seoul-open-data-${scope.scope_id}-${window.coverage_from}`,
        source: "seoul-open-data",
        source_kind: SOURCE_LABELS["seoul-open-data"],
        zone_name: scope.zone_name,
        district: scope.district,
        dong: scope.dong,
        lawd_cd: scope.lawd_cd,
        coverage_from: window.coverage_from,
        coverage_to: window.coverage_to,
        scope_ref: scope.scope_id,
        representative_projects: scope.representative_projects,
        required_filter: `신고년도=${year}; 자치구=${scope.district}; 법정동 필터=${scope.seoul_open_data_filter.split("; ").at(-1)}`,
        suggested_output_filename: expectedFilename({
          source: "seoul-open-data",
          district: scope.district,
          dong: scope.dong,
          coverage_from: window.coverage_from,
          coverage_to: window.coverage_to,
        }),
        manifest_status: "expansion_scope_defined_not_downloaded",
        note:
          scope.dong === "금호동"
            ? "금호동1가~4가 포함 여부를 수동 확인"
            : scope.dong === "옥수동"
              ? "edge context baseline이므로 direct project 해석 금지"
              : "dong-level baseline만 먼저 확보",
      });
    }

    for (const source of molitSources) {
      for (const window of sourceWindows(workbookRows, source)) {
        downloadRows.push({
          section: "download_task",
          task_id: `${source}-${scope.scope_id}-${window.coverage_from}`,
          source,
          source_kind: SOURCE_LABELS[source],
          zone_name: scope.zone_name,
          district: scope.district,
          dong: scope.dong,
          lawd_cd: scope.lawd_cd,
          coverage_from: window.coverage_from,
          coverage_to: window.coverage_to,
          scope_ref: scope.scope_id,
          representative_projects: scope.representative_projects,
          required_filter: `LAWD_CD=${scope.lawd_cd}; 계약년월=${window.coverage_from}~${window.coverage_to}; 법정동 baseline=${scope.dong}`,
          suggested_output_filename: expectedFilename({
            source,
            district: scope.district,
            dong: scope.dong,
            coverage_from: window.coverage_from,
            coverage_to: window.coverage_to,
          }),
          manifest_status: "expansion_scope_defined_not_downloaded",
          note:
            scope.dong === "금호동"
              ? "금호동 계열 세부 법정동을 수동 포함"
              : "scope 편입 전 baseline 확보용",
        });
      }
    }
  }

  const sourceWindowRows = Object.entries(countBy(downloadRows, "source")).map(([source, task_count]) => ({
    source,
    source_kind: SOURCE_LABELS[source] || source,
    task_count,
    districts: compact(downloadRows.filter((row) => row.source === source).map((row) => row.district)),
    dongs: compact(downloadRows.filter((row) => row.source === source).map((row) => row.dong)),
    coverage_windows: compact(
      downloadRows
        .filter((row) => row.source === source)
        .map((row) => `${row.coverage_from}~${row.coverage_to}`),
    ),
  }));

  const latestWindow = downloadRows
    .map((row) => row.coverage_to)
    .sort()
    .at(-1) || "";
  const latestWindowRows = downloadRows.filter((row) => row.coverage_to === latestWindow);

  const summary = {
    generated_at: `${kstDate()} KST`,
    zone_count: unique(scopeRows.map((row) => row.zone_name)).length,
    scope_row_count: scopeRows.length,
    shortlist_covered_count: scopeRows.filter((row) => Number(row.shortlist_count) > 0).length,
    context_only_scope_count: scopeRows.filter((row) => Number(row.shortlist_count) === 0).length,
    current_core_manifest_dong_count: coreManifestDongs.size,
    expansion_dongs_already_in_core_manifest: scopeRows.filter((row) => row.current_manifest_coverage === "already_in_core_manifest").length,
    expansion_normalized_transaction_rows: scopeRows.reduce((sum, row) => sum + Number(row.normalized_transaction_rows || 0), 0),
    download_task_count: downloadRows.length,
    source_task_summary: countText(countBy(downloadRows, "source")),
    latest_window: latestWindow,
    latest_window_task_count: latestWindowRows.length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON, OUT_SCOPE_JSON, OUT_SCOPE_CSV],
  };

  const jsonPayload = {
    summary,
    scopeRows,
    sourceWindowRows,
    latestWindowRows,
    downloadRows,
  };

  const csvRows = [
    ...scopeRows.map((row) => ({
      section: "scope",
      item: `${row.zone_name} / ${row.dong}`,
      priority: row.market_role,
      district: row.district,
      lawd_cd: row.lawd_cd,
      representative_projects: row.representative_projects,
      note: row.integration_next_step,
    })),
    ...downloadRows.map((row) => ({
      section: row.section,
      item: `${row.source} / ${row.district} / ${row.dong} / ${row.coverage_from}~${row.coverage_to}`,
      priority: row.manifest_status,
      district: row.district,
      lawd_cd: row.lawd_cd,
      representative_projects: row.representative_projects,
      note: row.note,
    })),
  ];

  const md = `# 확장권 시장 scope 워크북

작성 기준: ${summary.generated_at}

이 문서는 강동권과 약수동 주변을 core market chain에 바로 합치지 않고, 별도 시장 scope로 먼저 닫기 위한 generated workbook이다. 공식 원문과 최신 단계 판정이 우선이고, 여기의 시장 범위는 생활권 baseline 비교를 위한 보조 장치다.

## 한눈 요약

| 항목 | 값 |
| --- | ---: |
| 권역 | ${summary.zone_count} |
| 법정동 scope | ${summary.scope_row_count} |
| shortlist 연결 scope | ${summary.shortlist_covered_count} |
| context-only scope | ${summary.context_only_scope_count} |
| 현재 core manifest 법정동 | ${summary.current_core_manifest_dong_count} |
| 확장권이 이미 core manifest에 들어간 수 | ${summary.expansion_dongs_already_in_core_manifest} |
| 확장권 정규화 거래 행 | ${summary.expansion_normalized_transaction_rows} |
| 제안 download task | ${summary.download_task_count} |
| 최신 window | ${summary.latest_window} |
| 최신 window task | ${summary.latest_window_task_count} |

현재 상태는 분명하다. 확장권 6개 법정동 scope는 모두 latest-window 정규화 거래가 들어온 상태지만, 아직 core manifest에는 편입하지 않았다. 따라서 바로 생활권 점수화로 합치지 말고, ${fileLink("analysis/expansion-zone-weekly-monitoring-cockpit.md")}와 ${fileLink("analysis/expansion-zone-latest-check-guide.md")}로 공식 단계·원문을 먼저 관리하면서, 시장 시그널은 분리 scope baseline으로만 읽는 것이 맞다.

## 법정동 scope

${mdTable(scopeRows, [
  { key: "zone_name", label: "권역" },
  { key: "district", label: "자치구" },
  { key: "dong", label: "법정동" },
  { key: "market_role", label: "역할" },
  { key: "representative_projects", label: "대표 기준" },
  { key: "shortlist_count", label: "shortlist" },
  { key: "current_manifest_coverage", label: "현재 core manifest" },
  { key: "normalized_transaction_rows", label: "정규화 거래 행" },
])}

## source/window 요약

${mdTable(sourceWindowRows, [
  { key: "source", label: "source" },
  { key: "source_kind", label: "공식 출처" },
  { key: "task_count", label: "task" },
  { key: "districts", label: "자치구" },
  { key: "dongs", label: "법정동" },
  { key: "coverage_windows", label: "기간" },
])}

## 해석 규칙

- 천호동·성내동·길동은 강동권 direct baseline이다. 잠실/송파 동측 연장축 비교용이지, 개별 사업장 가격을 확정하는 자료가 아니다.
- 신당동·금호동·옥수동은 약수권 adjacent 또는 edge baseline이다. 약수 direct hit가 없는 상태에서는 대조군으로만 읽는다.
- 금호동은 실거래 원자료에서 금호동1가~4가로 갈라질 수 있으므로 exact dong처럼 가정하지 않는다.
- 옥수동은 아직 official shortlist direct hit가 아니라 context edge다. 수치가 들어와도 규제·보행 비교군으로만 유지한다.

## 다음 순서

1. ${fileLink("analysis/expansion-zone-weekly-monitoring-cockpit.md")}와 ${fileLink("analysis/expansion-zone-latest-check-guide.md")}로 공식 단계 공백을 먼저 관리한다.
2. 시장 원자료는 ${fileLink("analysis/market-manual-download-workbook.md")}와 분리해서 이 workbook 기준으로만 모은다.
3. latest-window 정규화가 끝났으므로 ${fileLink("analysis/expansion-market-normalized-summary.md")}와 ${fileLink("analysis/expansion-market-signal-summary.md")}를 함께 보면서 권역·법정동 baseline을 읽는다.
4. core chain 편입 전에는 ${fileLink("analysis/life-area-market-reaction-brief.md")}의 확장권 상태를 분리 scope baseline 커버 완료로만 읽고, 공식 단계 재확인과 backfill 해석을 분리한다.
`;

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(jsonPayload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(csvRows));
  await writeFile(OUT_MD, `${md}\n`);
  await writeFile(OUT_SCOPE_JSON, `${JSON.stringify(scopeRows, null, 2)}\n`);
  await writeFile(OUT_SCOPE_CSV, toCsv(scopeRows));

  console.log(
    JSON.stringify(
      {
        scope_rows: scopeRows.length,
        download_tasks: downloadRows.length,
        output: "analysis/expansion-market-scope-workbook.{md,csv,json}; data/market/expansion-market-areas.{csv,json}",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
