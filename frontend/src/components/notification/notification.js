import { IComponentModel } from "../component-model.js";
import { html } from "../../utils/html.js";

/**
 * @implements {IComponentModel}
 */
export class NotificationObject extends IComponentModel {
    #listId;

    constructor() {
        super();
        this.#listId = "notification-list-ul";
        this.init();
    }

    buildTemplate() {
    }

    bindEvents() {

    }

    template() {
        return html`
            <li class="list-group-item"></li>
        `;
    }

}