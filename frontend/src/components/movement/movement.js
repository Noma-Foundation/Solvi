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
            <div class="container">
                <header class="container-fluid p-3">
                    <h3>Valores de entrada</h3>
                    <p>Crie e organize valores de entrada e saída de seu negócio.</p>
                </header>
                <section>
                    <div class="container">
                        <input type="search" placeholder="Pesquise aqui...">
                        <input type="date" placeholder="Data (Recente)">
                        <button class="btn btn-primary">Novo Orçamento</button>
                    </div>
                </section>
            </div>
        `;

        $(this.context).html(this.template);
    }

    bindEvents() {

    }
}
