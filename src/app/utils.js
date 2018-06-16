export function renderPersistentErrorMessage(message, eventListSV) {
    eventListSV.length = 1;
    return [{
        type: "no-event-message-pool",
        value: message
    }];
}