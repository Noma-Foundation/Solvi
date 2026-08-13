import $ from "jquery";

import { IComponentModel } from "../component-model.js";

import settingIcon from "../../assets/icons/setting/setting.svg";

export class Setting extends IComponentModel {
    #headerId;

    constructor() {
        super();
        this.context = "#app-header";
        this.init();
    }

    buildTemplate() {
        this.template = `
            <button id="setting-btn">
                <img src="${settingIcon}" alt="Setting Button" />
            </button>
        `;

        $(this.context).append(this.template);
    }

    bindEvents() {
        const window_width = 680;
        const window_height = 570;
        
        $("#setting-btn").on("click", () => { 
            window.pywebview.api.create_window_setting("Setting", window_width, window_height); 
        }); 
    }

}