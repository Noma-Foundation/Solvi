
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
    test("Test EventBus instance", () => { 
    });
});
