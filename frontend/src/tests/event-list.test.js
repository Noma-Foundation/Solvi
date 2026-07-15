import { EventList } from "../collections/event-list";

export class EventTest {
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


describe("Testing Class EventList", () => {
    test("Test event with String and function parameter with return", () => {
        const eventList = new EventList();
        const result = "Hello, World!";
        const functionName = "print-name";
        const callbackFunction = () => {
            console.log("Hello, World!");
            return "Hello, World!";
        }
        expect(eventList.addEvent(functionName, callbackFunction)).toBe(result);
    });

    test("Test event with String and function parameter without return", () => {
        const eventList = new EventList();
        const functionName = "print-name";
        const callbackFunction = () => {
            console.log("Print name!");
        }
        const result = eventList.addEvent(functionName, callbackFunction);
        expect(result).toBeNull();
    });

    test("Verify if object method can add a function as a value in the map", () => {
        const eventList = new EventList();

        expect(eventList.addEvent("login", new EventTest("login", "You are logged in!"))).toBeNull();
    });

});