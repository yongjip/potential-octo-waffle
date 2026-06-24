#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "official-update-source-verification-bridge.md");
const OUT_CSV = path.join(OUT_DIR, "official-update-source-verification-bridge.csv");
const OUT_JSON = path.join(OUT_DIR, "official-update-source-verification-bridge.json");

const INPUTS = {
  officialUpdateIntake: "data/review/official-update-intake.json",
  closureLedger: "analysis/source-verification-closure-ledger.json",
  closureDecisions: "data/review/source-verification-closure-decisions.json",
  updateImpactLedger: "analysis/update-impact-ledger.json",
};

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

const UPDATED_AT = `${kstDate()} KST`;
const SOURCE_VERIFICATION_SOURCE_IDS = new Set(["seoul_urban_notice", "district_notice", "seoul_sibo"]);
const SOURCE_VERIFICATION_TRIGGER_TYPES = new Set(["official_notice", "district_notice"]);
const CLOSED_STATUSES = new Set(["confirmed", "deferred"]);
const BLOCKING_STATUSES = new Set(["open", "conflict"]);

function csvEscape(value) {
  const text = String(value ?? "");
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

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    if (fallback !== null) return fallback;
    throw new Error(`Cannot read JSON: ${file}`);
  }
}

function rowsFrom(value) {
  if (Array.isArray(value)) return value;
  return value.rows || value.project_rows || value.workflow_rows || [];
}

function asText(value) {
  return String(value ?? "").trim();
}

function compact(items, limit = 6) {
  return [...new Set(items.map((item) => asText(item)).filter(Boolean))].slice(0, limit).join("; ");
}

function compactText(value, limit = 140) {
  const text = asText(value).replace(/\s+/g, " ");
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 3)}...`;
}

function countBy(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      const key = row[field] || "미분류";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function normalizeProjectName(value) {
  return asText(value)
    .toLowerCase()
    .replace(/[()[\]{}'"`~!@#$%^&*+=?:;,.\/\\|-]/g, "")
    .replace(/\s+/g, "");
}

function normalizeRank(value) {
  const text = asText(value);
  if (!text) return "";
  const num = Number(text);
  return Number.isFinite(num) ? String(num) : text;
}

function normalizeNoticeNo(value) {
  const match = asText(value).match(/(\d{4})\s*-\s*(\d{1,4})/);
  if (!match) return "";
  return `${match[1]}-${Number(match[2])}`;
}

function splitSemicolon(value) {
  return asText(value)
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stripLineSuffix(value) {
  return asText(value).replace(/:\d+$/, "");
}

function extractNoticeCodes(text) {
  return [...asText(text).matchAll(/(\d{5}[A-Z]{3}\d{12})/g)].map((match) => match[1]);
}

function extractNoticeNos(text) {
  const normalized = new Set();
  const direct = normalizeNoticeNo(text);
  if (direct) normalized.add(direct);
  for (const match of asText(text).matchAll(/제\s*(\d{4}\s*-\s*\d{1,4})\s*호/g)) {
    const noticeNo = normalizeNoticeNo(match[1]);
    if (noticeNo) normalized.add(noticeNo);
  }
  return [...normalized];
}

function unique(values) {
  return [...new Set(values.map((value) => asText(value)).filter(Boolean))];
}

function routeToSourceVerification(row) {
  return SOURCE_VERIFICATION_SOURCE_IDS.has(asText(row.source_id)) || SOURCE_VERIFICATION_TRIGGER_TYPES.has(asText(row.trigger_type));
}

function buildHandleSet(row) {
  const noticeCodes = new Set();
  const noticeNos = new Set();
  const evidencePaths = [];
  const urls = new Set();
  const texts = [
    row.title,
    row.official_url,
    row.attachment_paths,
    row.local_text_paths,
    row.notice_no,
    row.notice_code,
    row.urban_notice_code,
    row.urban_notice_title,
  ];

  for (const text of texts) {
    for (const noticeCode of extractNoticeCodes(text)) noticeCodes.add(noticeCode);
    for (const noticeNo of extractNoticeNos(text)) noticeNos.add(noticeNo);
  }

  for (const url of splitSemicolon(row.official_url)) {
    urls.add(url);
  }

  for (const rawPath of [...splitSemicolon(row.attachment_paths), ...splitSemicolon(row.local_text_paths)]) {
    const cleanPath = stripLineSuffix(rawPath);
    if (!cleanPath) continue;
    evidencePaths.push(cleanPath);
    for (const noticeCode of extractNoticeCodes(cleanPath)) noticeCodes.add(noticeCode);
    for (const noticeNo of extractNoticeNos(cleanPath)) noticeNos.add(noticeNo);
  }

  return {
    noticeCodes: [...noticeCodes],
    noticeNos: [...noticeNos],
    evidencePaths: unique(evidencePaths),
    urls: [...urls],
  };
}

function buildDecisionMaps(decisionRows) {
  const decisionById = new Map();
  const latestByClosure = new Map();
  for (const row of decisionRows) {
    if (row.decision_id) decisionById.set(row.decision_id, row);
    if (row.closure_id) latestByClosure.set(row.closure_id, row);
  }
  return { decisionById, latestByClosure };
}

function buildProjectImpactMap(projectRows) {
  const byRank = new Map();
  for (const row of projectRows) {
    const rank = normalizeRank(row.rank);
    if (rank) byRank.set(rank, row);
  }
  return byRank;
}

function validDecisionContext(ledgerRow, decision) {
  if (!decision || !decision.decision_id) return false;
  return (
    normalizeProjectName(decision.project_name) === normalizeProjectName(ledgerRow.project_name) &&
    asText(decision.field_label) === asText(ledgerRow.field_label)
  );
}

function findMatchReasons({ update, handles, ledgerRow, decision }) {
  const rankMatch = normalizeRank(update.project_rank || update.rank) && normalizeRank(update.project_rank || update.rank) === normalizeRank(ledgerRow.rank);
  const projectMatch =
    normalizeProjectName(update.project_name) && normalizeProjectName(update.project_name) === normalizeProjectName(ledgerRow.project_name);

  const sourceBlob = [
    ledgerRow.source_to_open,
    ledgerRow.source_path_or_url,
    ledgerRow.current_value,
    ledgerRow.candidate_value,
    validDecisionContext(ledgerRow, decision) ? decision.evidence_files : "",
  ]
    .map((value) => asText(value))
    .join(" ");

  const noticeCodeMatch = handles.noticeCodes.some((code) => sourceBlob.includes(code));
  const noticeNoMatch = handles.noticeNos.some(
    (noticeNo) => sourceBlob.includes(noticeNo) || sourceBlob.includes(`제${noticeNo}호`) || sourceBlob.includes(noticeNo.replace("-", "")),
  );
  const pathMatch = handles.evidencePaths.some((filePath) => sourceBlob.includes(filePath) || sourceBlob.includes(path.basename(filePath)));
  const urlMatch = handles.urls.some((url) => sourceBlob.includes(url));

  const reasons = [];
  if (rankMatch) reasons.push("rank");
  if (projectMatch) reasons.push("project_name");
  if (noticeCodeMatch) reasons.push("notice_code");
  if (noticeNoMatch) reasons.push("notice_no");
  if (pathMatch) reasons.push("path");
  if (urlMatch) reasons.push("official_url");

  return {
    rankMatch,
    projectMatch,
    noticeCodeMatch,
    noticeNoMatch,
    pathMatch,
    urlMatch,
    reasons,
  };
}

function buildCandidateRows({ updateRows, ledgerRows, decisionById, latestByClosure, impactByRank }) {
  const candidates = [];

  for (const update of updateRows) {
    const handles = buildHandleSet(update);
    const updateRank = normalizeRank(update.project_rank || update.rank);
    const updateProject = normalizeProjectName(update.project_name);
    const impactRow = impactByRank.get(updateRank) || {};

    for (const ledgerRow of ledgerRows) {
      const decision = decisionById.get(ledgerRow.decision_id) || latestByClosure.get(ledgerRow.closure_id) || {};
      const decisionContextOk = validDecisionContext(ledgerRow, decision);
      const match = findMatchReasons({ update, handles, ledgerRow, decision });
      if (!match.reasons.length) continue;

      const directMatch = match.rankMatch || match.projectMatch;
      const evidenceMatch = match.noticeCodeMatch || match.noticeNoMatch || match.pathMatch || match.urlMatch;
      const scope = directMatch && evidenceMatch ? "direct+evidence" : directMatch ? "direct" : "related_notice";
      const sourcePaths = unique(
        [ledgerRow.source_to_open, ledgerRow.source_path_or_url, decisionContextOk ? decision.evidence_files : ""]
          .flatMap((value) => splitSemicolon(value))
          .map((value) => stripLineSuffix(value)),
      );

      candidates.push({
        update_id: update.update_id,
        project_rank: updateRank,
        update_project_name: update.project_name || "",
        update_notice_no: normalizeNoticeNo(update.notice_no) || compact(handles.noticeNos, 1),
        update_notice_code: compact(handles.noticeCodes, 1),
        match_scope: scope,
        direct_match: directMatch ? "Y" : "",
        evidence_match: evidenceMatch ? "Y" : "",
        closure_id: ledgerRow.closure_id || "",
        rank: normalizeRank(ledgerRow.rank),
        project_name: ledgerRow.project_name || "",
        field_label: ledgerRow.field_label || "",
        closure_status: ledgerRow.closure_status || "",
        latest_decision_status: decisionContextOk ? decision.decision_status || "" : "",
        decision_id: decisionContextOk ? ledgerRow.decision_id || decision.decision_id || "" : "",
        decision_context_valid: decisionContextOk ? "Y" : "",
        match_reasons: match.reasons.join("; "),
        resolved_value: decisionContextOk ? asText(decision.resolved_value) : "",
        decision_basis: compactText(decisionContextOk ? decision.decision_basis : ledgerRow.recommended_closure || "", 120),
        follow_up_action: compactText(decisionContextOk ? decision.follow_up_action : "", 160),
        source_to_open: compactText(ledgerRow.source_to_open || "", 160),
        evidence_files: compactText(decisionContextOk ? decision.evidence_files || "" : "", 160),
        primary_triage_files: compactText(impactRow.first_triage_files || "", 160),
        affected_outputs: compactText(impactRow.affected_outputs || "", 160),
        decision_gate: compactText(impactRow.decision_gate || "", 140),
        current_update_status: update.decision_status || "inbox",
        current_evidence_status: update.evidence_status || "unverified",
        source_path_count: sourcePaths.length,
        source_path_sample: compact(sourcePaths, 4),
        related_project: normalizeProjectName(ledgerRow.project_name) !== updateProject ? "Y" : "",
      });
    }
  }

  return candidates.sort((a, b) => {
    const updateCompare = asText(a.update_id).localeCompare(asText(b.update_id));
    if (updateCompare !== 0) return updateCompare;
    const scopeOrder = { "direct+evidence": 0, direct: 1, related_notice: 2 };
    const scopeCompare = (scopeOrder[a.match_scope] ?? 9) - (scopeOrder[b.match_scope] ?? 9);
    if (scopeCompare !== 0) return scopeCompare;
    const rankCompare = Number(a.rank || 0) - Number(b.rank || 0);
    if (rankCompare !== 0) return rankCompare;
    return asText(a.closure_id).localeCompare(asText(b.closure_id));
  });
}

function summarizeClosureStatus(rows) {
  return countBy(rows, "closure_status");
}

function targetRowsForBridge(candidateRows) {
  const directRows = candidateRows.filter((row) => row.direct_match === "Y");
  if (directRows.length) return directRows;
  return candidateRows.filter((row) => row.evidence_match === "Y");
}

function determineBridgeStatus(candidateRows) {
  if (!candidateRows.length) return "no_candidate_found";
  const targetRows = targetRowsForBridge(candidateRows);
  if (!targetRows.length) return "manual_review_needed";
  if (targetRows.some((row) => BLOCKING_STATUSES.has(row.closure_status))) return "manual_review_needed";
  const closedCount = targetRows.filter((row) => CLOSED_STATUSES.has(row.closure_status)).length;
  const pendingCount = targetRows.filter((row) => row.closure_status === "pending").length;
  if (targetRows.every((row) => CLOSED_STATUSES.has(row.closure_status))) {
    return candidateRows.some((row) => row.related_project === "Y") ? "reflected_with_related_projects" : "reflected";
  }
  if (closedCount > 0 && pendingCount > 0 && closedCount + pendingCount === targetRows.length) {
    return "reflected_with_followups";
  }
  return "manual_review_needed";
}

function suggestedStatus(currentStatus, bridgeStatus) {
  if (["reflected", "reflected_with_related_projects", "reflected_with_followups"].includes(bridgeStatus)) return "applied";
  return currentStatus || "triaged";
}

function suggestedAction(bridgeStatus) {
  if (bridgeStatus === "reflected" || bridgeStatus === "reflected_with_related_projects") {
    return "official-update-intake 행을 applied로 올리고 재생성";
  }
  if (bridgeStatus === "reflected_with_followups") {
    return "official-update-intake는 applied로 두고, 남은 pending closure를 source verification action queue에서 계속 추적";
  }
  if (bridgeStatus === "no_candidate_found") {
    return "project_rank, noticeCode, notice_no 기준으로 source verification closure 수동 매핑";
  }
  return "candidate closure_id를 열어 pending/confirmed/conflict/deferred 반영 여부를 수동 판정";
}

function buildUpdateRows(updateRows, candidateRows, impactByRank) {
  const candidatesByUpdate = new Map();
  for (const row of candidateRows) {
    if (!candidatesByUpdate.has(row.update_id)) candidatesByUpdate.set(row.update_id, []);
    candidatesByUpdate.get(row.update_id).push(row);
  }

  return updateRows.map((row, index) => {
    const rank = normalizeRank(row.project_rank || row.rank);
    const candidates = candidatesByUpdate.get(row.update_id) || [];
    const targetRows = targetRowsForBridge(candidates);
    const bridgeStatus = determineBridgeStatus(candidates);
    const impactRow = impactByRank.get(rank) || {};
    return {
      row_no: index + 1,
      update_id: row.update_id || `missing-${index + 1}`,
      project_rank: rank,
      project_name: row.project_name || "",
      source_id: row.source_id || "",
      trigger_type: row.trigger_type || "",
      current_decision_status: row.decision_status || "inbox",
      suggested_decision_status: suggestedStatus(row.decision_status || "inbox", bridgeStatus),
      evidence_status: row.evidence_status || "unverified",
      notice_no: normalizeNoticeNo(row.notice_no) || "",
      notice_code: compact(buildHandleSet(row).noticeCodes, 1),
      candidate_closure_count: candidates.length,
      target_candidate_count: targetRows.length,
      direct_candidate_count: candidates.filter((candidate) => candidate.direct_match === "Y").length,
      evidence_candidate_count: candidates.filter((candidate) => candidate.evidence_match === "Y").length,
      related_project_count: new Set(candidates.filter((candidate) => candidate.related_project === "Y").map((candidate) => candidate.rank)).size,
      candidate_closure_ids: compact(candidates.map((candidate) => candidate.closure_id), 24),
      target_closure_status_mix: summarizeClosureStatus(targetRows),
      pending_followup_count: targetRows.filter((candidate) => candidate.closure_status === "pending").length,
      related_ranks: compact(candidates.filter((candidate) => candidate.related_project === "Y").map((candidate) => candidate.rank), 12),
      related_projects: compact(candidates.filter((candidate) => candidate.related_project === "Y").map((candidate) => candidate.project_name), 6),
      closure_status_mix: summarizeClosureStatus(candidates),
      bridge_status: bridgeStatus,
      suggested_next_action: suggestedAction(bridgeStatus),
      first_triage_files: compactText(impactRow.first_triage_files || "", 160),
      affected_outputs: compactText(impactRow.affected_outputs || "", 160),
      decision_gate: compactText(impactRow.decision_gate || "", 140),
    };
  });
}

function summarize(updateRows, candidateRows) {
  return {
    generated_at: UPDATED_AT,
    update_count: updateRows.length,
    source_verification_update_count: updateRows.length,
    candidate_closure_count: candidateRows.length,
    applied_candidate_count: updateRows.filter((row) => row.suggested_decision_status === "applied").length,
    manual_review_count: updateRows.filter((row) => row.bridge_status === "manual_review_needed").length,
    followup_update_count: updateRows.filter((row) => row.bridge_status === "reflected_with_followups").length,
    no_candidate_count: updateRows.filter((row) => row.bridge_status === "no_candidate_found").length,
    related_project_update_count: updateRows.filter((row) => Number(row.related_project_count || 0) > 0).length,
    decision_context_invalid_count: candidateRows.filter((row) => row.decision_context_valid !== "Y").length,
    bridge_status_mix: countBy(updateRows, "bridge_status"),
    closure_status_mix: countBy(candidateRows, "closure_status"),
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, updateRows, candidateRows) {
  return `# 공식 업데이트 -> Source Verification 브리지

작성 기준: ${UPDATED_AT}

이 문서는 \`official-update-intake\`에 들어온 공식 고시/공고가 실제 \`source-verification-closure-ledger\`와 \`source-verification-closure-decisions\` 어디에 이미 반영됐는지 연결한다. 같은 사업 rank 직접 매칭뿐 아니라, 같은 \`noticeCode\` 또는 \`고시번호\`를 공유하는 연관 사업장도 같이 보여준다.

## 요약

| 항목 | 값 |
| --- | ---: |
| source verification 대상 update | ${summary.source_verification_update_count} |
| candidate closure 행 | ${summary.candidate_closure_count} |
| applied 승격 후보 | ${summary.applied_candidate_count} |
| 수동 review 필요 | ${summary.manual_review_count} |
| 후속 추적 남음 | ${summary.followup_update_count} |
| 연관 사업장 포함 update | ${summary.related_project_update_count} |
| decision context 불일치 | ${summary.decision_context_invalid_count} |

| 구분 | 값 |
| --- | --- |
| bridge_status | ${summary.bridge_status_mix || "입력 없음"} |
| closure_status | ${summary.closure_status_mix || "입력 없음"} |

## update별 적용 상태

${mdTable(updateRows, [
    { key: "update_id", label: "update_id" },
    { key: "project_rank", label: "순위" },
    { key: "project_name", label: "사업" },
    { key: "notice_no", label: "고시번호" },
    { key: "notice_code", label: "noticeCode" },
    { key: "current_decision_status", label: "현재 상태" },
    { key: "suggested_decision_status", label: "권장 상태" },
    { key: "candidate_closure_count", label: "candidate" },
    { key: "target_closure_status_mix", label: "target closure" },
    { key: "pending_followup_count", label: "pending" },
    { key: "related_ranks", label: "연관 순위" },
    { key: "bridge_status", label: "bridge" },
    { key: "candidate_closure_ids", label: "closure_id" },
    { key: "suggested_next_action", label: "다음 액션" },
  ])}

## candidate closure 상세

${mdTable(candidateRows, [
    { key: "update_id", label: "update_id" },
    { key: "match_scope", label: "match" },
    { key: "closure_id", label: "closure_id" },
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업" },
    { key: "field_label", label: "필드" },
    { key: "closure_status", label: "closure" },
    { key: "latest_decision_status", label: "decision" },
    { key: "decision_context_valid", label: "ctx" },
    { key: "match_reasons", label: "근거" },
    { key: "decision_id", label: "decision_id" },
    { key: "resolved_value", label: "resolved" },
    { key: "follow_up_action", label: "후속 액션" },
  ])}

## 운영 원칙

- \`direct\`는 같은 \`project_rank\` 또는 같은 사업명 매칭이다.
- \`related_notice\`는 다른 rank라도 같은 \`noticeCode\`, \`고시번호\`, 원문 경로, 공식 URL을 공유하는 경우다.
- \`suggested_decision_status=applied\`는 해당 update의 원문이 이미 closure 장부/최신 decision evidence에 반영됐다는 뜻이다.
- \`reflected_with_followups\`는 최신 고시 연결은 확인됐고 intake는 applied로 둘 수 있지만, 일부 필드가 아직 \`pending\`이라 source verification 후속 검토가 남은 경우다.
- \`manual_review_needed\`는 candidate가 없거나, \`open/conflict\`가 섞였거나, 현재 장부 상태만으로 applied 승격이 안전하지 않은 경우다.
`;
}

async function main() {
  const [officialUpdateIntake, closureLedger, closureDecisions, updateImpactLedger] = await Promise.all([
    readJson(INPUTS.officialUpdateIntake, []),
    readJson(INPUTS.closureLedger),
    readJson(INPUTS.closureDecisions, []),
    readJson(INPUTS.updateImpactLedger),
  ]);

  const updateRows = officialUpdateIntake.filter((row) => routeToSourceVerification(row));
  const ledgerRows = rowsFrom(closureLedger);
  const decisionRows = rowsFrom(closureDecisions);
  const projectRows = rowsFrom(updateImpactLedger);
  const { decisionById, latestByClosure } = buildDecisionMaps(decisionRows);
  const impactByRank = buildProjectImpactMap(projectRows);

  const candidateRows = buildCandidateRows({
    updateRows,
    ledgerRows,
    decisionById,
    latestByClosure,
    impactByRank,
  });
  const bridgedUpdateRows = buildUpdateRows(updateRows, candidateRows, impactByRank);
  const summary = summarize(bridgedUpdateRows, candidateRows);

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(candidateRows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, updateRows: bridgedUpdateRows, candidateRows }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, bridgedUpdateRows, candidateRows));

  console.log(
    JSON.stringify(
      {
        updates: bridgedUpdateRows.length,
        candidates: candidateRows.length,
        applied: summary.applied_candidate_count,
        output: [OUT_MD, OUT_CSV, OUT_JSON],
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
