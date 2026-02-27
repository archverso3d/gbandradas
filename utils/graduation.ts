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
