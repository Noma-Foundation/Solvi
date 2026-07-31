import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import pkg from "../package.json";

import "./style.css";
import "./app.css";

import $ from "jquery";

import { contextManager } from "./utils/context-manager.js";
import { eventBus } from "./event-manager-singleton.js";
import { LoginPage } from "./components/login-page/login-page.js";

$(function () {
    // Initialize main app components
    const context = "#app-main-context";
    $("#app-version").text(`${pkg.version}`);

    console.log("Open login page");
    const loginPage = new LoginPage(context);

    // When authentication succeeds, the login page will publish 'auth:success'
    console.log('[main] registering auth:success handler');
    eventBus.subscribe("auth:success", (data) => {
        console.log('[main] auth:success received:', data);
        if (data && data.role === "employee") {
            contextManager.show("home", data);
        } else if (data && data.role === "support") {
            contextManager.show("home", data);
        } else {
            contextManager.show("home", data);
        }
    });
});
