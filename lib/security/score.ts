import { CheckResult, FindingCategory } from "../types";

export interface ScoreBreakdown {
  overallScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  categoryScores: Record<FindingCategory, { score: number; max: number; passed: number; total: number }>;
}

export function calculateSecurityScore(results: CheckResult[]): ScoreBreakdown {
  const categoryWeights: Record<FindingCategory, number> = {
    HTTPS: 25,
    HEADERS: 35,
    COOKIES: 20,
    TLS: 10,
    CONFIG: 5,
    METADATA: 5,
  };

  const categoryScores: Record<FindingCategory, { score: number; max: number; passed: number; total: number }> = {
    HTTPS: { score: 25, max: 25, passed: 0, total: 0 },
    HEADERS: { score: 35, max: 35, passed: 0, total: 0 },
    COOKIES: { score: 20, max: 20, passed: 0, total: 0 },
    TLS: { score: 10, max: 10, passed: 0, total: 0 },
    CONFIG: { score: 5, max: 5, passed: 0, total: 0 },
    METADATA: { score: 5, max: 5, passed: 0, total: 0 },
  };

  const deductions: Record<FindingCategory, number> = {
    HTTPS: 0,
    HEADERS: 0,
    COOKIES: 0,
    TLS: 0,
    CONFIG: 0,
    METADATA: 0,
  };

  for (const check of results) {
    const cat = check.category;
    categoryScores[cat].total += 1;

    if (check.status === "PASS") {
      categoryScores[cat].passed += 1;
    } else if (check.status === "FAIL") {
      if (check.severity === "CRITICAL") deductions[cat] += 25;
      else if (check.severity === "HIGH") deductions[cat] += 15;
      else if (check.severity === "MEDIUM") deductions[cat] += 8;
      else if (check.severity === "LOW") deductions[cat] += 3;
    } else if (check.status === "WARNING") {
      if (check.severity === "HIGH") deductions[cat] += 8;
      else if (check.severity === "MEDIUM") deductions[cat] += 4;
      else if (check.severity === "LOW") deductions[cat] += 2;
    }
  }

  let totalScore = 0;
  for (const cat of Object.keys(categoryWeights) as FindingCategory[]) {
    const max = categoryWeights[cat];
    const deduction = deductions[cat];
    const finalCatScore = Math.max(0, max - deduction);
    categoryScores[cat].score = finalCatScore;
    totalScore += finalCatScore;
  }

  const overallScore = Math.max(0, Math.min(100, Math.round(totalScore)));

  let grade: "A" | "B" | "C" | "D" | "F" = "F";
  if (overallScore >= 90) grade = "A";
  else if (overallScore >= 80) grade = "B";
  else if (overallScore >= 70) grade = "C";
  else if (overallScore >= 60) grade = "D";

  return {
    overallScore,
    grade,
    categoryScores,
  };
}
