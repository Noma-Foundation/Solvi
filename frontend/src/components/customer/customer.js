import $ from "jquery";

import { IComponentModel } from "../component-model.js";

import "./customer.css";


export class CustomerPageComponent extends IComponentModel {
    #rootSelector;

    constructor(rootSelector = "#app-main-context") {
        super();
        this.context = rootSelector;
        this.init();
    }

    buildTemplate() {
        this.template = /* html */ `
            <section class="customer-page">
                <h1>Clientes</h1>
            </section>
        `;

        $(this.context).html(this.template);
    }

    bindEvents() { 

    }

}