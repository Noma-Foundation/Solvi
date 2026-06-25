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

    testHistoryIsEmpty() {
        console.assert(this.#history.isEmpty(), "Should be true");
    }

    testHistoryIsNotEmpty() {
        const history1 = new History(1);
        history1.pushEvent("login");

        console.assert(history1.isEmpty() === false, "Should be false");
    }

    testHistoryIsFull() {
        const history1 = new History(2);

        history1.pushEvent("login");
        history1.pushEvent("access-database");
        console.assert(history1.isFull(), "Should be true");
    }

    testPushEventWithFullHistory() {
        const history1 = new History(1);

        history1.pushEvent("login");
        console.assert(history1.pushEvent("access-database") === "access-database", "Should be access-database");
        console.assert(history1.length === 1, "Should be 1");
    }

    testPushStringEvent() {
        const event = "login";
        const history1 = new History(1);

        console.assert(history1.pushEvent(event) === event, "Should be login");
    }

    testPushEventWithEventObject() {
        const eventName = "login";
        const eventMessage = "User logged in";
        const event = new EventTest(eventName, eventMessage);
        const history1 = new History(1);

        console.assert(history1.pushEvent(event) === event, "Should be event object");
    }

    testPopEvent() {
        const history1 = new History(3);

        history1.pushEvent("login");
        history1.pushEvent("event 2");

        console.assert(history1.shiftEvent() === "login", "Should be login");
        console.assert(history1.shiftEvent() === "event 2", "Should be event 2");
        console.assert(history1.shiftEvent() === null, "Should be null");
    }

    testPopEventWithEmptyHistory() {
        const history1 = new History(1);
        console.assert(history1.shiftEvent() === null, "Should be null");
    }

}

function test() {
    const history = new EventHistoryTest(3);

    // Max Size Tests
    history.testMaxSizeWithNegativeValue();

    // Is Empty and Full Test
    history.testHistoryIsEmpty();
    history.testHistoryIsNotEmpty();
    history.testHistoryIsFull();
    history.testPushEventWithFullHistory();

    // Test Operations
    history.testPushStringEvent();
    history.testPushEventWithEventObject();
    history.testPopEvent();
    history.testPopEventWithEmptyHistory();
    history.testClearAllEvents();
}

test();
