// src/types/date.ts

export enum DateFormat {
    // --- DISPLAY FORMATS (For the UI) ---
    /** 19 April 2026 */
    FULL_DISPLAY = 'dd MMMM yyyy',

    /** Apr 19, 2026 */
    FRIENDLY = 'MMM dd, yyyy',

    /** 19/04/2026 (Common in Indonesia/Europe) */
    EUROPEAN = 'dd/MM/yyyy',

    /** Sunday, 19 April 2026 */
    WITH_DAY = 'eeee, dd MMMM yyyy',

    // --- RESUME SPECIFIC (For CV Sections) ---
    /** April 2026 (Perfect for Education/Work Experience) */
    MONTH_YEAR = 'MMMM yyyy',

    /** 04/26 */
    SHORT_MONTH_YEAR = 'MM/yy',

    // --- TECHNICAL/BACKEND FORMATS ---
    /** 2026-04-19 (Standard HTML Date Input format) */
    ISO_DATE = 'yyyy-MM-dd',

    /** 20260419 (Good for file naming or ID generation) */
    COMPACT = 'yyyyMMdd',

    // --- TIME INCLUDED (For logs or chat) ---
    /** 19 April 2026 10:06 */
    DATETIME = 'dd MMMM yyyy HH:mm',

    /** 10:06 AM */
    TIME_ONLY = 'hh:mm a',
}

export type DateFormatType = `${DateFormat}`
