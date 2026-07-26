import $ from "jquery";
import { IComponentModel } from "../component-model.js";

import { MenuBar } from "../menu-bar/menu-bar.js";
import { SearchBar } from "../search-bar/search-bar.js";
import { eventBus } from "../../event-manager-singleton.js";

import { AuthLogin } from "../../../wailsjs/go/internal/OrderHub.js";

import "./login-page.css";

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
        $(this.#formId).on("submit", (e) => {
            e.preventDefault();
            const isAdmin = this.#fakeLoginValidatorForAdmin();

            if (isAdmin) {
                console.log("Login administrativo realizado com sucesso");
                this.#isLogged = true;

                eventBus.subscribe("admin-login", () => {
                    const menuBar = new MenuBar();
                    const searchBar = new SearchBar();
                    $(this.#formId).hide();
                });

                return "admin"
            }
            const isEmployee = this.#fakeLoginValidatorForNormalEmployee();

            if (isEmployee) {
                console.log("Login normal realizado com sucesso");
                this.#isLogged = true;
                return "normal"
            } else {
                console.log("Credenciais inválidas");
                $("#error-message").show();
                return null;
            }
        });
    }

    getIsLogged() {
        return this.#isLogged;
    }

    #fakeLoginValidatorForAdmin() {
        if (this.#userAccessObject.val() !== this.#defineUserAccess || this.#userPasswordObject.val() !== this.#defineUserPassword) {
            return false;
        }
        $("#error-message").hide();
        return true;
    }

    #fakeLoginValidatorForNormalEmployee() {
        const employee = AuthLogin($(this.#userAccessObject).val());

        console.log(employee);
        // Validate credentials and generate JWT token later
        const validateFunction = async (employee) => {
            if (employee == false) {
                return false;
            }
        }
        return true;
    }

}