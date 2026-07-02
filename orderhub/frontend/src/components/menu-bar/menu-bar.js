import $ from "jquery";

import { LogInfo } from "../../../wailsjs/runtime/runtime";

import { IComponentModel } from "../component-model.js";


export class MenuBar extends IComponentModel {
    #menuBarId;
    #currentPageId;
    #previousPageId;
    #menubarComponentList;

    constructor() {
        super();
        this.#menuBarId = "#main-menu-bar";
        this.#currentPageId = "#home-page";
        this.#previousPageId = null;
        this.#menubarComponentList = [
            "#home-page",
            "#folder-page",
            "#customer-page",
            "#inbox-page",
            "#calendar-page",
            "#notifications-page"
        ];
        this.init();
    }

    buildTemplate() {
        const menuBarTemplate = `
            <nav class="navigation-bar container-fluid px-0">
                <ul>
                    <li class="selected" id="home-page" role="button" tabindex="0">
                        <img src="./assets/icons/aside/home.svg" alt="Home">
                    </li>
                    <!--
                    <li class="unselected" id="folder-page" role="button" tabindex="0">
                        <img src="./src/assets/icons/aside/folder.svg" alt="Folder">
                    </li>
                    <li class="unselected" id="customer-page" role="button" tabindex="0">
                        <img src="./src/assets/icons/aside/customer.svg" alt="Customer">
                    </li>
                    <li class="unselected" id="inbox-page" role="button" tabindex="0">
                        <img src="./src/assets/icons/aside/inbox.svg" alt="Inbox">
                    </li>
                    <li class="unselected" id="calendar-page" role="button" tabindex="0">
                        <img src="./src/assets/icons/aside/calendar.svg" alt="Calendar">
                    </li>
                    <li class="unselected" id="notifications-page" role="button" tabindex="0">
                        <img src="./src/assets/icons/aside/notifications.svg" alt="Notifications">
                    </li>
                    -->
                </ul>
            </nav>
        `;
        $(this.#menuBarId).append(menuBarTemplate);
        this.#changeContext();
    }

    bindEvents() {
        const allButtons = $(`${this.#menuBarId} ul li`);

        allButtons.on("click", (event) => {
            const target = event.currentTarget;
            const targetId = "#" + target.getAttribute("id");
            const state = this.setCurrentPageId(targetId);
            if (state) {
                this.#switchButtonState(target);
                this.#showCurrentAndPreviousPageIds();
                this.#changeContext();
            }
        });
    }

    #switchButtonState(target) {
        $(this.#previousPageId).removeClass("selected").addClass("unselected");
        $(target).removeClass("unselected").addClass("selected");
    }

    /**
     * @param {string} value 
     * @returns {boolean} - True if the current page id is updated, false otherwise. 
     */
    setCurrentPageId(value) {
        if (value === this.#currentPageId || !value) { return false; }
        if (this.#menubarComponentList.includes(value)) {
            this.#previousPageId = this.#currentPageId;
            this.#currentPageId = value;
            return true;
        }
        return false;
    }

    /**
     * @returns {string} - The current page id with '#' prefix. 
     */
    getCurrentPageId() {
        return this.#currentPageId;
    }

    #showCurrentAndPreviousPageIds() {
        const message = this.#currentPageId.replace("#", "");
        LogInfo(`Change Main Context display | Actual current page is ${message}`);
    }

    #changeContext() {
        const appMainContext = $("#app-main-context");

        const templateOptionButtons = `
            <section class="container d-flex gap-4">
                <article class="d-flex flex-column gap-2 justify-content-center align-items-center">
                    <div id="view-tickets-fab-button" class="fab-button" role="button">
                        <img src="./assets/icons/core_functions/edit_ticket.svg"
                            alt="View all tickets button" />
                    </div>
                    <h6 class="text-center">View<br>tickets</h6>
                </article>
            </section>
        `;

        if (this.#currentPageId == "#home-page") {
            appMainContext.html(templateOptionButtons);
        } else if (this.#currentPageId == "#notifications-page") {
            appMainContext.html("");
        }
    }

}
