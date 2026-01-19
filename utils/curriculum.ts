
/**
 * Calculates the current curriculum week (1-16) based on a 16-week cycle.
 * Reference date: Jan 19, 2026 = Week 1
 */
export const getCurrentCurriculumWeek = (date: Date = new Date()): number => {
    const refDate = new Date('2026-01-19T00:00:00');

    // Normalize both dates to midnight in local time
    const dNorm = new Date(date);
    dNorm.setHours(0, 0, 0, 0);

    const rNorm = new Date(refDate);
    rNorm.setHours(0, 0, 0, 0);

    const diffTime = dNorm.getTime() - rNorm.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);

    // Cycle: 1..16
    return ((diffWeeks % 16) + 16) % 16 + 1;
};

/**
 * Determines the class label (A, B, or No-Gi) based on the day of the week.
 * Mon, Tue -> A
 * Wed, Thu -> B
 * Fri, Sat -> N (No-Gi)
 */
export const getClassLabelByDay = (date: Date = new Date()): string => {
    const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

    if (day === 3 || day === 4) return 'B'; // Wed, Thu
    if (day === 5 || day === 6) return 'N'; // Fri, Sat
    return 'A'; // Defaults to A for Mon, Tue (and Sun if needed)
};
