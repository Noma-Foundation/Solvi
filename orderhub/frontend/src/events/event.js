
/**
 * Creates an abstract class that serves as an interface for all events in the frontend.
 * This class is used to create events that are used to communicate between different components.
 *
 * @interface IEvent
 */
export class IEvent {

    /**
     * @type {String} - Represent the type of the event.
     */
    type;
    /**
     * @type {String} - Represent the name of the event.
     */
    name;
    /**
     * @type {String} - Represent the description of the event.
     */
    description;
    /**
     * @type {Date} - Represent the date the event occurred.
     */
    date;

    /**
     * Creates an instance of IEvent.
     * 
     * @param {*} type 
     * @param {*} name 
     * @param {*} date 
     * 
     * @constructs
     */
    constructor(type, name, date) {
        this.type = type;
        this.name = name;
        this.date = date;
    }

    /**
     * Execute the event action.
     * 
     * @throws {Error} - Thrown when the method is not implemented in the subclass.
     */
    execute() { throw new Error("Method 'execute' must be implemented."); }

    /**
     * Returns a new event object with this event's information.
     * 
     * @returns {Object} - The event information.
     */
    getEventInfoInObjectForm() {
        return {
            type: this.type,
            name: this.name,
            description: this.description,
            date: this.date
        };
    }

}
