import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import pkg from "../package.json";

import "./style.css";
import "./app.css";

import $ from "jquery";

import { contextManager } from "./utils/context-manager.js";
import { eventBus } from "./event-manager-singleton.js";
import { notificationService } from "./utils/notification-service.js";
import { waitForPywebviewApi } from "./utils/api-helpers.js";

import { LoginPage } from "./components/login-page/login-page.js";

$(async function () {
    // Initialize main app components
    const context = "#app-main-context";
    $("#app-version").text(`${pkg.version}`);

    notificationService.start();

    console.log("Open login page");
    // const loginPage = new LoginPage(context);

    // When authentication succeeds, the login page will publish 'auth:success'
    /*eventBus.subscribe("auth:success", (data) => {
        if (data && data.role === "employee") {
            console.log("Open in employee mode");
            contextManager.show("home")
        } else if (data && data.role === "support") {
            console.log("Open in support mode")
            contextManager.show("home");
        }
    });*/

    // pywebview injects window.pywebview.api asynchronously after page load.
    // On a fresh/unsigned install, first-run AV or WebView2 initialization can
    // take longer than any fixed timeout, so self-heal: if the ready event
    // fires late (after we already gave up and rendered), re-render the
    // current view so it picks up the now-available API instead of being
    // stuck showing "API indisponível" forever.
    window.addEventListener("pywebviewready", () => {
        contextManager.show(contextManager.getCurrent() || "home");
    });

    await waitForPywebviewApi(15000);
    contextManager.show("home");
});
