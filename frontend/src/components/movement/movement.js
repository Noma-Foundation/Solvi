import $ from "jquery";

import { IComponentModel } from "../../../framework/interfaces/component-model.js";

import "./movement.css";

export class InboxComponentPage extends IComponentModel {
    #rootSelector;

    constructor(rootSelector = "#app-main-context") {
        super();
        this.context = rootSelector;
        this.init();
    }

    buildTemplate() {
        this.template = /* html */ `
            <header class="container-fluid p-3">
                <h3>Movement</h3>
            </header>
        `;

        $(this.context).html(this.template);
    }

    bindEvents() {

    }
}
