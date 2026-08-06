import { FolderManager } from "../components/folder/folder.js";

export function FolderPage() {
    queueMicrotask(() => {
        new FolderManager("#app-main-context");
    });

    return `<section class="folder-page"><p class="folder-page__subtitle">Carregando arquivos…</p></section>`;
}
