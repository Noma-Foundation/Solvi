import $ from "jquery";

import { IComponentModel } from "../../../framework/interfaces/component-model.js";


export class DashboardComponent extends IComponentModel {

    constructor() { 
        super();
        this.init();
    }

    buildTemplate() { 
        this.template = /* html */ `
            <div class="dashboard-component">
                <h2>Dashboard</h2>
            </div>
        `;

        $(".dashboard-page").html(this.template);
    }

    bindEvents() { 
    }

}