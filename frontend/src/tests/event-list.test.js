import { EventList } from "../collections/event-list";

describe("Testing Class EventList", () => {
    test("Test event with String and function parameter with return", () => {
        const result = "Hello, World!";
        let functionName = "print-name";
        let callbackFunction = () => { 
            console.log("Hello, World!");
            return "Hello, World!";
        }
        expect(EventList.prototype.addEvent(functionName, callbackFunction)).toBe(result);
    });
});