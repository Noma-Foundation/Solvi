import $ from "jquery";

import { IComponentModel } from "../../../framework/interfaces/component-model.js";

import searchIcon from "../../assets/search_icon.svg";

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
            <div class="container-fluid">
                <header class="p-3 pb-2">
                    <h3 class="mb-1">Movement</h3>
                    <p class="text-secondary mb-0">Create and organize your business's income and expense figures.</p>
                </header>

                <section class="px-3 pb-3">
                    <div class="d-flex align-items-center gap-3 flex-wrap">
                        <div class="input-group search-input" style="max-width: 280px;">
                            <button class="btn btn-outline-secondary" type="button">
                                <img src="${searchIcon}" alt="Search" width="16" height="16">
                            </button>
                            <input type="text" class="form-control" placeholder="Pesquisar..." aria-label="Search movement...">
                        </div>

                        <button class="btn btn-primary btn-new-budget ms-auto" id="add-movement">New Movement</button>
                    </div>
                </section>
            </div>
        `;

        $(this.context).html(this.template);
    }

    bindEvents() {

    }
}
