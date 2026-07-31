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

    const login = eventBus.subscribe("login", () => {
        console.log("Open login page")
        const loginPage = new LoginPage(context);
    });

    login();

    // When authentication succeeds, the login page will publish 'auth:success'
    const onAuth = eventBus.subscribe("auth:success", (data) => {
        // data.role can be 'employee' or 'support' etc.
        if (data && data.role === "employee") {
            contextManager.show("home", data);
        } else if (data && data.role === "support") {
            // If support should see another view, change the argument accordingly.
            contextManager.show("home", data);
        } else {
            contextManager.show("home", data);
        }
    });
    onAuth();
});
