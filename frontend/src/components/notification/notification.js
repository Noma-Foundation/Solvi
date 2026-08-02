import { IComponentModel } from "../component-model.js";
import { html } from "../../utils/html.js";

/**
 * @implements {IComponentModel}
 */
export class Notification extends IComponentModel {
    #listId;

    constructor() {
        super();
        this.#listId = "notification-list-ul";
        this.init();
    }

    buildTemplate() {
        const template = html`
            <li class="list-group-item"></li>
        `;

        const list = document.getElementById(this.#listId);
        list.appendChild(template);
    }

    bindEvents() {

    }

}