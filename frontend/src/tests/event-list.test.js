import { EventList } from "../collections/event-list";

describe("Testing Class EventList", () => {
    test("Test create event with String and function parameter", () => {
        let functionaName = "print-name";
        let callbackFunction = () => { 
            console.log("Hello, World!");
            return "Hello, World!";
        }
        expect(EventList.prototype.addEvent(functionName, callbackFunction)).toBe()
    });
});