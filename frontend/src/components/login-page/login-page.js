import $ from "jquery";
import { IComponentModel } from "../component-model.js";

import "./login-page.css";

export class LoginPage extends IComponentModel {
    #context;
    #errorMessage;
    #formId;
    #registerButtonId;

    #defineUserAccess;
    #defineUserPassword;

    #isLogged;

    constructor(context) {
        super();
        this.#context = context;
        this.#errorMessage = "Credenciais inválidas";
        this.#formId = "#app-login-form";
        this.#registerButtonId = "#register-btn";
        this.#isLogged = false;
        this.#defineUserAccess = "admin";
        this.#defineUserPassword = "admin";
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
        $(this.#formId).on("submit", (e) => {
            e.preventDefault();
            const isAdmin = this.#fakeLoginValidatorForAdmin();

            if (isAdmin) {
                console.log("Login administrativo realizado com sucesso");
                this.#isLogged = true;
                return "admin"
            } else {
                const isEmployee = this.#fakeLoginValidatorForNormalEmployee();

                if (isEmployee) {
                    console.log("Login normal realizado com sucesso");
                    this.#isLogged = true;
                    return "normal"
                } else {
                    console.log("Credenciais inválidas");
                    return null;
                }
            }
        });
    }

    #fakeLoginValidatorForAdmin() {
        const inputUserAccess = $(this.#formId).find("#user-access").val();
        const inputUserPassword = $(this.#formId).find("#user-password").val();

        if (inputUserAccess !== this.#defineUserAccess || inputUserPassword !== this.#defineUserPassword) {
            console.log("Credenciais inválidas");
            return false;
        }

        $(this.#formId).find("#user-access").val("");
        $(this.#formId).find("#user-password").val("");
        return true;
    }

    #fakeLoginValidatorForNormalEmployee() {
        const inputUserAccess = $(this.#formId).find("#user-access").val();
        const inputUserPassword = $(this.#formId).find("#user-password").val();

        // Validate credentials and generate JWT token

        $(this.#formId).find("#user-access").val("");
        $(this.#formId).find("#user-password").val("");
        return true;
    }
}