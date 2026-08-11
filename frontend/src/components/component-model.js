
/**
 * Represent a base interface for component model. Each component displayed separately
 * must be an instance of a class that inherits from IComponentModel. 
 *
 * @interface IComponentModel
 */
export class IComponentModel {
    #template = null;
    #context = null;

    /**
     * @constructs { IComponentModel } - Creates an instance of IComponentModel.
     */
    constructor() { }

    /**
     * Used to initialize the component model. This method is called by the class constructor.
     * 
     * @example
     * class MyComponent extends IComponentModel {
     *     constructor() {
     *         super();
     *         this.init(); // Initialize the component model and all functions.
     *     }
     * }
     */
    init() {
        this.buildTemplate();
        this.bindEvents();
    }

    /**
     * Build the template of the component.
     * 
     * @throws {Error} - Thrown when the method is not implemented in the subclass.
     */
    buildTemplate() { throw new Error("You must implement the buildTemplate method."); }

    /**
     * Bind events to the component.
     * 
     * @throws {Error} - Thrown when the method is not implemented in the subclass.
     */
    bindEvents() { throw new Error("You must implement the bindEvents method."); }

    /**
     * Checks if the class is an interface.
     * 
     * @returns {Boolean} - Returns true if the class is an interface, false otherwise.
     */
    checkIfThisComponentIsInterface() { 
        if (this.buildTemplate === IComponentModel.prototype.buildTemplate || this.bindEvents === IComponentModel.prototype.bindEvents) {
            return true;
        }
        return false;
    }

    /**
     * Checks if the other component is an interface.
     * 
     * @param {Component} otherComponent - Other component to check if it is an IComponentModel interface. 
     * @returns {Boolean} - Returns true if the other component is an IComponentModel interface, false otherwise.
     */
    checkIfOtherComponentIsInterface(otherComponent) { 
        if (otherComponent.buildTemplate === IComponentModel.prototype.buildTemplate || otherComponent.bindEvents === IComponentModel.prototype.bindEvents) {
            return true;
        }
        return false;
    }

    /**
     * Gets the template of the component.
     * 
     * @returns {String} - Returns the template of the component.
     */
    get template() { 
        return this.#template;
    }

    /**
     * Sets the template of the component.
     * 
     * @param {String} value - The template of the component.
     */
    set template(value) { 
        this.#template = value;
    }

    /**
     * Gets the context of the component. The context is the DOM element where the component will be rendered.
     * 
     * @returns {String} - Returns the context of the component.
     */
    get context() { 
        return this.#context;
    }

    /**
     * Sets the context of the component. The context is the DOM element where the component will be rendered.
     * 
     * @param {String} value - The context of the component.
     */
    set context(value) {
        this.#context = value;
    }

}
