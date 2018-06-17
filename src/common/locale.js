import * as fs from "fs";
import { locale } from "user-settings";

let default_strings = {};
let pref_strings = {};

export function initStrings(pref_language, default_language = 'en-US') {
    pref_strings = default_strings = {};
    if (pref_language == "default") pref_language = locale.language;
    pref_language = pref_language || locale.language;

    try {
        pref_strings = fs.readFileSync(`resources/locales/${pref_language}.json`, "json");
    } catch (error) {
        console.log(error);
    }

    if (default_language !== pref_language) {
        try {
            default_strings = fs.readFileSync(`resources/locales/${default_language}.json`, "json");
        } catch (error) {
            console.log(error);
        }
    }
}

export function _(key) {
    let str = pref_strings[key] || default_strings[key] || key;
    for (let i = 0; i < arguments.length - 1; i++) {
        str = str.replace(`{${i}}`, arguments[i + 1]);
    }
    return str;
}