
/**
 * Represent a base interface for component model. Each component displayed separately
 * must be an instance of a class that inherits from IComponentModel. 
 *
 * @interface IComponentModel
 */
export class IComponentModel {

    /**
     * @constructor
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

}
