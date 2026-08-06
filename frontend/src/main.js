import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import pkg from "../package.json";

import "./style.css";
import "./app.css";

import $ from "jquery";

import { contextManager } from "./utils/context-manager.js";
import { notificationService } from "./utils/notification-service.js";

$(function () {
    $("#app-version").text(`${pkg.version}`);

    notificationService.start();
    contextManager.show("home");
});
