import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import pkg from "../package.json";

import "./style.css";
import "./app.css";

import $ from "jquery";

import { MenuBar } from "./components/menu-bar/menu-bar.js";
import { SearchBar } from "./components/search-bar/search-bar.js";
import { eventBus } from "./event-manager-singleton.js";
import { Home } from "./views/home-page.js";

import { LogDebug } from "../wailsjs/runtime/runtime.js";
import { OpenTerminal } from "../wailsjs/go/internal/OrderHub.js";


$(function () {
    // Initialize main app components
    const context = "#app-main-context";
    const menuBar = new MenuBar();
    const searchBar = new SearchBar();

    eventBus.subscribe("login", () => {
        LogDebug("Login event received");
    });

    $("#app-version").text(`${pkg.version}`);
});
