import $ from "jquery";

import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";

const buttons = document.querySelectorAll("[data-setting]");
const sections = document.querySelectorAll("[data-section]");

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const setting = button.dataset.setting;

        buttons.forEach(btn => {
            btn.classList.remove("selected-setting");
        });

        button.classList.add("selected-setting");

        sections.forEach(section => {
            section.classList.toggle(
                "d-none",
                section.dataset.section !== setting
            );
        });
    });
});

document.querySelector("#exit-settings").addEventListener("click", () => {
    console.log("[LOG] Logging out of the system");
});

document.querySelector("#save-settings").addEventListener("click", () => {
    console.log("[LOG] saving and applying settings.");
});

// Open Settings 
async function ajust_settings() {
    const message = await window.pywebview.api.ajust_settings();
    console.log(message);
}

if (window.pywebview && window.pywebview.api) {
    ajust_settings();
} else {
    window.addEventListener("pywebviewready", ajust_settings);
}