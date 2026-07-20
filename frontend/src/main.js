import pkg from "../package.json";

import "./style.css";
import "./app.css";

import $ from "jquery";

import { MenuBar } from "./components/menu-bar/menu-bar.js";
import { SearchBar } from "./components/search-bar/search-bar.js";
import { eventBus } from "./event-manager-singleton.js";

import { LogDebug } from "../wailsjs/runtime/runtime.js";
import { OpenTerminal } from "../wailsjs/go/internal/OrderHub.js";


$(function () {
    // Initialize main app components
    const menuBar = new MenuBar();
    const searchBar = new SearchBar();

    eventBus.subscribe("LOGGER", () => {
        LogDebug("Hello, World!");
    });

    // This code part is used to display and beta test the core functions
    const viewTicketButton = document.getElementById("view-tickets-fab-button");

    viewTicketButton.addEventListener("click", () => {
        OpenTerminal();
        LogDebug("Clicked in View Tickets FAB Button | Open CMD to view all tickets");
    });

    // Set app version
    $("#app-version").text(`${pkg.version}`);
});
