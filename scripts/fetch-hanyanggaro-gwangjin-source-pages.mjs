#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";

const SOURCES = [
  {
    id: "6031295",
    label: "사업시행계획인가(정정) 고시",
    url: "https://www.gwangjin.go.kr/portal/bbs/B0000003/view.do?nttId=6031295&menuNo=201848&searchCnd=3&searchWrd=%ED%95%9C%EC%96%91%EC%97%B0%EB%A6%BD&deptId=101591&pSiteId=portal&pageIndex=1",
  },
  {
    id: "6186353",
    label: "사업시행계획변경인가 고시",
    url: "https://www.gwangjin.go.kr/portal/bbs/B0000003/view.do?nttId=6186353&menuNo=201848&searchCnd=3&searchWrd=%ED%95%9C%EC%96%91%EC%97%B0%EB%A6%BD&deptId=101591&pSiteId=portal&pageIndex=1",
  },
  {
    id: "6171163",
    label: "사업시행계획변경인가 공람공고",
    url: "https://www.gwangjin.go.kr/portal/bbs/B0000003/view.do?nttId=6171163&menuNo=201848&searchCnd=3&searchWrd=%ED%95%9C%EC%96%91%EC%97%B0%EB%A6%BD&deptId=101591&pSiteId=portal&pageIndex=1",
  },
  {
    id: "6209808",
    label: "건설공사 안전점검 수행기관 지정 모집공고",
    url: "https://www.gwangjin.go.kr/portal/bbs/B0000003/view.do?nttId=6209808&menuNo=201848&searchCnd=3&searchWrd=%EA%B5%AC%EC%9D%98%EB%8F%99+592-39&deptId=101591&pSiteId=portal&pageIndex=1",
  },
  {
    id: "6213254",
    label: "건설공사 안전점검 수행기관 지정 결과",
    url: "https://www.gwangjin.go.kr/portal/bbs/B0000003/view.do?nttId=6213254&menuNo=201848&searchCnd=3&searchWrd=%EA%B5%AC%EC%9D%98%EB%8F%99+592-39&deptId=101591&pSiteId=portal&pageIndex=1",
  },
];

function stripTags(value) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&#160;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#034;", '"')
    .replaceAll("&#39;", "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractNoticeNo(text) {
  return text.match(/(?:서울특별시\s*)?광진구\s*(?:공고|고시)\s*제\s*\d{4}\s*-\s*\d+\s*호/)?.[0]?.replace(/\s+/g, " ").trim() || "";
}

function extractNoticeDate(text) {
  return text.match(/등록일\s*(\d{4}-\d{2}-\d{2})/)?.[1] || text.match(/공고시작일\s*(\d{4}-\d{2}-\d{2})/)?.[1] || "";
}

function extractTitle(text) {
  return text.match(/제목\s+(.+?)\s+부서/)?.[1]?.trim() || "";
}

function extractSnippets(text) {
  const terms = ["한양연립", "구의동 592-39", "세대", "층", "높이", "사업시행계획"];
  return Object.fromEntries(
    terms.map((term) => {
      const index = text.indexOf(term);
      if (index < 0) return [term, ""];
      return [term, text.slice(Math.max(0, index - 180), Math.min(text.length, index + 420))];
    }),
  );
}

async function main() {
  await mkdir("data/urban/gwangjin-gu-notice-html", { recursive: true });
  await mkdir("data/urban/text/gwangjin-gu/html", { recursive: true });
  const manifest = [];
  for (const source of SOURCES) {
    const response = await fetch(source.url, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} ${source.url}`);
    const html = await response.text();
    const text = stripTags(html);
    const htmlPath = `data/urban/gwangjin-gu-notice-html/25-B0000003-${source.id}.html`;
    const textPath = `data/urban/text/gwangjin-gu/html/25-B0000003-${source.id}.txt`;
    await writeFile(htmlPath, html, "utf8");
    await writeFile(textPath, text, "utf8");
    manifest.push({
      ...source,
      html_path: htmlPath,
      text_path: textPath,
      text_char_count: text.length,
      title: extractTitle(text),
      notice_no: extractNoticeNo(text),
      notice_date: extractNoticeDate(text),
      snippets: extractSnippets(text),
    });
  }
  await writeFile("data/urban/gwangjin-gu-hanyanggaro-source-pages.json", `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(
    JSON.stringify(
      {
        pages: manifest.length,
        output: "data/urban/gwangjin-gu-hanyanggaro-source-pages.json",
        text_paths: manifest.map((row) => row.text_path),
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
