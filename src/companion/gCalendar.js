import { settingsStorage } from "settings";
import { outbox } from "file-transfer";
import { peerSocket } from "messaging";
import * as cbor from "cbor";
import { GC_DATA_FILE, GC_ERROR_FILE, GC_UPDATE_TOKEN, MAX_EVENT_COUNT } from "../common/const";

const colorMapping = {
  "1": {
   "background": "#a4bdfc",
   "foreground": "#1d1d1d"
  },
  "2": {
   "background": "#7ae7bf",
   "foreground": "#1d1d1d"
  },
  "3": {
   "background": "#dbadff",
   "foreground": "#1d1d1d"
  },
  "4": {
   "background": "#ff887c",
   "foreground": "#1d1d1d"
  },
  "5": {
   "background": "#fbd75b",
   "foreground": "#1d1d1d"
  },
  "6": {
   "background": "#ffb878",
   "foreground": "#1d1d1d"
  },
  "7": {
   "background": "#46d6db",
   "foreground": "#1d1d1d"
  },
  "8": {
   "background": "#e1e1e1",
   "foreground": "#1d1d1d"
  },
  "9": {
   "background": "#5484ed",
   "foreground": "#1d1d1d"
  },
  "10": {
   "background": "#51b749",
   "foreground": "#1d1d1d"
  },
  "11": {
   "background": "#dc2127",
   "foreground": "#1d1d1d"
  }
};

export default class GCalendar {
  
  constructor() {
    let self = this;
    this.data = {lastUpdate: 0};
    peerSocket.addEventListener("message", (evt) => {
      console.log(`listening socket heard ${JSON.stringify(evt.data)}`);
      // We are receiving a request from the app
      if (evt.data === undefined) return;
      if (evt.data[GC_UPDATE_TOKEN] == true) {
        console.log("Start loading events");
        self.loadEvents();
      } 
    });
    
  }

  loadEvents() {
    if(!this.isLoggedIn()) return;
    for (let index = 0; index < settingsStorage.length; index++) {
      let key = settingsStorage.key(index);
      if (key && key === "oauth") {
        // We already have an oauth token
        let data = JSON.parse(settingsStorage.getItem(key));
        console.log(`oauth data: ${settingsStorage.getItem(key)}`);
        this.fetchEvents(data, true);
      }
    }
  }
  
  isLoggedIn() {
    return settingsStorage.getItem('oauth_refresh_token') !== undefined;
  }

  fetchEvents(oAuthData, retry) {
    const accessToken = oAuthData.access_token;
    const now = new Date().getTime();
    const today = new Date().setHours(0,0,0,0);
    const self = this;

    fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    })
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      let calendarIDs = [];
      let calendarInfo = [];
      if (data.error) {
        if (data.error.message === 'Invalid Credentials' && retry) {
          refreshToken(oAuthData).then((data) => {
            if(!data) {
              console.log(`refershToken Failed. ${data} ${JSON.stringify(data)}`);
              return;
            }
            self.fetchEvents(data, false);
          });
          return;
        } else {
          console.log(`Error occurred while fetching calendar list (server): ${data.error.code} ${data.error.message}`);
          console.log(JSON.stringify(data.error.errors));
          outbox.enqueue(GC_ERROR_FILE, cbor.encode(data.error.message))
                .catch(error => console.log(`Fail to send fetch error: ${error}`));
          return;
        }
      }
      for (let i of data.items) {
        if (i.selected) {
          calendarIDs.push(getEventsPromise(accessToken, i.id));
          calendarInfo.push(i);
        }
      }

      if (calendarIDs.length < 0) return;
      
      const promise = calendarIDs[0].constructor;
      
      promise.all(calendarIDs).then((values) => {
        let events = [];
        for (let i in values) {
          if (values[i].error !== undefined) {
            console.log(`Error occurred while fetching calendar:`);
            console.log(JSON.stringify(values[i].error));
            continue;
          }
          for (let event of values[i].items) {
            let ev = formatEvent(event, calendarInfo[i]);
            if (ev.end >= today) events.push(ev);
          }
        }

        events.sort(function (a, b) {
          let diff = a.start - b.start;
          if (diff != 0) 
            return diff;
          else if (a.allDay != b.allDay)
            return b.allDay - a.allDay;
          else if (a.summary < b.summary)
            return -1;
          else if (a.summary > b.summary)
            return 1;
          else return 0;
          
        });
        events = events.slice(0, MAX_EVENT_COUNT);

        // Send the file out
        outbox.enqueue(GC_DATA_FILE, cbor.encode({lastUpdate: now, events: events}))
              .catch(error => console.log(`Fail to send data: ${error}`));
        self.data = {lastUpdate: now, events: events};
      }).catch(err => {
        console.log('Error occurred while fetching single calendar events: ' + err + err.stack);
      });
    })
    .catch(err => {
      console.log('Error occurred while fetching calendar list: ' + err + err.stack);
      outbox.enqueue(GC_ERROR_FILE, cbor.encode(err))
              .catch(error => console.log(`Fail to send fetch error: ${error}`));
    });
  }
  
}

function refreshToken(oAuthData) {
  let refreshToken = settingsStorage.getItem("oauth_refresh_token");
  if (refreshToken === undefined) return {then: function(){}, catch: function(){}};
  console.log(`oauth refresh token: ${refreshToken}`);
  return fetch("https://www.googleapis.com/oauth2/v4/token", {
    headers: {"Content-Type": "application/x-www-form-urlencoded", },
    method: 'POST',
    body: "client_id=944815048061-arqtkmed31rn718pcrud4btgvjege6pe.apps.googleusercontent.com&client_secret=-6DtJ6cNDw6Xb31fOp3xtkvx&grant_type=refresh_token&refresh_token=" + encodeURIComponent(refreshToken),
  })
  .then((resp) => resp.json())
  .then((json) => {
    console.log(`Retrived new token: ${json} ${JSON.stringify(json)}`);
    if (json.error) {
      console.log(`Error in JSON: ${json} ${JSON.stringify(json)}`);
      throw new Error(json.error);
    }
    oAuthData.access_token = json.access_token;
    oAuthData.expires_in = json.expires_in;
    settingsStorage.setItem('oauth', JSON.stringify(oAuthData));
    return json;
  })
  .catch((err) => {console.log(`${err}, ${JSON.stringify(err)}`)});
}

function getEventsPromise(accessToken, calendarID) {
  return fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarID)}/events?maxResults=${MAX_EVENT_COUNT}&orderBy=startTime&timeMin=${(new Date(new Date().setHours(0,0,0,0))).toISOString()}&singleEvents=true`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  }).then((res) => res.json())
  .catch((err) => {
    console.log(`Failed to fetch calendar withid ${calendarID} with error ${err}`);
  });
}

function formatColor(colorID) {
  let color = colorMapping[`${colorID}`];
  if (color === undefined) {
    color = {background: "#00A4Ee", foreground: "#ffffff"};
  }
  return color;
}

function formatEvent(event, calendar) {
  var data = {
    id: event.id,
    start: new Date(Date.parse(event.start.dateTime || event.start.date)).getTime(),
    end: new Date(Date.parse(event.end.dateTime || event.end.date)).getTime(),
    allDay: event.start.date !== undefined,
    summary: event.summary,
    location: event.location,
    color: event.colorId === undefined ? formatColor(calendar.colorId) : formatColor(event.colorId),
    calendar: {
      color: formatColor(calendar.colorId),
      summary: calendar.summary,
      id: calendar.id,
    },
  };
  return data;
}