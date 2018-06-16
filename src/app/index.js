
import { memory } from "system";

console.log("On start JS memory: " + memory.js.used + "/" + memory.js.total);

import document from "document";
import * as messaging from "messaging";
import { inbox } from "file-transfer";
import clock from "clock";
import { battery } from "power";
import { me } from "appbit";
import { me as device } from "device";
import { locale } from "user-settings"; 

if (!device.screen) device.screen = { width: 348, height: 250 };

import GCalendar from "./gCalendar.js";

import { renderSnackBar } from "snackbar.js";
import { formatTime, formatDate, formatTimeRange } from "timeFormat.js";
import { renderPersistentErrorMessage } from "utils.js";
import { renderOverlay, overlayInit } from "overlay.js";
import { loadSettings, saveSettings } from "settings.js";
import { renderCountdown, tickCountdown } from "countdown.js";

const calendar = new GCalendar();

var listStorage = [];

const dateText = document.getElementById("date-now");
const timeText = document.getElementById("time-now");
const batteryText = document.getElementById("battery");

const eventListSV = document.getElementById("event-list");
const container = document.getElementById("container");
var settings = loadSettings();

clock.granularity = (!settings.hide_countdown && settings.countdown_second) ? "seconds" : "minutes";

var fontFamily;

function updateFont() {
  fontFamily = (settings.system_default_font) ? "System" : "Fabrikat";
  dateText.style.fontFamily = `${fontFamily}-Regular`;
}

updateFont();

me.onunload = () => {saveSettings(settings);};

clock.ontick = function(evt) {
  // Output the date object
  if (container.value == 0) {
    timeText.text = formatTime(evt.date);
    dateText.text = formatDate(evt.date, false);
    batteryText.text = Math.floor(battery.chargeLevel) + "%";
    batteryText.x = timeText.getBBox().left - 5;
  } else {
    tickCountdown(settings, evt, false);
  }
};

inbox.addEventListener("newfile", function() {
  const fileName = inbox.nextFile();
  if (!calendar.processFile(fileName)) {
    // process other files
  }
});

messaging.peerSocket.onmessage = (evt) => {
  if (evt.data.newValue === "false") evt.data.newValue = false;
  else if (evt.data.newValue === "true") evt.data.newValue = true;
  settings[evt.data.key] = evt.data.newValue;
 
  if (evt.data.key === 'oauth_refresh_token' && !evt.data.restore) {
    // Google calendar OAuth settings
    if (evt.data.newValue === undefined) {
      calendar.dropEvents();
    } else if (calendar.fetchEvents()) {
      calendar.onUpdate();
    }
  } else if (evt.data.key === 'system_default_font' && !evt.data.restore) {
    // Font change
    updateFont();
    eventListSV.redraw();
  } else if (!evt.data.restore && (evt.data.key === "hide_countdown")) {
    renderEvents();
    clock.granularity = (!settings.hide_countdown && settings.countdown_second) ? "seconds" : "minutes";
  } else if (!evt.data.restore && evt.data.key === "countdown_second") {
    tickCountdown(settings, { date: new Date() }, true);
    clock.granularity = (!settings.hide_countdown && settings.countdown_second) ? "seconds" : "minutes";
  }
};

messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
  calendar.fetchEvents();
};

messaging.peerSocket.onclose = () => {
  console.log("App Socket Closed");
};


function renderEvents(){
  if (!me.permissions.granted("access_internet")) {
    renderCountdown(settings, []);
    listStorage = renderPersistentErrorMessage("Internet access permission is required to run this app.", eventListSV);
    return;
  }
  if (!me.permissions.granted("run_background"))
    listStorage = renderSnackbar("Run-in-background permission is not granted. Your calendar update may be delayed.", eventListSV);
  if (!settings.oauth_refresh_token) {
    renderCountdown(settings, []);
    listStorage = renderPersistentErrorMessage("You need to log in to your calendar in the app settings first. If you have logged in, restart the app to refresh.", eventListSV);
    return;
  }
  const lastUpdateTime = calendar.getLastUpdate();
  const now = new Date();
  listStorage = [
    {
      type: "last-update-pool",
      value: `updated at ${formatTime(lastUpdateTime)} ${formatDate(lastUpdateTime, true)}`
    }
  ];
  let lastDay = formatDate(now, false);
  const events = calendar.getEvents();
  if (events === undefined || events.length === 0) {
    console.log('Calendar events are undefined or empty!');
    listStorage = renderPersistentErrorMessage("You have no further event.", eventListSV);
    return;
  }
  for (let i in events) {
    let date = formatDate(events[i].start, false);
    if (date != lastDay) {
      listStorage.push({
        type: "date-separator-pool",
        value: date
      });
      lastDay = date;
    }
    
    let tileData = {
      event: events[i]
    };
    
    if (events[i].allDay) {
      tileData.type = "all-day-event-pool";
    } else if (events[i].start >= now && now >= events[i].end) {
      tileData.type = "event-now-pool";
    } else {
      tileData.type = "event-pool";
    }
    listStorage.push(tileData);
  }
  eventListSV.length = listStorage.length;
  for (let i = 0; i < eventListSV.length; i++) eventListSV.updateTile(i, {redraw: false});
  eventListSV.redraw();
  renderCountdown(settings, events);
}

const dsvItem = document.getElementById("dsv-item");
const dsvOverlay = document.getElementById('detail-overlay');
document.onkeypress = function(e) {
  if (dsvOverlay.style.display == 'inline') {
    if (e.key == "back") {
      dsvView.value = 0;
      dsvOverlay.style.display = "none";
      container.style.display = "inline";
      e.preventDefault();
    } else if (e.key == "up") {
      dsvItem.y = Math.min(0, dsvItem.y + 150);
    } else if (e.key == "down") {
      console.log(`${dsvItem.y} + 150 = ${dsvItem.y + 150}; Upper: ${dsvItem.getBBox().height} -  ${device.screen.height} = ${dsvItem.getBBox().height - device.screen.height}; lower: 0`);
      dsvItem.y = Math.min(Math.max(dsvItem.y - 150, - dsvItem.getBBox().height + device.screen.height), 0);
    }
  } else if (container.value == 0){
    if (e.key == "up") {
      eventListSV.value -= 1;
    } else if (e.key == "down") {
      eventListSV.value += 1;
    }
  } 
}

document.getElementById("header-container").onclick = () => {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    renderSnackBar("Updating...");
    calendar.fetchEvents();
  } else {
    renderSnackBar("No connection to companion app.")
  }
};

eventListSV.delegate = {
  getTileInfo: function(index) {
    if (listStorage[index])
      listStorage[index].index = index;
    return listStorage[index];
  },
  configureTile : function(tile, info) {
    let textElement = tile.getElementById('text');
    if (info.type === "date-separator-pool" || info.type === "last-update-pool") {
      textElement.text = info.value;
      textElement.style.fontFamily = `${fontFamily}-Regular`;
      return;
    }
    if (info.type === "no-event-message-pool") {
      textElement.text = info.value;
      textElement.style.fontFamily = `${fontFamily}-Regular`;
      return;
    }
    
    tile.getElementById('event-color').style.fill = info.event.color.background;
    
    let summary = tile.getElementById('event-summary');
    summary.text = info.event.summary;
    summary.style.fontFamily = `${fontFamily}-Regular`;
    if (info.type === "event-pool" || info.type === "event-now-pool") {    
      summary.style.fontFamily = `${fontFamily}-Bold`;
      let location = tile.getElementById('event-location');
      summary.style.height = 45;
      summary.rows = 1;
      location.style.fontFamily = `${fontFamily}-Regular`;
      if (summary.textOverflowing || !info.event.location) {
        summary.height = 150;
        summary.rows = 2;
        location.style.display = "none";
      } else {
        location.style.display = "inline";
        location.text = info.event.location;
      }
      let evtTime = tile.getElementById('event-time');
      evtTime.text = 
        formatTimeRange(info.event.start, info.event.end, true, info.event.allDay, false);
      evtTime.style.fontFamily = `${fontFamily}-Regular`;
    }
    tile.value = info.index;
    
    tile.onclick = function() {
      container.style.display = "none";
      renderOverlay(listStorage[this.value].event);
    };
  }
}

overlayInit(container);

calendar.onUpdate = renderEvents;
calendar.onError = renderSnackBar;
renderEvents();