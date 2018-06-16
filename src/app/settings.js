import * as fs from "fs";
import { SETTINGS_FILE, SETTINGS_TYPE } from "../common/const";

export function loadSettings() {
    try {
        return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
    } catch (ex) {
        // Defaults
        return { 
          default: new Date(),
          system_default_font: false,
          hide_countdown: false,
          show_countdown_seconds: false
        };
    }
}

export function saveSettings(settings) {
    fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE);
}