import "./style.css";
import "./app.css";

import $ from "jquery";

import { MenuBar } from "./components/menu-bar/menu-bar.js";

$(function () {
    const menuBar = new MenuBar();
    console.log(menuBar.getCurrentPageId());
});
