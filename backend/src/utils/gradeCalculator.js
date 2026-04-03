const getGradeLetter = (percentage) => {
    if (percentage >= 91) return 'A1';
    if (percentage >= 81) return 'A2';
    if (percentage >= 71) return 'B1';
    if (percentage >= 61) return 'B2';
    if (percentage >= 51) return 'C1';
    if (percentage >= 41) return 'C2';
    if (percentage >= 33) return 'D';
    if (percentage >= 21) return 'E';
    return 'F';
};

const getGradePoint = (gradeLetter) => {
    const points = {
        'A1': 10,
        'A2': 9,
        'B1': 8,
        'B2': 7,
        'C1': 6,
        'C2': 5,
        'D': 4,
        'E': 3,
        'F': 0
    };
    return points[gradeLetter] !== undefined ? points[gradeLetter] : 0;
};

const computeCGPA = (gradePoints) => {
    if (!gradePoints || gradePoints.length === 0) return 0;
    const total = gradePoints.reduce((acc, curr) => acc + curr, 0);
    return parseFloat((total / gradePoints.length).toFixed(2));
};

const computeClassRanks = (arr) => {
    const sorted = [...arr].sort((a, b) => b.total_score - a.total_score);
    let currentRank = 1;

    return sorted.map((student, index) => {
        if (index > 0 && student.total_score < sorted[index - 1].total_score) {
            currentRank = index + 1;
        }
        return {
            ...student,
            rank: currentRank
        };
    });
};

const isPassing = (score, maxScore) => {
    if (maxScore === 0) return false;
    return (score / maxScore) >= 0.33;
};

module.exports = {
    getGradeLetter,
    getGradePoint,
    computeCGPA,
    computeClassRanks,
    isPassing
};
