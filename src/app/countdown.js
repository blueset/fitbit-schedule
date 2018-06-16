import document from "document";
import { _ } from "../common/locale.js";
import { twoDig, monoDig, formatTime, formatDate } from "timeFormat.js";

/* Countdown */
var thisEvent = undefined;
var nextEvent = undefined;
const thisEventPage = document.getElementById('this-event-countdown');
const nextEventPage = document.getElementById('next-event-countdown');
const thisEventCD = thisEventPage.getElementById('countdown-time');
const nextEventCD = nextEventPage.getElementById('countdown-time');
const thisEventDate = thisEventPage.getElementById('date-now');
const thisEventTime = thisEventPage.getElementById('time-now');
const nextEventDate = nextEventPage.getElementById('date-now');
const nextEventTime = nextEventPage.getElementById('time-now');
const thisMarquee = thisEventPage.getElementById("event-name-marquee");
const nextMarquee = nextEventPage.getElementById("event-name-marquee");
const container = document.getElementById("container");

export function renderCountdown(events) {
    thisEvent = undefined;
    nextEvent = undefined;
    const now = new Date();
    for (let i of events) {
        if (i.allDay) continue;
        if (thisEvent == undefined && i.start <= now && now < i.end)
            thisEvent = i;
        if (nextEvent == undefined && i.start > now) {
            nextEvent = i;
            break;
        }
    }
    if (thisEvent) {
        thisEventPage.style.display = "inline";
        let downToTime = formatTime(thisEvent.end);
        let downToDate = formatDate(thisEvent.end, true);
        if (downToDate !== _("today")) downToTime += ", " + downToDate;
        thisEventPage.getElementById("countdown-target").text = downToTime;
        thisMarquee.getElementById("text").text = thisEvent.summary;
        thisMarquee.getElementById("copy").text = thisEvent.summary;
        thisMarquee.style.fill = thisEvent.color.background;
        thisEventPage.getElementById("event-location").text = thisEvent.location;
    } else {
        thisEventPage.style.display = "none";
    }
    if (nextEvent) {
        nextEventPage.style.display = "inline";
        let downToTime = formatTime(nextEvent.end);
        let downToDate = formatDate(nextEvent.end, true);
        if (downToDate !== _("today")) downToTime += ", " + downToDate;
        nextEventPage.getElementById("countdown-target").text = downToTime;
        nextMarquee.getElementById("text").text = nextEvent.summary;
        nextMarquee.getElementById("copy").text = nextEvent.summary;
        nextMarquee.style.fill = nextEvent.color.background;
        nextEventPage.getElementById("event-location").text = nextEvent.location;
    } else {
        nextEventPage.style.display = "none";
    }
    container.value = 0;
    tickCountdown({ date: new Date() }, true);
}

function countdownStr(now, then) {
    let weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0;
    let diff = Math.abs(then - now);
    diff = diff / 1000 >> 0;
    seconds = diff % 60;
    diff = diff / 60 >> 0;
    minutes = diff % 60;
    diff = diff / 60 >> 0;
    hours = diff % 24;
    diff = diff / 24 >> 0;
    days = diff % 7;
    weeks = diff / 7 >> 0;
    let ret = [];
    if (weeks != 0) ret.push(_("short_weeks")(weeks));
    if (days != 0) ret.push(_("short_days")(days));
    if (hours != 0 || weeks != 0 || days != 0) ret.push(monoDig(`${hours}:${twoDig(minutes)}:${twoDig(seconds)}`));
    else if (minutes != 0) ret.push(monoDig(`${minutes}:${twoDig(seconds)}`));
    else if (hours != 0) ret.push(_("short_seconds")(monoDig(seconds)));
    if (ret.length == 0) return _("now");
    if (then < now) _("ago")(ret);
    return ret.join(" ");
}

export function tickCountdown(tick, force) {
    const now = tick.date;
    if (thisEvent !== undefined && (container.value == 1 || force)) {
        if (thisEvent.end < now)
            return renderCountdown(calendar.getEvents());
        thisEventDate.text = formatDate(now, false);
        thisEventTime.text = monoDig(formatTime(now));
        thisEventCD.text = countdownStr(now, thisEvent.end);
        if (!force) return;
    }
    if (nextEvent !== undefined && (container.value > 0 || force)) {
        if (nextEvent.start <= now)
            return renderCountdown(calendar.getEvents());
        nextEventDate.text = formatDate(now, false);
        nextEventTime.text = monoDig(formatTime(now));
        nextEventCD.text = countdownStr(now, nextEvent.start);
    }
}