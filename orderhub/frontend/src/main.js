import pkg from "../package.json";

import "./style.css";
import "./app.css";

import $ from "jquery";

import { MenuBar } from "./components/menu-bar/menu-bar.js";
import { SearchBar } from "./components/search-bar/search-bar.js";

$(function () {
    const menuBar = new MenuBar();
    const searchBar = new SearchBar();
    $("#app-version").text(`${pkg.version}`);
});
