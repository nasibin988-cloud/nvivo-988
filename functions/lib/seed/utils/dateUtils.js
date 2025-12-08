"use strict";
/**
 * Date utility functions for seeding
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateYYYYMMDD = formatDateYYYYMMDD;
exports.getDateDaysAgo = getDateDaysAgo;
exports.getDateDaysFromNow = getDateDaysFromNow;
exports.getToday = getToday;
exports.getRandomTimeOnDate = getRandomTimeOnDate;
/**
 * Format a date as YYYY-MM-DD string
 */
function formatDateYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
/**
 * Get a date N days ago from today
 */
function getDateDaysAgo(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);
    return date;
}
/**
 * Get a date N days from today
 */
function getDateDaysFromNow(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(0, 0, 0, 0);
    return date;
}
/**
 * Get today's date at midnight
 */
function getToday() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
}
/**
 * Get a random time during the day
 */
function getRandomTimeOnDate(date) {
    const result = new Date(date);
    result.setHours(8 + Math.floor(Math.random() * 12), // 8am - 8pm
    Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
    return result;
}
//# sourceMappingURL=dateUtils.js.map