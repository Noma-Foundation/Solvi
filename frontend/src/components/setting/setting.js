import $ from "jquery";

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
        const template = `
            <button id="setting-btn">
                <img src="${settingIcon}" alt="Setting Button" />
            </button>
        `;

        $(this.#headerId).append(template);
    }

    bindEvents() {

    }

}