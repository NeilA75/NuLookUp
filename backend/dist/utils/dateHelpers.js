"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrailing12Months = getTrailing12Months;
exports.formatDate = formatDate;
function getTrailing12Months() {
    const months = [];
    const now = new Date();
    for (let offset = 11; offset >= 0; offset -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        months.push(date.toLocaleString('en-US', { month: 'short' }));
    }
    return months;
}
function formatDate(isoString) {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
        return isoString;
    }
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
