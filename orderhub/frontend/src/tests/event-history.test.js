import { History } from "../collections/history.js";

class EventTest {
    #name;
    #message;

    constructor(name, message) {
        this.#name = name;
        this.#message = message;
    }

    execute() {
        console.log(this.#message);
    }

    getName() {
        return this.#name;
    }
}


describe("Testing Class History", () => {
    test("Should create a history with empty params", () => {
        const history = new History();
        expect(history).toBeInstanceOf(History);
    });

    test("Should handle maxSize with negative value", () => {
        const history1 = new History(-5);
        const history2 = new History(-10);

        expect(history1.getMaxSize()).toBe(5);
        expect(history2.getMaxSize()).toBe(10);
    });

    test("Should be empty when created", () => {
        const history = new History(10);
        expect(history.isEmpty()).toBe(true);
    });

    test("Should not be empty after adding an event", () => {
        const history1 = new History(1);
        history1.pushEvent("login");

        expect(history1.isEmpty()).toBe(false);
    });

    test("Should be full when reaching maxSize", () => {
        const history1 = new History(2);

        history1.pushEvent("login");
        history1.pushEvent("access-database");
        expect(history1.isFull()).toBe(true);
    });

    test("Should handle pushEvent when history is full", () => {
        const history1 = new History(1);

        history1.pushEvent("login");
        expect(history1.pushEvent("access-database")).toBe("access-database");
        expect(history1.length).toBe(1);
    });

    test("Should push a string event correctly", () => {
        const event = "login";
        const history1 = new History(1);

        expect(history1.pushEvent(event)).toBe(event);
    });

    test("Should push an Event object correctly", () => {
        const eventName = "login";
        const eventMessage = "User logged in";
        const event = new EventTest(eventName, eventMessage);
        const history1 = new History(1);

        expect(history1.pushEvent(event)).toBe(event);
    });

    test("Should shift events correctly (FIFO)", () => {
        const history1 = new History(3);

        history1.pushEvent("login");
        history1.pushEvent("event 2");

        expect(history1.shiftEvent()).toBe("login");
        expect(history1.shiftEvent()).toBe("event 2");
        expect(history1.shiftEvent()).toBeNull();
    });

    test("Should return null when shifting from empty history", () => {
        const history1 = new History(1);
        expect(history1.shiftEvent()).toBeNull();
    });
});
