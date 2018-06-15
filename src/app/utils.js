export function renderPersistentErrorMessage(message) {
    listStorage = [{
        type: "no-event-message-pool",
        value: message
    }];
    eventListSV.length = 1;
}