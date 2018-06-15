import * as fs from "fs";
import { SETTINGS_FILE, SETTINGS_TYPE } from "../common/const";

export function loadSettings() {
    try {
        return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
    } catch (ex) {
        // Defaults
        return { default: new Date() };
    }
}

export function saveSettings() {
    fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE);
}