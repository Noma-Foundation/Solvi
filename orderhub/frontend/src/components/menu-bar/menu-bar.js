import $ from "jquery";

import { ComponentModel } from "../component-model";


export class MenuBar extends ComponentModel {
    #menuBarId;
    #currentPageId;

    constructor() {
        super();
        this.#menuBarId = "#main-menu-bar";
        this.#currentPageId = "#home-page";
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
    }

    setCurrentPageId(value) {
    }

    getCurrentPageId() {
        return this.#currentPageId;
    }

}