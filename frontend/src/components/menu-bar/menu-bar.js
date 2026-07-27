import $ from "jquery";

import { LogInfo } from "../../../wailsjs/runtime/runtime";

import { IComponentModel } from "../component-model.js";

import homeIcon from "../../assets/icons/aside/home.svg";
import folderIcon from "../../assets/icons/aside/folder.svg";
import customerIcon from "../../assets/icons/aside/customer.svg";
import inboxIcon from "../../assets/icons/aside/inbox.svg";
import calendarIcon from "../../assets/icons/aside/calendar.svg";
import notificationsIcon from "../../assets/icons/aside/notifications.svg";

import { html } from "../../utils/html.js";

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
        const menuBarTemplate = html`
            <nav class="navigation-bar container-fluid px-0">
                <ul>
                    <li class="selected" id="home-page" role="button" tabindex="0">
                        <img src="${homeIcon}" alt="Home" loading="lazy">
                    </li>
                    <!--
                    <li class="unselected" id="folder-page" role="button" tabindex="0">
                        <img src="${folderIcon}" alt="Folder" loading="lazy">
                    </li>
                    <li class="unselected" id="customer-page" role="button" tabindex="0">
                        <img src="${customerIcon}" alt="Customer" loading="lazy">
                    </li>
                    <li class="unselected" id="inbox-page" role="button" tabindex="0">
                        <img src="${inboxIcon}" alt="Inbox" loading="lazy">
                    </li>
                    <li class="unselected" id="calendar-page" role="button" tabindex="0">
                        <img src="${calendarIcon}" alt="Calendar" loading="lazy">
                    </li>
                    -->
                    <li class="unselected" id="notifications-page" role="button" tabindex="0">
                        <img src="${notificationsIcon}" alt="Notifications" loading="lazy">
                    </li>
                </ul>
            </nav>
        `;
        $(this.#menuBarId).append(menuBarTemplate);
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

}
