import document from "document";
import { _, initStrings } from "../common/locale.js";

export function initLocale(language) {
    initStrings(language);
    document.getElementById('next-event-countdown').getElementById("countdown-name").text = _("next_event");
    document.getElementById('this-event-countdown').getElementById("countdown-name").text = _("happening_now");
    document.getElementById('dsv-back-button').text = _("back");
}