import "./style.css";
import "./app.css";

import $ from "jquery";

import { MenuBar } from "./components/menu-bar/menu-bar.js";

import { OpenTerminal } from "../wailsjs/go/main/App.js";
import { LogDebug } from "../wailsjs/runtime/runtime.js";

$(function () {
    const menuBar = new MenuBar();

    // This code part is used to display and beta test the core functions
    const viewTicketButton = document.getElementById("view-tickets-fab-button");
    const deleteTicketButton = document.getElementById("remove-ticket-fab-button");

    viewTicketButton.addEventListener("click", () => {
        OpenTerminal();
        LogDebug("Clicked in View Button | Open CMD for display tickets");
    });

    deleteTicketButton.addEventListener("click", () => {
        LogDebug("Clicked in Delete Button | Open CMD for delete tickets");
    });
});
