import { IComponentModel } from "../component-model.js";

/**
 * @implements {IComponentModel}
 */
export class Notification extends IComponentModel {
    #listId;

    constructor() {
        super();
        this.#listId = "notification-list-ul";
        this.init();
    }


}