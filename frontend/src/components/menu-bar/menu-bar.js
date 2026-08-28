import $ from "jquery";

import { IComponentModel } from "../../../framework/interfaces/component-model.js";

import { contextManager } from "../../utils/context-manager.js";

import homeIcon from "../../assets/icons/aside/home.svg";
import customerIcon from "../../assets/icons/aside/customer.svg";
import inboxIcon from "../../assets/icons/aside/inbox.svg";
import calendarIcon from "../../assets/icons/aside/calendar.svg";
import notificationsIcon from "../../assets/icons/aside/notifications.svg";


export class MenuBar extends IComponentModel {
    #menuBarId;
    #currentPageId;
    #previousPageId;
    #menubarComponentList;

    constructor() {
        super();
        this.context = "#main-menu-bar";
        this.#currentPageId = "#home-page";
        this.#previousPageId = null;
        this.#menubarComponentList = [
            "#home-page",
            "#customer-page",
            "#inbox-page",
            "#calendar-page",
            "#notifications-page"
        ];
        this.init();
    }

    buildTemplate() {
        this.template = /* html */ `
            <nav class="navigation-bar container-fluid px-0">
                <ul>
                    <li class="selected" id="home-page" role="button" tabindex="0">
                        <img src="${homeIcon}" alt="Home" loading="lazy">
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
                    <li class="unselected" id="notifications-page" role="button" tabindex="0">
                        <img src="${notificationsIcon}" alt="Notifications" loading="lazy">
                    </li>
                </ul>
            </nav>
        `;
        $(this.context).append(this.template);
    }

    bindEvents() {
        const allButtons = $(`${this.context} ul li`);

        allButtons.on("click", (event) => {
            this.#onclickButton(event);
        });

        allButtons.on("keydown", (event) => {
            this.#onclickButton(event);
        });
    }

    #onclickButton(event) {
        if (event.type !== "click" && event.key !== "Enter" && event.key !== " ") { return; }

        const target = event.currentTarget;
        const targetId = "#" + target.getAttribute("id");
        const state = this.setCurrentPageId(targetId);
        if (state) {
            this.#switchButtonState(target);
        }
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

            switch (this.#currentPageId) {
                case "#home-page":
                    contextManager.show("home");
                    break;
                case "#customer-page":
                    contextManager.show("customer");
                    break;
                case "#inbox-page":
                    contextManager.show("inbox");
                    break;
                case "#calendar-page":
                    contextManager.show("calendar");
                    break;
                case "#notifications-page":
                    contextManager.show("notification");
                    break;
            }
            return true;
        }
        return false;
    }

}
