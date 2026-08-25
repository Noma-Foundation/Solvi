import $ from "jquery";

import { IComponentModel } from "../../../framework/interfaces/component-model.js";
import { CustomerControlPanel } from "../customer-control-panel/customer-control-panel.js";
import { CustomerDetailPanel } from "../customer-detail-panel/customer-detail-panel.js";

import "./customer.css";

/**
 * Customer management page. Hosts the control panel (client list + add flow)
 * and the detail panel (selected client's data + edit/delete flow) as
 * independent components that communicate over the event bus.
 *
 * @extends IComponentModel
 */
export class CustomerPageComponent extends IComponentModel {
    /**
     * @constructs {CustomerPageComponent}
     * @param {String} [rootSelector="#app-main-context"] - Selector of the element this component is rendered into.
     */
    constructor(rootSelector = "#app-main-context") {
        super();
        this.context = rootSelector;
        this.init();
    }

    /**
     * Builds the page shell (two mount points laid out side by side) and
     * instantiates the control panel and detail panel components into them.
     * Called once by {@link IComponentModel#init}.
     */
    buildTemplate() {
        this.template = /* html */ `
            <section class="customer-page d-flex h-100 w-100">
                <div id="customer-control-panel-context" style="display: contents;"></div>
                <div id="customer-detail-panel-context" style="display: contents;"></div>
            </section>
        `;

        $(this.context).html(this.template);

        new CustomerControlPanel("#customer-control-panel-context");
        new CustomerDetailPanel("#customer-detail-panel-context");
    }

    bindEvents() { }

}
