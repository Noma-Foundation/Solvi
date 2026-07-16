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


describe("Test event bus system (Integration test)", () => {
    test("Testing event subscription without EventBus", () => {
        const eventList = new EventList();
        const history = new History(3);

        const event1 = new EventTest("login", "User logged in!");
        const event2 = new EventTest("logout", "User logged out!");
    });
});
