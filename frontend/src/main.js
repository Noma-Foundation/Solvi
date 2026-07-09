import pkg from "../package.json";

import "./style.css";
import "./app.css";

import $ from "jquery";

import { MenuBar } from "./components/menu-bar/menu-bar.js";
import { SearchBar } from "./components/search-bar/search-bar.js";
import { eventBus } from "./event-manager-singleton.js";

$(function () {
    // Initialize main app components
    const menuBar = new MenuBar();
    const searchBar = new SearchBar();

    eventBus.subscribe("LOGGER", () => {
        console.log("Hello, World!");
    });

    // Set app version
    $("#app-version").text(`${pkg.version}`);
});
