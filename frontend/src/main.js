import pkg from "../package.json";

import "./style.css";
import "./app.css";

import $ from "jquery";

import { MenuBar } from "./components/menu-bar/menu-bar.js";
import { SearchBar } from "./components/search-bar/search-bar.js";

import { EventBus } from "./utils/event-bus.js";

$(function () {
    // Initialize main app components
    const menuBar = new MenuBar();
    const searchBar = new SearchBar();
    const eventBus = new EventBus();

    // Set app version
    $("#app-version").text(`${pkg.version}`);
});
