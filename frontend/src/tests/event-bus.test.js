import { EventBus } from "../utils/event-bus.js";
import { EventList } from "../collections/event-list.js";
import { History } from "../collections/history.js";

export class EventTest {
    #name;
    #message;

    constructor(name, message) {
        this.#name = name;
        this.#message = message;
    }

    execute() {
    }

    getName() {
        return this.#name;
    }
}

export class EventWithError {
    #name
    #message;

    constructor(name, message) {
        this.#name = name;
        this.#message = message;
    }

    execute(message) { 
        this.#message = message;
        console.log(`Hello ${this.#message}!`); 
    }

    getName() {
        return this.#name;
    }
}


describe("Test event bus system (Integration test)", () => {
    test("Testing event subscription without EventBus", () => {
        const eventList = new EventList();
        const history = new History(3);

        const event1 = new EventTest("login", "User logged in!");

        expect(eventList.addEvent(event1.getName(), event1)).toBe(null);
        expect(eventList.addEvent("logout", () => { return "Hello, World!" })).toBe("Hello, World!");
        history.pushEvent(event1.getName());
        history.pushEvent("logout");

        expect(history.getHistory()).toEqual(["login", "logout"]);
    });

    test("Testing EventBus with arguments in the execute function", () => {
        const eventBus = new EventBus(1);
        const myEvent = new EventWithError("login", "User logged in!");

        expect(eventBus.subscribe(myEvent.getName(), myEvent)).toThrow(Error);
    });
});
