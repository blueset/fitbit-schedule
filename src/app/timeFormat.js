const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
import { preferences } from "user-settings";

export function twoDig(num) { return ("0" + num).slice(-2); }

export function monoDig(str) {
    let ans = "";
    for (let i in str) {
        let code = str.charCodeAt(i);
        if (48 <= code && code <= 57)
            ans += String.fromCharCode(code - 48 + 16);
        else
            ans += str[i];
    }
    return ans;
}

export function formatTime(timeStamp) {
    let date = timeStamp;
    if (typeof date.getTime !== "function") date = new Date(timeStamp);
    if (preferences.clockDisplay === "24h")
        return twoDig(date.getHours()) + ":" + twoDig(date.getMinutes());
    else {  // 12h
        let postfix;
        if (date.getHours() === 0) postfix = "m";
        else if (date.getHours() === 12) postfix = "n";
        else if (date.getHours() < 12) postfix = "a";
        else postfix = "p";
        return twoDig((date.getHours() + 11) % 12 + 1) + ":" + twoDig(date.getMinutes()) + postfix;
    }
}

export function formatDate(timeStamp, markToday) {
    let time = new Date(timeStamp);
    if (time.setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0) && markToday)
        return "Today";
    return `${dayNames[time.getDay()]}, ${time.getDate()} ${monthNames[time.getMonth()]}`;
}

export function formatTimeRange(start, end, markToday, allDay, markDate) {
    if (allDay) {
        let eDate = new Date(end);
        eDate.setDate(eDate.getDate() - 1);
        end = eDate.getTime();
    }
    const startDate = formatDate(start, markToday);
    const endDate = formatDate(end, markToday);
    const startTime = formatTime(start);
    const endTime = formatTime(end);
    if (allDay) {
        if (startDate == endDate) return startDate;
        return `${startDate} - ${endDate}`
    } else {
        if (startDate == endDate) {
            if (markDate) return `${startDate} ${startTime} - ${endTime}`;
            return `${startTime} - ${endTime}`;
        }
        return `${startDate} ${startTime}\n${endDate} ${endTime}`;
    }
}
