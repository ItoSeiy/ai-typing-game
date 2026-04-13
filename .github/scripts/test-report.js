import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const XML_PATH = 'test-results.xml';
const prNumber = process.env.PR_NUMBER || '';
const summaryPath = process.env.GITHUB_STEP_SUMMARY || '';

// --- Utility functions ---

const escapeCell = (value) =>
  String(value ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|')
    .trim() || '-';

const formatDuration = (seconds) => {
  const totalSeconds = Number(seconds);
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '-';
  }

  if (totalSeconds >= 60) {
    const minutes = Math.floor(totalSeconds / 60);
    const rest = totalSeconds - minutes * 60;
    return `${minutes}分${rest.toFixed(rest < 10 ? 2 : 0)}秒`;
  }

  if (totalSeconds >= 1) {
    return `${totalSeconds.toFixed(2)}秒`;
  }

  return `${Math.round(totalSeconds * 1000)}ms`;
};

const parseAttributes = (attrText) => {
  const attrs = {};
  const attrPattern = /([A-Za-z_:][-A-Za-z0-9_:.]*)="([^"]*)"/g;
  let match;
  while ((match = attrPattern.exec(attrText)) !== null) {
    attrs[match[1]] = match[2];
  }
  return attrs;
};

// --- XML Parsing ---

const parseTestResults = (xml) => {
  const suitePattern = /<testsuite\b([^>]*)>([\s\S]*?)<\/testsuite>/g;
  const testcasePattern = /<testcase\b([^>]*)>([\s\S]*?)<\/testcase>|<testcase\b([^>]*)\/>/g;
  const suites = [];
  let suiteMatch;

  while ((suiteMatch = suitePattern.exec(xml)) !== null) {
    const suiteAttrs = parseAttributes(suiteMatch[1]);
    const suiteBody = suiteMatch[2];
    const suiteName = suiteAttrs.name || 'Unnamed suite';
    const entries = [];
    let testcaseMatch;
    testcasePattern.lastIndex = 0;

    while ((testcaseMatch = testcasePattern.exec(suiteBody)) !== null) {
      const attrs = parseAttributes(testcaseMatch[1] || testcaseMatch[3] || '');
      const body = testcaseMatch[2] || '';
      const name = attrs.name || 'Unnamed test';
      const time = Number(attrs.time || suiteAttrs.time || 0);
      const failed = /<(failure|error)\b/.test(body);
      const skipped = /<skipped\b/.test(body);

      entries.push({ name, time, failed, skipped });
    }

    if (entries.length > 0) {
      suites.push({
        name: suiteName,
        entries,
        tests: Number(suiteAttrs.tests || entries.length),
        failures: Number(suiteAttrs.failures || entries.filter((e) => e.failed).length),
        skipped: Number(suiteAttrs.skipped || entries.filter((e) => e.skipped).length),
        time: Number(
          suiteAttrs.time ||
            entries.reduce((sum, e) => sum + (Number.isFinite(e.time) ? e.time : 0), 0),
        ),
      });
    }
  }

  return suites;
};

// --- Markdown Generation ---

const buildMarkdown = (suites) => {
  const flatTests = suites.flatMap((suite) =>
    suite.entries.map((entry) => ({
      suite: suite.name,
      name: entry.name,
      time: entry.time,
      failed: entry.failed,
      skipped: entry.skipped,
    })),
  );

  const total = flatTests.length;
  const failed = flatTests.filter((e) => e.failed).length;
  const skipped = flatTests.filter((e) => e.skipped).length;
  const passed = total - failed - skipped;
  const totalTime = flatTests.reduce(
    (sum, e) => sum + (Number.isFinite(e.time) ? e.time : 0),
    0,
  );
  const hasFailures = failed > 0;

  const lines = [
    hasFailures ? '## テスト結果 ❌ 失敗あり' : '## テスト結果 ✅ 全件PASS',
    '',
    '| 項目 | 結果 |',
    '|------|------|',
    `| テスト合計 | ${total}件 |`,
    `| 成功 | ${passed} ✅ |`,
    `| 失敗 | ${failed} |`,
    `| スキップ | ${skipped} |`,
    `| 実行時間 | ${formatDuration(totalTime)} |`,
    '',
  ];

  if (hasFailures) {
    lines.push('❌ **失敗テスト:**');
    flatTests
      .filter((e) => e.failed)
      .forEach((e) => {
        lines.push(`- ${escapeCell(e.suite)} > ${escapeCell(e.name)}`);
      });
    lines.push('');
  }

  lines.push(
    `<details><summary>📋 スイート別詳細（${suites.length}スイート）</summary>`,
  );
  lines.push('');
  lines.push('| スイート | テスト数 | 結果 | 時間 |');
  lines.push('|---------|---------|------|------|');
  suites.forEach((suite) => {
    const failedCount = suite.entries.filter((e) => e.failed).length;
    const skippedCount = suite.entries.filter((e) => e.skipped).length;
    const passedCount = suite.entries.length - failedCount - skippedCount;
    const result = failedCount > 0 ? '❌ 一部失敗' : '✅ 全PASS';
    const displayCount = `${suite.entries.length}`;
    const countSuffix = skippedCount > 0 ? ` / スキップ ${skippedCount}` : '';
    const passSuffix = failedCount > 0 ? ` / 成功 ${passedCount}` : '';
    lines.push(
      `| ${escapeCell(suite.name)} | ${displayCount}${countSuffix}${passSuffix} | ${result} | ${formatDuration(suite.time)} |`,
    );
  });
  lines.push('');
  lines.push('</details>');
  lines.push('');

  return lines.join('\n');
};

// --- Output functions ---

const writeStepSummary = (markdown) => {
  if (!summaryPath) {
    return;
  }
  fs.appendFileSync(summaryPath, markdown);
  console.log('Step Summary に書き込み完了。');
};

const postPrComment = (markdown) => {
  if (!prNumber) {
    console.log('PR_NUMBER が未設定のため、PRコメント投稿をスキップ。');
    return;
  }
  const bodyFile = path.join(process.env.RUNNER_TEMP || '.', 'pr-test-comment.md');
  fs.writeFileSync(bodyFile, markdown, 'utf8');
  try {
    execFileSync('gh', ['pr', 'comment', prNumber, '--body-file', bodyFile], {
      stdio: 'inherit',
      env: process.env,
    });
  } catch (error) {
    console.error(
      `PRコメント投稿に失敗したが、workflow は継続する: ${error.message}`,
    );
  }
};

// --- Main ---

const main = () => {
  if (!fs.existsSync(XML_PATH)) {
    const fallback =
      '## テスト結果 ⚠️ test-results.xml が見つかりません\n\nテスト結果ファイルが見つからなかったため、詳細を生成できませんでした。\n';
    writeStepSummary(fallback);
    postPrComment(fallback);
    return;
  }

  const xml = fs.readFileSync(XML_PATH, 'utf8');
  const suites = parseTestResults(xml);

  if (suites.length === 0 || suites.every((s) => s.entries.length === 0)) {
    const fallback =
      '## テスト結果 ⚠️ テストケースを読み取れませんでした\n\ntest-results.xml は存在しましたが、テストケースを抽出できませんでした。\n';
    writeStepSummary(fallback);
    postPrComment(fallback);
    return;
  }

  const markdown = buildMarkdown(suites);
  writeStepSummary(markdown);
  postPrComment(markdown);
};

main();
