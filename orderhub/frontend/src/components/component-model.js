
export class ComponentModel {
    constructor() {
    }

    init() {
        this.buildTemplate();
        this.bindEvents();
    }

    buildTemplate() {
        throw new Error("You must implement the buildTemplate method.");
    }

    bindEvents() {
        throw new Error("You must implement the bindEvents method.");
    }
}
