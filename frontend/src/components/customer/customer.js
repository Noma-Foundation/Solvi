import $ from "jquery";

import { IComponentModel } from "../component-model.js";

import "./customer.css";


export class CustomerPageComponent extends IComponentModel { 

    constructor() { 
        super();
        this.context = "#main-context";
        this.init();
    }

    buildTemplate() {
        this.template = /* html */ `
            <div>
                <h1>Hello, World!</h1>
            </div>
        `;

        $(this.context).html(this.template);
    }

    bindEvents() { 

    }

}