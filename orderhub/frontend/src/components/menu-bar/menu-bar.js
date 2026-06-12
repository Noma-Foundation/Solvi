import $ from "jquery";

import { ComponentModel } from "../component-model.js";


export class MenuBar extends ComponentModel {
    #menuBarId;
    #currentPageId;
    #previosPageId;
    #menubarComponentList;

    constructor() {
        super();
        this.#menuBarId = "#main-menu-bar";
        this.#currentPageId = "#home-page";
        this.#previosPageId = null;
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
                        <img src="./src/assets/icons/aside/home.svg" alt="Home">
                    </li>
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
                this.switchButtonState(target);
            }
        });
    }

    switchButtonState(target) {
        $(this.#previosPageId).removeClass("selected").addClass("unselected");
        $(target).removeClass("unselected").addClass("selected");
    }

    /**
     * @param {string} value 
     * @returns {boolean} - True if the current page id is updated, false otherwise. 
     */
    setCurrentPageId(value) {
        if (value === this.#currentPageId || !value) { return false; }
        if (this.#menubarComponentList.includes(value)) {
            this.#previosPageId = this.#currentPageId;
            this.#currentPageId = value;
            return true;
        }
        return false;
    }

    /**
     * @returns {string} - The current page id. 
     */
    getCurrentPageId() {
        return this.#currentPageId;
    }

}
