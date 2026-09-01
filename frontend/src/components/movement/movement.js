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

                <section class="px-3 pb-3 py-2">
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

            ${this.#movementCard()}
        `;

        $(this.context).html(this.template);
    }

    bindEvents() {

    }

    #movementCard() {
        return /* html */ `
            <div class="px-3 pb-3 py-2" id="card-list">
                <section class="movement-card" aria-label="Movement 0001">
                    <!-- Left: identity + financial info -->
                    <div class="d-flex flex-column gap-2">
                        <div>
                            <div class="d-flex align-items-center gap-2">
                                <span class="movement-card__id">0001</span>
                                <span class="status-label">Pendente</span>
                            </div>
                            <p class="mb-0 text-wrap">
                                Orçamento 1 <span class="movement-card__location">· SP</span>
                            </p>
                        </div>

                        <div>
                            <p class="movement-card__price mb-0">R$ <span>0,00</span></p>
                            <p class="movement-card__meta">
                                ICMS R$0,00 · Atualizado
                                <time datetime="2026-08-18">2026-08-18</time>
                            </p>
                        </div>
                    </div>

                    <!-- Right: actions -->
                    <div class="d-flex flex-column gap-2">
                        <button class="btn btn-outline-secondary btn-sm">Editar</button>
                        <button class="btn btn-outline-danger btn-sm">Excluir</button>
                    </div>
                </section>
            </div>
        `;
    }
}
