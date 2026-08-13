import $ from "jquery";

import { IComponentModel } from "../component-model.js";

import searchIcon from "../../assets/icons/search/search.svg"

import { html } from "../../utils/html.js";

export class SearchBar extends IComponentModel {
    #headerId;

    constructor() {
        super();
        this.#headerId = "#app-header";
        this.init();
    }

    buildTemplate() {
        const searchBarTemplate = html`
            <div class="search-bar container p-0">
                <input type="text" name="searchBar" id="search-bar-input" aria-label="Search"
                    placeholder="Search a ticket, folder or budget" tabindex="0">
                <img src="${searchIcon}" alt="Search Button" role="button" tabindex="0" loading="lazy">
            </div>
        `;
        $(this.#headerId).append(searchBarTemplate);
    }

    bindEvents() {
    }

}
