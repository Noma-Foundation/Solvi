import $ from "jquery";
import { IComponentModel } from "../component-model.js";

import "./login-page.css";

export class LoginPage extends IComponentModel {
    #context;
    #errorMessage;

    constructor(context) {
        super();
        this.#context = context;
        this.#errorMessage = "Credenciais inválidas";
        this.init();
    }

    buildTemplate() {
        this.template = `
        <form id="app-login-form">
            <div class="container-fluid m-0 p-3 bg-light">
                <div class="form-group d-flex flex-column gap-2">
                    <input type="text" name="userAccess" id="user-access" placeholder="Username or email..." required>
                    <input type="password" name="userPassword" id="user-password" placeholder="Password..." required>
                </div>
                <div class="form-group d-flex flex-row gap-2 mt-2">
                    <button id="login-btn" class="btn btn-primary w-50" type="submit">Login</button>
                    <button id="register-btn" class="btn btn-secondary w-50" type="button">Register</button>
                </div>
                <p id="error-message" class="text-danger mt-2" style="display: none; margin: 0 auto;">${this.#errorMessage}</p>
            </div>
        </form>
        `;

        $(this.#context).html(this.template);
    }

    bindEvents() {
    }

}