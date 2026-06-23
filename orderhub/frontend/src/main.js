import "./style.css";
import "./app.css";

import $ from "jquery";

import { MenuBar } from "./components/menu-bar/menu-bar.js";
import { SearchBar } from "./components/search-bar/search.js";

$(function () {
    const menuBar = new MenuBar();
    const searchBar = new SearchBar();
});
