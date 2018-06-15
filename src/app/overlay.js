import document from "document";

/* Overlay */
const dsvOverlay = document.getElementById('detail-overlay');
const dsvCalendar = document.getElementById('dsv-calendar-text');
const dsvTime = document.getElementById('dsv-time-text');
const dsvSummary = document.getElementById('dsv-summary-text');
const dsvLocation = document.getElementById('dsv-location-text');
const dsvBack = document.getElementById('dsv-back-button');
const dsvView = document.getElementById('detail-overlay-sv');

export function renderOverlay(evt) {
    if (evt === undefined) return;
    dsvCalendar.style.fill = evt.calendar.color.background;
    dsvCalendar.text = evt.calendar.summary;
    dsvTime.text = formatTimeRange(evt.start, evt.end, true, evt.allDay, true);
    dsvSummary.text = evt.summary;
    if (evt.color.background != "#00A4Ee") {
        dsvSummary.style.fill = evt.color.background;
        dsvTime.style.fill = evt.color.background;
    }
    if (evt.location === undefined) {
        dsvLocation.style.display = "none";
        dsvLocation.text = "";
    } else {
        dsvLocation.style.display = "inline";
        dsvLocation.text = evt.location;
    }
    dsvView.value = 0;
    dsvOverlay.style.display = "inline";
}

export function overlayInit(container) {
    dsvBack.onclick = function (evt) {
        dsvView.value = 0;
        container.style.display = "inline";
        dsvOverlay.style.display = "none";
    };
}