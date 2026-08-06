import $ from "jquery";

import { html } from "../../utils/html.js";

import { IComponentModel } from "../component-model.js";

import settingIcon from "../../assets/icons/setting/setting.svg";

export class Setting extends IComponentModel {
    #headerId;

    constructor() {
        super();
        this.#headerId = "#app-header";
        this.init();
    }

    buildTemplate() {
        const template = html`
            <button id="setting-btn" class="btn btn-primary">
                <img src="${settingIcon}" alt="Setting Button" tabindex="0" />
            </button>
        `;

        $(this.#headerId).append(template);
    }

    bindEvents() {

    }

}