import $ from "jquery";

import { html } from "../../utils/html.js";
import { IComponentModel } from "../component-model.js";
import { eventBus } from "../../event-manager-singleton.js";
import {
    apiAvailable,
    escapeHtml,
    formatBytes,
    parseApiResult,
} from "../../utils/api-helpers.js";

import "./folder.css";

function fileKind(name) {
    const ext = (name || "").split(".").pop()?.toLowerCase() || "";
    if (["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext)) return "image";
    if (ext === "pdf") return "pdf";
    if (["doc", "docx"].includes(ext)) return "word";
    if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
    if (["ppt", "pptx"].includes(ext)) return "powerpoint";
    if (["txt", "md", "log", "json"].includes(ext)) return "text";
    return "other";
}

const KIND_LABEL = {
    folder: "Pasta",
    image: "Imagem",
    pdf: "PDF",
    word: "Word",
    excel: "Excel",
    powerpoint: "PowerPoint",
    text: "Texto",
    other: "Arquivo",
};

/**
 * Virtual file explorer with OS open/import.
 * @implements {IComponentModel}
 */
export class FolderManager extends IComponentModel {
    #rootSelector;
    #items = [];
    #currentFolderId = null;
    #viewMode = "list";
    #search = "";
    #sort = "name";
    #contextItemId = null;

    constructor(rootSelector = "#app-main-context") {
        super();
        this.#rootSelector = rootSelector;
        this.init();
    }

    buildTemplate() {
        const template = html`
            <section class="folder-page">
                <div class="folder-page__header">
                    <div>
                        <h1 class="folder-page__title">Arquivos</h1>
                        <p class="folder-page__subtitle">Organize documentos relacionados ao sistema.</p>
                    </div>
                    <div class="folder-page__actions">
                        <button type="button" class="btn btn-outline-secondary btn-sm" id="folder-new">Nova pasta</button>
                        <button type="button" class="btn btn-primary btn-sm" id="folder-import">Importar arquivo</button>
                    </div>
                </div>

                <div id="folder-api-unavailable" class="solvi-unavailable">
                    API indisponível. Abra o app via Solvi (pywebview).
                </div>

                <nav id="folder-breadcrumb" class="folder-breadcrumb" aria-label="Navegação"></nav>

                <div class="folder-page__toolbar">
                    <input type="search" id="folder-search" class="form-control" placeholder="Pesquisar por nome…">
                    <select id="folder-sort" class="form-select">
                        <option value="name">Nome</option>
                        <option value="date">Data</option>
                        <option value="size">Tamanho</option>
                    </select>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-outline-secondary btn-sm is-active" id="folder-view-list">Lista</button>
                        <button type="button" class="btn btn-outline-secondary btn-sm" id="folder-view-grid">Grade</button>
                    </div>
                </div>

                <div id="folder-content" class="folder-content folder-content--list"></div>

                <div id="folder-context" class="folder-context" hidden>
                    <button type="button" data-ctx="open">Abrir</button>
                    <button type="button" data-ctx="rename">Renomear</button>
                    <button type="button" data-ctx="delete">Excluir</button>
                    <button type="button" data-ctx="props">Propriedades</button>
                </div>

                <div id="folder-props-modal" class="folder-modal" hidden>
                    <div class="folder-modal__dialog">
                        <div class="folder-modal__header">
                            <h3>Propriedades</h3>
                            <button type="button" class="btn-close" id="folder-props-close"></button>
                        </div>
                        <div id="folder-props-body"></div>
                    </div>
                </div>
            </section>
        `;
        $(this.#rootSelector).html(template);
    }

    bindEvents() {
        $("#folder-new").on("click", () => this.#createFolder());
        $("#folder-import").on("click", () => this.#importFiles());
        $("#folder-search").on("input", (e) => {
            this.#search = e.target.value.toString().toLowerCase();
            this.#render();
        });
        $("#folder-sort").on("change", (e) => {
            this.#sort = e.target.value;
            this.#render();
        });
        $("#folder-view-list").on("click", () => this.#setView("list"));
        $("#folder-view-grid").on("click", () => this.#setView("grid"));

        $("#folder-content").on("dblclick", "[data-item-id]", (e) => {
            const id = $(e.currentTarget).attr("data-item-id");
            this.#openItem(id);
        });
        $("#folder-content").on("click", "[data-item-id]", (e) => {
            $("#folder-content [data-item-id]").removeClass("is-selected");
            $(e.currentTarget).addClass("is-selected");
        });
        $("#folder-content").on("contextmenu", "[data-item-id]", (e) => {
            e.preventDefault();
            this.#contextItemId = $(e.currentTarget).attr("data-item-id");
            this.#showContext(e.clientX, e.clientY);
        });

        $("#folder-breadcrumb").on("click", "[data-folder-nav]", (e) => {
            const id = $(e.currentTarget).attr("data-folder-nav");
            this.#currentFolderId = id === "root" ? null : id;
            this.#render();
        });

        $("#folder-context").on("click", "[data-ctx]", async (e) => {
            e.stopPropagation();
            const action = $(e.currentTarget).attr("data-ctx");
            const id = this.#contextItemId;
            this.#hideContext();
            if (!id) return;
            if (action === "open") await this.#openItem(id);
            if (action === "rename") await this.#renameItem(id);
            if (action === "delete") await this.#deleteItem(id);
            if (action === "props") await this.#showProps(id);
        });

        $("#folder-context").on("click", (e) => e.stopPropagation());
        $(document).on("click.folderContext", () => this.#hideContext());
        $("#folder-props-close").on("click", () => $("#folder-props-modal").prop("hidden", true));
        $("#folder-props-modal").on("click", (e) => {
            if (e.target.id === "folder-props-modal") $("#folder-props-modal").prop("hidden", true);
        });

        this.#load();
    }

    async #load() {
        if (!apiAvailable()) {
            $("#folder-api-unavailable").addClass("is-visible");
            this.#items = [];
            this.#render();
            return;
        }
        try {
            const raw = await window.pywebview.api.get_folder_tree();
            const items = parseApiResult(raw);
            this.#items = Array.isArray(items) ? items : [];
            this.#render();
        } catch {
            $("#folder-api-unavailable").addClass("is-visible");
            this.#items = [];
            this.#render();
        }
    }

    #setView(mode) {
        this.#viewMode = mode;
        $("#folder-view-list").toggleClass("is-active", mode === "list");
        $("#folder-view-grid").toggleClass("is-active", mode === "grid");
        $("#folder-content")
            .toggleClass("folder-content--list", mode === "list")
            .toggleClass("folder-content--grid", mode === "grid");
        this.#render();
    }

    #childrenOf(parentId) {
        const pid = parentId || null;
        return this.#items.filter((i) => (i.parentId || null) === pid);
    }

    #getItem(id) {
        return this.#items.find((i) => i.id === id);
    }

    #breadcrumb() {
        const crumbs = [{ id: "root", name: "Início" }];
        if (!this.#currentFolderId) return crumbs;
        const chain = [];
        let current = this.#getItem(this.#currentFolderId);
        while (current) {
            chain.unshift(current);
            current = current.parentId ? this.#getItem(current.parentId) : null;
        }
        return crumbs.concat(chain.map((c) => ({ id: c.id, name: c.name })));
    }

    #visibleItems() {
        let list = this.#childrenOf(this.#currentFolderId);
        if (this.#search) {
            list = list.filter((i) => (i.name || "").toLowerCase().includes(this.#search));
        }
        list.sort((a, b) => {
            if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
            if (this.#sort === "size") return (Number(b.size) || 0) - (Number(a.size) || 0);
            if (this.#sort === "date") return (b.modifiedAt || "").localeCompare(a.modifiedAt || "");
            return (a.name || "").localeCompare(b.name || "", "pt-BR", { sensitivity: "base" });
        });
        return list;
    }

    #render() {
        const crumbs = this.#breadcrumb();
        $("#folder-breadcrumb").html(crumbs.map((c, idx) => {
            const isLast = idx === crumbs.length - 1;
            if (isLast) return `<span class="folder-breadcrumb__current">${escapeHtml(c.name)}</span>`;
            return `<button type="button" class="folder-breadcrumb__link" data-folder-nav="${escapeHtml(c.id)}">${escapeHtml(c.name)}</button><span class="folder-breadcrumb__sep">/</span>`;
        }).join(""));

        const items = this.#visibleItems();
        const $content = $("#folder-content");
        if (!items.length) {
            $content.html(`<div class="solvi-empty">Pasta vazia.</div>`);
            return;
        }

        if (this.#viewMode === "grid") {
            $content.html(items.map((item) => this.#gridCard(item)).join(""));
        } else {
            $content.html(`
                <div class="folder-list-header">
                    <span>Nome</span><span>Tamanho</span><span>Modificado</span>
                </div>
                ${items.map((item) => this.#listRow(item)).join("")}
            `);
        }
    }

    #iconClass(item) {
        if (item.type === "folder") return "kind-folder";
        return `kind-${fileKind(item.name)}`;
    }

    #listRow(item) {
        const kind = item.type === "folder" ? "folder" : fileKind(item.name);
        return html`
            <div class="folder-row" data-item-id="${escapeHtml(item.id)}" tabindex="0">
                <span class="folder-row__name">
                    <span class="folder-icon ${this.#iconClass(item)}" title="${KIND_LABEL[kind]}"></span>
                    ${escapeHtml(item.name)}
                </span>
                <span>${item.type === "folder" ? "—" : formatBytes(item.size)}</span>
                <span>${escapeHtml((item.modifiedAt || "").slice(0, 19).replace("T", " "))}</span>
            </div>
        `;
    }

    #gridCard(item) {
        const kind = item.type === "folder" ? "folder" : fileKind(item.name);
        return html`
            <div class="folder-card" data-item-id="${escapeHtml(item.id)}" tabindex="0">
                <span class="folder-icon folder-icon--lg ${this.#iconClass(item)}" title="${KIND_LABEL[kind]}"></span>
                <span class="folder-card__name">${escapeHtml(item.name)}</span>
                <span class="folder-card__meta">${item.type === "folder" ? "Pasta" : formatBytes(item.size)}</span>
            </div>
        `;
    }

    #showContext(x, y) {
        const $ctx = $("#folder-context");
        $ctx.css({ left: `${x}px`, top: `${y}px` }).prop("hidden", false);
    }

    #hideContext() {
        $("#folder-context").prop("hidden", true);
        this.#contextItemId = null;
    }

    async #createFolder() {
        if (!apiAvailable()) return;
        const name = prompt("Nome da pasta:");
        if (!name?.trim()) return;
        try {
            const raw = await window.pywebview.api.create_folder(
                name.trim(),
                this.#currentFolderId || ""
            );
            const result = parseApiResult(raw);
            if (result?.error) {
                alert(result.error);
                return;
            }
            await this.#load();
        } catch {
            eventBus.publishAsync("system:error", { message: "Erro ao criar pasta." });
        }
    }

    async #importFiles() {
        if (!apiAvailable()) return;
        try {
            const raw = await window.pywebview.api.import_files(this.#currentFolderId || "");
            const result = parseApiResult(raw);
            if (result?.error) {
                alert(result.error);
                return;
            }
            await this.#load();
        } catch {
            eventBus.publishAsync("system:error", { message: "Erro ao importar arquivos." });
        }
    }

    async #openItem(id) {
        const item = this.#getItem(id);
        if (!item) return;
        if (item.type === "folder") {
            this.#currentFolderId = id;
            this.#render();
            return;
        }
        if (!apiAvailable()) return;
        try {
            const raw = await window.pywebview.api.open_path(id);
            const result = parseApiResult(raw);
            if (result?.ok === false) alert(result.error || "Não foi possível abrir.");
        } catch {
            eventBus.publishAsync("system:error", { message: "Erro ao abrir arquivo." });
        }
    }

    async #renameItem(id) {
        const item = this.#getItem(id);
        if (!item || !apiAvailable()) return;
        const name = prompt("Novo nome:", item.name);
        if (!name?.trim()) return;
        try {
            const raw = await window.pywebview.api.rename_folder_item(id, name.trim());
            const result = parseApiResult(raw);
            if (result?.error) {
                alert(result.error);
                return;
            }
            await this.#load();
        } catch {
            eventBus.publishAsync("system:error", { message: "Erro ao renomear." });
        }
    }

    async #deleteItem(id) {
        if (!apiAvailable()) return;
        if (!confirm("Excluir este item? Pastas removem o conteúdo virtual.")) return;
        try {
            const raw = await window.pywebview.api.delete_folder_item(id);
            const result = parseApiResult(raw);
            if (result?.ok === false) {
                alert(result.error || "Falha ao excluir.");
                return;
            }
            if (this.#currentFolderId === id) this.#currentFolderId = null;
            await this.#load();
        } catch {
            eventBus.publishAsync("system:error", { message: "Erro ao excluir." });
        }
    }

    async #showProps(id) {
        if (!apiAvailable()) return;
        try {
            const raw = await window.pywebview.api.get_item_properties(id);
            const item = parseApiResult(raw);
            if (!item || item.error) {
                alert(item?.error || "Item não encontrado.");
                return;
            }
            const kind = item.type === "folder" ? "folder" : fileKind(item.name);
            $("#folder-props-body").html(html`
                <p><strong>Nome:</strong> ${escapeHtml(item.name)}</p>
                <p><strong>Tipo:</strong> ${escapeHtml(KIND_LABEL[kind] || item.type)}</p>
                <p><strong>Tamanho:</strong> ${item.type === "folder" ? "—" : formatBytes(item.size)}</p>
                <p><strong>Modificado:</strong> ${escapeHtml(item.modifiedAt || "—")}</p>
                <p><strong>Caminho:</strong> ${escapeHtml(item.path || "—")}</p>
            `);
            $("#folder-props-modal").prop("hidden", false);
        } catch {
            eventBus.publishAsync("system:error", { message: "Erro ao carregar propriedades." });
        }
    }
}
