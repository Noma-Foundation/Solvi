import $ from "jquery";

import { MenuBar } from "../components/menu-bar/menu-bar.js";
import { SearchBar } from "../components/search-bar/search-bar.js";
import { Setting } from "../components/setting/setting.js";

import { HomePage } from "../views/home-page.js";
import { NotificationPage } from "../views/notification-page.js";
import { FolderPage } from "../views/folder-page.js";
import { CustomerPage } from "../views/customer-page.js";
import { InboxPage } from "../views/inbox-page.js";
import { CalendarPage } from "../views/calendar-page.js";

/**
 * ContextManager centralizes view registration and rendering for the application.
 * It is responsible for creating layout components (MenuBar, SearchBar) once and
 * rendering registered views inside the main application context (#app-main-context).
 */
class ContextManager {
    constructor() {
        this.contextSelector = "#app-main-context";
        this._views = new Map();
        this._current = null;

        // layout components created once
        this._menuBar = null;
        this._searchBar = null;
        this._setting = null;

        // register default views
        this.register("home", (params) => HomePage(params));
        this.register("notification", (params) => NotificationPage(params));
        this.register("folder", (params) => FolderPage(params));
        this.register("customer", (params) => CustomerPage(params));
        this.register("inbox", (params) => InboxPage(params));
        this.register("calendar", (params) => CalendarPage(params));

        console.log('[ContextManager] initialized, registered views:', Array.from(this._views.keys()));
    }

    /**
     * Register a view renderer under a name.
     * @param {string} name
     * @param {Function} renderer - function(params) that returns HTML/template
     */
    register(name, renderer) {
        if (typeof name !== "string" || typeof renderer !== "function") {
            throw new Error("Invalid view registration");
        }
        this._views.set(name, renderer);
        console.log('[ContextManager] registered view:', name);
    }

    /**
     * Show a registered view inside the main context.
     * If needed, ensures layout components are created once.
     * @param {string} name
     * @param {object} [params={}]
     */
    show(name, params = {}) {
        console.log('[ContextManager] show called for:', name, 'params:', params, 'current:', this._current);
        const renderer = this._views.get(name);
        if (!renderer) {
            console.warn(`ContextManager: view '${name}' not registered.`);
            return;
        }

        // ensure layout components exist (MenuBar appends into #main-menu-bar; SearchBar into #app-header)
        if (!this._menuBar) {
            this._menuBar = new MenuBar();
            console.log('[ContextManager] MenuBar created');
        }
        if (!this._searchBar) {
            this._searchBar = new SearchBar();
            console.log('[ContextManager] SearchBar created');
        }
        if (!this._setting) {
            this._setting = new Setting();
            console.log('[ContextManager] Setting created');
        }

        const content = renderer(params);
        $(this.contextSelector).html(content);
        this._current = name;
        console.log('[ContextManager] view rendered:', name);
    }

    /**
     * Get current active view name
     * @returns {string|null}
     */
    getCurrent() {
        return this._current;
    }

    /**
     * Clear current view content and optionally remove layout components.
     * @param {boolean} [removeLayout=false]
     */
    clear(removeLayout = false) {
        $(this.contextSelector).empty();
        this._current = null;
        if (removeLayout) {
            $("#main-menu-bar").empty();
            $("#app-header").empty();
            this._menuBar = null;
            this._searchBar = null;
            console.log('[ContextManager] layout removed');
        }
    }
}

export const contextManager = new ContextManager();
