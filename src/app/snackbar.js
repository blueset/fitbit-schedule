import document from "document";

const snackBar = document.getElementById("snackbar");
const snackBarText = snackBar.getElementById("text");
export function renderSnackBar(message) {
    snackBarText.text = message;
    snackBar.style.display = "inline";
    snackBar.animate("expand");
    snackBar.getElementById("background").sendEvent({ type: "reload" });
    setTimeout(function () { snackBar.style.display = "none" }, 4000);
};