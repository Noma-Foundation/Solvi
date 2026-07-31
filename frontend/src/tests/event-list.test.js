import { EventList } from "../collections/event-list";

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


describe("Testing Class EventList", () => {
    test("Test event with String and function parameter with return", () => {
        const eventList = new EventList();
        const functionName = "print-name";
        const callbackFunction = () => {
            console.log("Hello, World!");
            return "Hello, World!";
        }
        expect(eventList.addEvent(functionName, callbackFunction)).toBe(true);
    });

    test("Test event with String and function parameter without return", () => {
        const eventList = new EventList();
        const functionName = "print-name";
        const callbackFunction = () => {
            console.log("Print name!");
        }
        const result = eventList.addEvent(functionName, callbackFunction);
        expect(result).toBe(true);
    });

    test("Verify if object method can add a function as a value in the map", () => {
        const eventList = new EventList();
        eventList.addEvent("login", new EventTest("login", "Logged in system!"));
        const result = eventList.getEventByName("login");

        expect(result.length).toBeGreaterThan(0);
    });

    test("Test of events with the same name", () => {
        const eventList = new EventList();
        const objectsList = [
            new EventTest("login", "First login success"),
            new EventTest("logout", "Logout success"),
            new EventTest("login", "Second login success")
        ];

        objectsList.forEach((object) => {
            eventList.addEvent(object.getName(), object);
        });

        expect(eventList.getEventByName("login")).toHaveLength(2);
        expect(eventList.getEventByName("logout")).toHaveLength(1);
    });

    test("Clear all events from the queue", () => {
        const eventList = new EventList();
        const functionName = "my-function";
        const functionResult = () => {
        }

        eventList.addEvent(functionName, functionResult);
        eventList.addEvent("login", functionResult);

        eventList.clearEvents();

        expect(eventList.getEventByName("login")).toBeNull();
        expect(eventList.getEventByName("my-function")).toBeNull();
    });

    test("Remove an event from the event queue", () => {
        const eventList = new EventList();
        const functionName = "my-function";
        const functionResult = () => {
        }

        eventList.addEvent(functionName, functionResult);
        eventList.removeEvent(functionName);
        expect(eventList.getEventByName(functionName)).toBeNull();
    });

    test("Get size of event list", () => {
        const eventList = new EventList();
        const functionName = "my-function";
        const functionResult = () => {
        }

        eventList.addEvent(functionName, functionResult);
        eventList.addEvent("login", functionResult);

        expect(eventList.length).toBe(2);
    });

    test("Testing events with LogError external class", () => {
    });

    test("Testing non-existent event call", () => {
    });

    test("Testing clear all events", () => {
    });

    test("Testing method constructor of eventList", () => {
    });

});