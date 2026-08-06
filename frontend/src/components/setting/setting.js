import $ from "jquery";

import { html } from "../../utils/html.js";

import { IComponentModel } from "../component-model.js";


export class Setting extends IComponentModel {
    #headerId;

    constructor() {
        super();
        this.#headerId = "#app-header";
        this.init();
    }

    buildTemplate() {
        const template = html`
            <button>Setting</button>
        `;

        $(this.#headerId).append(template);
    }

    bindEvents() {

    }

}