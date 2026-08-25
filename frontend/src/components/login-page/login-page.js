import $ from "jquery";
import { IComponentModel } from "../../../framework/interfaces/component-model.js";
import { eventBus } from "../../event-manager-singleton.js";
import { setButtonLoading } from "../../utils/loading-state.js";

import "./login-page.css";


export class LoginPage extends IComponentModel {
    #errorMessage;

    #formId;
    #registerButtonId;
    #errorMessageId;
    
    #userAccessObject;
    #userPasswordObject;

    constructor(context) {
        super();
        this.context = context;
        this.#errorMessage = "Invalid credentials";

        this.#formId = "#app-login-form";
        this.#registerButtonId = "#register-btn";
        this.#errorMessageId = "#error-message";
        this.init();
    }

    buildTemplate() {
        this.template = /* html */ `
        <div class="d-flex flex-column justify-content-center align-items-center w-100 h-100">
            <form id="${this.#formId.replace("#", "")}"
                  class="d-flex flex-column align-items-center gap-3 w-25">
                <div class="container-fluid m-0 p-3 bg-light rounded shadow-sm d-flex flex-column gap-2 w-100">
                    <div class="form-group d-flex flex-column gap-2">
                        <input type="text" name="userAccess" id="user-access" placeholder="Username or email..." required>
                        <input type="password" name="userPassword" id="user-password" placeholder="Password..." required>
                    </div>
                    <div class="form-group d-flex flex-row gap-2 mt-2">
                        <button id="login-btn" class="btn btn-primary w-50" type="submit">Login</button>
                        <button id="${this.#registerButtonId.replace("#", "")}" class="btn btn-secondary w-50" type="button">Register</button>
                    </div>
                    <p id="${this.#errorMessageId.replace("#", "")}" class="text-danger mt-2 text-center w-100" style="display: none;">${this.#errorMessage}</p>
                </div>
            </form>
        </div>
        `;

        $(this.context).html(this.template);
        this.#userAccessObject = $(this.#formId).find("#user-access");
        this.#userPasswordObject = $(this.#formId).find("#user-password");
    }

    bindEvents() {
        $(this.#formId).on("submit", async (e) => {
            e.preventDefault();

            const $loginBtn = $("#login-btn");
            setButtonLoading($loginBtn, true);

            const isUser = await this.#loginValidatorForUser();

            if (isUser) {
                this.#hideError();
                $(this.#formId).hide();

                // notify that authentication succeeded for regular employee
                eventBus.publishAsync("auth:success", { role: "employee" });

                return;
            }

            setButtonLoading($loginBtn, false);
            this.#showError();
        });
    }

    async #loginValidatorForUser() {
        const user = this.#userAccessObject.val();
        const password = this.#userPasswordObject.val();

        try {
            const isValid = await window.pywebview.api.auth_user(user, password);

            if (isValid) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    #showError() {
        $(this.context).find(this.#errorMessageId).show();
    }

    #hideError() {
        $(this.context).find(this.#errorMessageId).hide();
    }

}
