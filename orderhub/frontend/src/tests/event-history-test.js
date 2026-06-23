import { History } from "../utils/history.js";

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

class EventHistoryTest {
    #history;

    constructor(maxSize) {
        this.#history = new History(maxSize);
    }

    testMaxSizeWithNegativeValue() {
        const history1 = new History(-5);
        const history2 = new History(-10);

        console.assert(history1.getMaxSize() === 5, "Should be 5");
        console.assert(history2.getMaxSize() === 10, "Should be 10");
    }

    testGetHistory() {
        const allEvents = this.#history.getHistory();
        console.assert(allEvents instanceof Array, "getHistory() should return an Array");
    }

    testHistoryIsEmpty() {
        console.assert(this.#history.isEmpty(), "Should be true");
    }

    testHistoryIsNotEmpty() {
        const history1 = new History(2);

        history1.pushEvent("login");
        console.assert(history1.length === 1, "Should be 1");
        console.assert(history1.isEmpty() === false, "Should be false");
    }

    testHistoryIsFull() {
        const history1 = new History(2);

        history1.pushEvent("login");
        history1.pushEvent("access-database");
        console.assert(history1.isFull(), "Should be true");
    }

    testAddEventWithFullHistory() {
        const history1 = new History(1);
        history1.pushEvent("login");

        console.assert(history1.isFull(), "Should be true");
        console.assert(history1.pushEvent("access-database") === null, "Should be null | at the moment = " + history1.getHistory().length);
    }

    testPushEvent() {
        const history1 = new History(1);

        console.assert(history1.pushEvent("login") === "login", "Should be login");
        console.assert(history1.getHistory().at(0) === "login", "value at the moment = " + history1.getHistory().at(0));
    }

    testPushEventWithEventObject() {
        const eventName = "login";
        const eventMessage = "User logged in";
        const event = new EventTest(eventName, eventMessage);
        const history1 = new History(1);

        console.assert(history1.pushEvent(event) === event, "Should be event object");
        console.assert(history1.getHistory().at(0) === event, "value at the moment = " + history1.getHistory().at(0));
    }

    testPopEvent() {
    }

    testClearAllEvents() {
    }

}

function test() {
    const history = new EventHistoryTest(3);

    // Max Size Tests
    history.testMaxSizeWithNegativeValue();

    // Get Tests
    history.testGetHistory();

    // Is Empty and Full Test
    history.testHistoryIsEmpty();
    history.testHistoryIsNotEmpty();
    history.testHistoryIsFull();
    history.testAddEventWithFullHistory();

    // Test Operations
    history.testPushEvent();
    history.testPushEventWithEventObject();
    history.testPopEvent();
    history.testClearAllEvents();
}

test();
