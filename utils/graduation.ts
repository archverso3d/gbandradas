/**
 * Utility to determine the GB Program Level (GB1 vs GB2)
 * based on the student's graduation.
 *
 * Business Rule:
 * - GB1: White Belt with 0, 1, or 2 degrees.
 * - GB2: White Belt with 3 or 4 degrees, and all higher belts (Blue, Purple, Brown, Black, etc.)
 */
export const getGBLevel = (belt: string, degrees: number): 'GB1' | 'GB2' => {
    const b = belt.toLowerCase();

    // White Belt Logic
    if (b.includes('branca') || b.includes('white')) {
        return (degrees >= 3) ? 'GB2' : 'GB1';
    }

    // Higher Belts (Blue, Purple, Brown, Black, Coral, Red) are always GB2 or above
    // In our system, we map everything above White 2 Degrees to GB2 for curriculum/stats
    return 'GB2';
};

// ============================================================================
// Graduation requirements table.
// Key = "<beltKey>:<currentDegrees>" -> months required for NEXT promotion.
// Degree 4 -> next belt (e.g., Branca 4 -> Azul 0).
// Baseline expected pace: 2 classes per week.
// ============================================================================

type BeltKey = 'branca' | 'azul' | 'roxa' | 'marrom' | 'preta';

const REQUIREMENTS_MONTHS: Record<BeltKey, Record<0 | 1 | 2 | 3 | 4, number | null>> = {
    branca: { 0: 1, 1: 1, 2: 2, 3: 4, 4: 4 },
    azul:   { 0: 4, 1: 5, 2: 5, 3: 5, 4: 5 },
    roxa:   { 0: 3, 1: 3, 2: 4, 3: 4, 4: 4 },
    marrom: { 0: 3, 1: 3, 2: 4, 3: 4, 4: 4 },
    preta:  { 0: null, 1: null, 2: null, 3: null, 4: null }, // não definido
};

export const CLASSES_PER_WEEK_BASELINE = 2;
const PRESENT_STATUSES = new Set(['present', 'presente', 'a', 'b', 'n', 'p']);
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

const normalizeBelt = (belt: string): BeltKey | null => {
    const b = (belt || '').toLowerCase();
    if (b.includes('branca') || b.includes('white')) return 'branca';
    if (b.includes('azul') || b.includes('blue')) return 'azul';
    if (b.includes('roxa') || b.includes('purple')) return 'roxa';
    if (b.includes('marrom') || b.includes('brown')) return 'marrom';
    if (b.includes('preta') || b.includes('black')) return 'preta';
    return null;
};

const clampDegree = (d: number): 0 | 1 | 2 | 3 | 4 => {
    const v = Math.max(0, Math.min(4, Math.floor(d || 0)));
    return v as 0 | 1 | 2 | 3 | 4;
};

export interface AttendanceLike {
    date: string; // YYYY-MM-DD
    status: string;
}

export interface NextGraduationEstimate {
    /** ISO date (YYYY-MM-DD) of estimated next promotion, or null if not computable. */
    date: string | null;
    /** Months required nominally for this step. */
    monthsRequired: number | null;
    /** Total classes required (months * 8). */
    classesRequired: number | null;
    /** Classes attended since lastPromotionDate. */
    classesDone: number;
    /** Average classes per week since lastPromotionDate (rounded to 1 decimal). */
    paceClassesPerWeek: number;
}

/**
 * Estimate the next graduation date.
 *
 * Logic:
 *  - nominal_date = lastPromotionDate + monthsRequired
 *  - pace = classes_done / weeks_elapsed (defaults to baseline if no data)
 *  - if classes_done >= classes_required AND today >= nominal_date -> eligible today
 *  - else pace_date = today + (remaining_classes / effective_pace) weeks
 *  - return max(nominal_date, pace_date)  (minimum time is always respected)
 */
export function calculateNextGraduation(
    belt: string,
    degrees: number,
    lastPromotionDate: string | null | undefined,
    attendance: AttendanceLike[] = []
): NextGraduationEstimate {
    const beltKey = normalizeBelt(belt);
    const deg = clampDegree(degrees);

    if (!beltKey || !lastPromotionDate) {
        return { date: null, monthsRequired: null, classesRequired: null, classesDone: 0, paceClassesPerWeek: 0 };
    }

    const monthsRequired = REQUIREMENTS_MONTHS[beltKey][deg];
    if (monthsRequired == null) {
        return { date: null, monthsRequired: null, classesRequired: null, classesDone: 0, paceClassesPerWeek: 0 };
    }

    const lastPromo = new Date(lastPromotionDate + 'T12:00:00');
    if (isNaN(lastPromo.getTime())) {
        return { date: null, monthsRequired, classesRequired: null, classesDone: 0, paceClassesPerWeek: 0 };
    }

    const classesRequired = monthsRequired * 4 * CLASSES_PER_WEEK_BASELINE; // 2/wk * 4wk

    // Nominal date = lastPromotion + monthsRequired calendar months
    const nominalDate = new Date(lastPromo);
    nominalDate.setMonth(nominalDate.getMonth() + monthsRequired);

    const now = new Date();
    now.setHours(12, 0, 0, 0);

    // Count attendance since lastPromotion
    const classesDone = attendance.filter(rec => {
        if (!PRESENT_STATUSES.has((rec.status || '').toLowerCase())) return false;
        const d = new Date(rec.date + 'T12:00:00');
        return !isNaN(d.getTime()) && d >= lastPromo;
    }).length;

    const weeksElapsed = Math.max((now.getTime() - lastPromo.getTime()) / MS_PER_WEEK, 0);

    // Effective pace: use observed pace; if not enough history (< 2 weeks), assume baseline
    const observedPace = weeksElapsed >= 2 ? (classesDone / weeksElapsed) : CLASSES_PER_WEEK_BASELINE;
    // Floor to avoid infinite projection when pace is 0
    const effectivePace = Math.max(observedPace, 0.25);

    const remainingClasses = Math.max(0, classesRequired - classesDone);
    const weeksRemaining = remainingClasses / effectivePace;

    const paceDate = new Date(now);
    paceDate.setDate(paceDate.getDate() + Math.ceil(weeksRemaining * 7));

    // Final projection: never earlier than nominal date (minimum time rule).
    const projected = paceDate.getTime() > nominalDate.getTime() ? paceDate : nominalDate;

    const iso = `${projected.getFullYear()}-${String(projected.getMonth() + 1).padStart(2, '0')}-${String(projected.getDate()).padStart(2, '0')}`;

    return {
        date: iso,
        monthsRequired,
        classesRequired,
        classesDone,
        paceClassesPerWeek: Math.round(observedPace * 10) / 10,
    };
}
