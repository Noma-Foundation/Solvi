import $ from "jquery";

import { html } from "../../utils/html.js";

import { IComponentModel } from "../component-model.js";

import settingIcon from "../../assets/icons/setting/setting.svg";

import "./setting.css";

export class Setting extends IComponentModel {
    #headerId;

    constructor() {
        super();
        this.#headerId = "#app-header";
        this.init();
    }

    buildTemplate() {
        const template = html`
            <button id="setting-btn" class="btn">
                <img src="${settingIcon}" alt="Setting" />
            </button>
        `;

        $(this.#headerId).append(template);
    }

    bindEvents() {

    }

}