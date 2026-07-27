import $ from "jquery";
import { IComponentModel } from "../component-model.js";
import { MenuBar } from "../menu-bar/menu-bar.js";
import { SearchBar } from "../search-bar/search-bar.js";
import { Home } from "../../views/home-page.js";

import { eventBus } from "../../event-manager-singleton.js";

import "./login-page.css";

import { AuthLogin } from "../../../wailsjs/go/internal/OrderHub.js";
import { LogError, LogInfo } from "../../../wailsjs/runtime/runtime.js";

export class LoginPage extends IComponentModel {
    #context;
    #errorMessage;
    #defineUserAccess;
    #defineUserPassword;

    #formId;
    #registerButtonId;
    #errorMessageId;
    #userAccessObject;
    #userPasswordObject;

    #isLogged;

    constructor(context) {
        super();
        this.#context = context;
        this.#errorMessage = "Credenciais inválidas";
        this.#defineUserAccess = "support";
        this.#defineUserPassword = "support";
        this.#isLogged = false;

        this.#formId = "#app-login-form";
        this.#registerButtonId = "#register-btn";
        this.#errorMessageId = "#error-message";
        this.init();
    }

    buildTemplate() {
        this.template = `
        <form id="${this.#formId.replace("#", "")}">
            <div class="container-fluid m-0 p-3 bg-light">
                <div class="form-group d-flex flex-column gap-2">
                    <input type="text" name="userAccess" id="user-access" placeholder="Username or email..." required>
                    <input type="password" name="userPassword" id="user-password" placeholder="Password..." required>
                </div>
                <div class="form-group d-flex flex-row gap-2 mt-2">
                    <button id="login-btn" class="btn btn-primary w-50" type="submit">Login</button>
                    <button id="${this.#registerButtonId.replace("#", "")}" class="btn btn-secondary w-50" type="button">Register</button>
                </div>
                <p id="${this.#errorMessageId.replace("#", "")}" class="text-danger mt-2" style="display: none; margin: 0 auto;">${this.#errorMessage}</p>
            </div>
        </form>
        `;

        $(this.#context).html(this.template);
        this.#userAccessObject = $(this.#formId).find("#user-access");
        this.#userPasswordObject = $(this.#formId).find("#user-password");
    }

    bindEvents() {
        $(this.#formId).on("submit", async (e) => {
            e.preventDefault();

            const isAdmin = this.#loginForSupportAdmins();

            if (isAdmin) {
                this.#isLogged = true;
                this.#hideError();
                $(this.#formId).hide();

                eventBus.subscribe("append-components-support", () => {
                    LogInfo("Enter in Support mode");
                });
                return;
            }

            const isEmployee = await this.#loginValidatorForUser();

            if (isEmployee) {
                this.#isLogged = true;
                this.#hideError();
                $(this.#formId).hide();

                eventBus.subscribe("append-components-employee", () => {
                    const menuBar = new MenuBar();
                    const searchBar = new SearchBar();

                    const context = $(this.#context);
                    context.html(Home());
                });

                return;
            }

            this.#showError();
        });
    }

    getIsLogged() {
        return this.#isLogged;
    }

    #loginForSupportAdmins() {
        const user = this.#userAccessObject.val();
        const pass = this.#userPasswordObject.val();

        if (user === this.#defineUserAccess && pass === this.#defineUserPassword) {
            return true;
        }
        return false;
    }

    async #loginValidatorForUser() {
        const user = this.#userAccessObject.val();
        const password = this.#userPasswordObject.val();

        try {
            const isValid = await AuthLogin(user, password);

            if (isValid) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            LogError("Error validating employee (Backend Error): " + error);
            return false;
        }
    }

    #showError() {
        $(this.#context).find(this.#errorMessageId).show();
    }

    #hideError() {
        $(this.#context).find(this.#errorMessageId).hide();
    }
}