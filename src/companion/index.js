import * as messaging from "messaging";
import { settingsStorage } from "settings";
import GCalendar from "./gCalendar";
import { me } from "companion";

const gCalendar = new GCalendar();

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
  restoreSettings();
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("Companion Socket Closed");
};

// A user changes settings
settingsStorage.onchange = (evt) => {
  let data = {
    key: evt.key,
    newValue: evt.newValue,
    oldValue: evt.oldValue
  };
  sendVal(data);
};

// Restore any previously saved settings and send to the device
function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    if (key) {
      let data = {
        key: key,
        newValue: settingsStorage.getItem(key),
        restore: true
      };
      sendVal(data);
    }
  }
}

// Send data to device using Messaging API
function sendVal(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.log(`${data.key} is not sent due to lost of connection`);
  }
}

if (me.launchReasons.settingsChanged) {
  gCalendar.loadEvents();
}


