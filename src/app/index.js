import document from "document";
import * as messaging from "messaging";
import * as fs from "fs";
import { inbox } from "file-transfer";
import clock from "clock";
import { battery } from "power";
import GCalendar from "./gCalendar.js";
import { me } from "appbit";
import { SETTINGS_FILE, SETTINGS_TYPE } from "../common/const";
import { me as device } from "device";
if (!device.screen) device.screen = { width: 348, height: 250 };

const calendar = new GCalendar();

clock.granularity = "seconds";

var listStorage = [];

const dateText = document.getElementById("date-now");
const timeText = document.getElementById("time-now");
const batteryText = document.getElementById("battery");

const eventListSV = document.getElementById("event-list");
const container = document.getElementById("container");

let settings = loadSettings();

function loadSettings() {
  try {
    return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
  } catch (ex) {
    // Defaults
    return {default: new Date()};
  }
}

function saveSettings() {
  fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE);
}

me.onunload = saveSettings;

clock.ontick = function(evt) {
  // Output the date object
  if (container.value == 0) {
    timeText.text = formatTime(evt.date);
    dateText.text = formatDate(evt.date, false);
    batteryText.text = Math.floor(battery.chargeLevel) + "%";
    batteryText.x = timeText.getBBox().left - 5;
  } else {
    tickCountdown(evt, false);
  }
};

inbox.addEventListener("newfile", function() {
  const fileName = inbox.nextFile();
  if (!calendar.processFile(fileName)) {
    // process other files
  }
});

// Message is received
messaging.peerSocket.onmessage = evt => {
  if (evt.data.key === 'oauth' && evt.data.newValue && !evt.data.restore) {
    if (calendar.fetchEvents() || settings.oauth === undefined)
      renderEvents();
  }
  settings[evt.data.key] = evt.data.newValue;
};

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
  calendar.fetchEvents();
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("App Socket Closed");
};


const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function twoDig(num) { return ("0" + num).slice(-2); }

function monoDig(str) {
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

function formatTime(timeStamp) {
  let date = timeStamp;
  if (typeof date.getTime !== "function") date = new Date(timeStamp);
  return twoDig(date.getHours()) + ":" + twoDig(date.getMinutes());
}

function formatDate(timeStamp, markToday) {
  let time = new Date(timeStamp);
  if (time.setHours(0,0,0,0) == new Date().setHours(0,0,0,0) && markToday)
    return "Today";
  return `${dayNames[time.getDay()]}, ${time.getDate()} ${monthNames[time.getMonth()]}`;
}

function formatTimeRange(start, end, markToday, allDay, markDate) {
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

function renderPersistentErrorMessage(message) {
  listStorage = [{
      type: "no-event-message-pool",
      value: message
    }];
    eventListSV.length = 1;
    renderCountdown([]);
}

function renderEvents(){
  if (!me.permissions.granted("access_internet"))
    return renderPersistentErrorMessage("Intenet access permission is required to run this app.");
  
  if (!me.permissions.granted("run_background"))
    renderSnackbar("Run-in-background permission is not granted. Your calendar update may be delayed.");
  if (!settings.oauth_refresh_token) {
    renderPersistentErrorMessage("You need to log in to your calendar in the app settings first. If you have logged in, restart the app to refresh.");
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
    renderPersistentErrorMessage("You have no further event.");
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
  renderCountdown(events);
}

/* Overlay */
const dsvOverlay = document.getElementById('detail-overlay');
const dsvCalendar = document.getElementById('dsv-calendar-text');
const dsvTime = document.getElementById('dsv-time-text');
const dsvSummary = document.getElementById('dsv-summary-text');
const dsvLocation = document.getElementById('dsv-location-text');
const dsvBack = document.getElementById('dsv-back-button');
const dsvView = document.getElementById('detail-overlay-sv');
const dsvItem = document.getElementById("dsv-item")


function renderOverlay(evt) {
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

dsvBack.onclick = function(evt) {
  dsvView.value = 0;
  container.style.display = "inline";
  dsvOverlay.style.display = "none";
}

document.getElementById("header-container").onclick = () => {
  console.log('force update by header');
  renderSnackBar("Updating...");
  calendar.fetchEvents();
};

calendar.onUpdate = function() {
  renderEvents();
}

eventListSV.delegate = {
  getTileInfo: function(index) {
    listStorage[index].index = index;
    return listStorage[index];
  },
  configureTile : function(tile, info) {
    if (info.type === "date-separator-pool" || info.type === "last-update-pool") {
      tile.getElementById('text').text = info.value;
      return;
    }
    if (info.type === "no-event-message-pool") {
      tile.getElementById('text').text = info.value;
      return;
    }
    
    tile.getElementById('event-color').style.fill = info.event.color.background;
    
    let summary = tile.getElementById('event-summary');
    summary.text = info.event.summary;
    if (info.type === "event-pool" || info.type === "event-now-pool") {
      let location = tile.getElementById('event-location');
      summary.style.height = 45;
      summary.rows = 1;
      if (summary.textOverflowing || !info.event.location) {
        summary.height = 150;
        summary.rows = 2;
        location.style.display = "none";
      } else {
        location.style.display = "inline";
        location.text = info.event.location;
      }
      tile.getElementById('event-time').text = formatTimeRange(info.event.start,
                                                              info.event.end,
                                                              true,
                                                              info.event.allDay,
                                                              false);
    }
    
    console.log(`rendering ${info.type}: ${info.event && info.event.summary}`);
    const ifEvt = info.event && info.event.summary;
    tile.value = info.index;
    console.log(`rendered tile id = ${tile.value}`);
    
    tile.onclick = function() {
      console.log(`trying to show ${this.value}: ${listStorage[this.value].event.summary}`);
      container.style.display = "none";
      // renderOverlay(info.event);
      renderOverlay(listStorage[this.value].event);
    };
  }
}

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

function renderCountdown(events) {
  thisEvent = undefined;
  nextEvent = undefined;
  const now = new Date();
  for (let i of events) {
    if (i.allDay) continue;
    if (thisEvent == undefined && i.start <= now && now < i.end )
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
    if (downToDate !== "Today") downToTime += ", " + downToDate;
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
    if (downToDate !== "Today") downToTime += ", " + downToDate;
    nextEventPage.getElementById("countdown-target").text = downToTime;
    nextMarquee.getElementById("text").text = nextEvent.summary;
    nextMarquee.getElementById("copy").text = nextEvent.summary;
    nextMarquee.style.fill = nextEvent.color.background;
    nextEventPage.getElementById("event-location").text = nextEvent.location;
  } else {
    nextEventPage.style.display = "none";
  }
  container.value = 0;
  tickCountdown({date: new Date()}, true);
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
  if (weeks != 0) ret.push(weeks + "w");
  if (days != 0) ret.push(days + "d");
  if (hours != 0) ret.push(monoDig(`${hours}:${twoDig(minutes)}:${twoDig(seconds)}`));
  else if (minutes != 0) ret.push(monoDig(`${minutes}:${twoDig(seconds)}`));
  else if (hours != 0) ret.push(monoDig(seconds) + "s");
  if (ret.length == 0) return "Now.";
  if (then < now) ret.push("ago");
  return ret.join(" ");
}

function tickCountdown(tick, force) {
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

const snackBar = document.getElementById("snackbar");
const snackBarText = snackBar.getElementById("text");
function renderSnackBar(message) {
  snackBarText.text = message;
  snackBar.style.display = "inline";
  snackBar.animate("expand");
  snackBar.getElementById("background").sendEvent({type: "reload"});
  setTimeout(function(){snackBar.style.display = "none"}, 4000);
};

calendar.onUpdate = renderEvents;
calendar.onError = renderSnackBar;

renderEvents();