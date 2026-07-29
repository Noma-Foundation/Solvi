import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import pkg from "../package.json";

import "./style.css";
import "./app.css";

import $ from "jquery";

import { eventBus } from "./event-manager-singleton.js";
import { LoginPage } from "./components/login-page/login-page.js";

$(function () {
    // Initialize main app components
    const context = "#app-main-context";

    eventBus.subscribe("login", () => {
        const loginPage = new LoginPage(context);
    });

    $("#app-version").text(`${pkg.version}`);
});
