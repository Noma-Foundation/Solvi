import "./style.css";
import "./app.css";

import { OpenSettings } from "../wailsjs/go/main/App";

// Change in future to open the real settings window
// Not working yet
// Remove this function
window.openSettings = function () {
    OpenSettings().then((result) => {
        console.log("Settings opened");
    });
};

// document.addEventListener("DOMContentLoaded", renderTickets);
