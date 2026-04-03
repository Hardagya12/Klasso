'use strict';

/**
 * CBSE Grading Utilities
 * ──────────────────────
 * Grade bands  : A1=91-100, A2=81-90, B1=71-80, B2=61-70,
 *                C1=51-60,  C2=41-50,  D=33-40,  E=21-32, F=0-20
 * Passing mark : 33 %
 */

/**
 * getGradeLetter(percentage)
 * @param  {number} percentage - 0 to 100
 * @returns {string} grade letter e.g. 'A1'
 */
const getGradeLetter = (percentage) => {
  const pct = parseFloat(percentage);
  if (pct >= 91) return 'A1';
  if (pct >= 81) return 'A2';
  if (pct >= 71) return 'B1';
  if (pct >= 61) return 'B2';
  if (pct >= 51) return 'C1';
  if (pct >= 41) return 'C2';
  if (pct >= 33) return 'D';
  if (pct >= 21) return 'E';
  return 'F';
};

/**
 * getGradePoint(gradeLetter)
 * @param  {string} gradeLetter
 * @returns {number} grade point
 */
const getGradePoint = (gradeLetter) => {
  const map = {
    A1: 10,
    A2: 9,
    B1: 8,
    B2: 7,
    C1: 6,
    C2: 5,
    D: 4,
    E: 3,
    F: 0,
  };
  return map[gradeLetter] ?? 0;
};

/**
 * computeCGPA(gradePoints)
 * @param  {number[]} gradePoints - array of grade point values
 * @returns {number} CGPA rounded to 2 decimal places
 */
const computeCGPA = (gradePoints) => {
  if (!gradePoints || gradePoints.length === 0) return 0;
  const sum = gradePoints.reduce((acc, gp) => acc + gp, 0);
  return parseFloat((sum / gradePoints.length).toFixed(2));
};

/**
 * computeClassRanks(arr)
 * Assigns 1-based ranks (ties share the same rank; next rank skips).
 * @param  {Array<{student_id: string, total_score: number}>} arr
 * @returns {Array<{student_id, total_score, rank}>}
 */
const computeClassRanks = (arr) => {
  if (!arr || arr.length === 0) return [];

  // Sort descending by total_score
  const sorted = [...arr].sort((a, b) => b.total_score - a.total_score);

  let rank = 1;
  return sorted.map((item, idx) => {
    if (idx > 0 && item.total_score < sorted[idx - 1].total_score) {
      rank = idx + 1; // next rank after the tie
    }
    return { ...item, rank };
  });
};

/**
 * isPassing(score, maxScore)
 * CBSE: 33% is the minimum passing threshold.
 * @param  {number} score
 * @param  {number} maxScore
 * @returns {boolean}
 */
const isPassing = (score, maxScore) => {
  if (!maxScore || maxScore === 0) return false;
  return parseFloat(score) / parseFloat(maxScore) >= 0.33;
};

module.exports = {
  getGradeLetter,
  getGradePoint,
  computeCGPA,
  computeClassRanks,
  isPassing,
};
