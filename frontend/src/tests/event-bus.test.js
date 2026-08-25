import { EventBus } from "../../framework/event-bus.js";
import { EventList } from "../../framework/collections/event-list.js";
import { History } from "../../framework/collections/history.js";

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

class SimpleEvent {
    #name;
    called = false;
    constructor(name) { this.#name = name; }
    execute() { this.called = true; return "ok"; }
    getName() { return this.#name; }
}


describe("Test event bus system (Integration test)", () => {
    test("Testing event registration and history (EventList)", () => {
        const eventList = new EventList();
        const history = new History(3);

        const event1 = new EventTest("login", "User logged in!");

        // addEvent now registers listeners and returns true
        expect(eventList.addEvent(event1.getName(), event1)).toBe(true);
        expect(eventList.getEventByName(event1.getName())).not.toBeNull();

        expect(eventList.addEvent("logout", () => { return "Hello, World!" })).toBe(true);
        expect(eventList.getEventByName("logout")).not.toBeNull();

        history.pushEvent(event1.getName());
        history.pushEvent("logout");

        expect(history.getHistory()).toEqual(["login", "logout"]);
    });

    test("subscribe throws when object.execute declares parameters", () => {
        const eventBus = new EventBus(1);
        const myEvent = new EventWithError("login", "User logged in!");

        // subscribe should validate and throw because execute accepts args
        expect(() => eventBus.subscribe(myEvent.getName(), myEvent)).toThrow(Error);
    });

    test("subscribe and dispatch with function callback", () => {
        const eb = new EventBus(5);
        const fn = (data) => `got:${data}`;
        eb.subscribe("evt1", fn); // registers immediately

        const results = eb.dispatch("evt1", "payload");
        expect(results).toEqual(["got:payload"]);
        expect(eb.getHistory()).toEqual(["evt1"]);
        expect(eb.getEvent("evt1")).not.toBeNull();
    });

    test("subscribe and dispatch with object callback (execute no args)", () => {
        const eb = new EventBus(5);
        const obj = new SimpleEvent("evt2");
        eb.subscribe("evt2", obj);
        const results = eb.dispatch("evt2");
        expect(results[0]).toBe("ok");
        expect(obj.called).toBe(true);
    });

    test("publishAsync executes callbacks asynchronously", (done) => {
        const eb = new EventBus(5);
        let called = false;
        const fn = (d) => { called = d === "x"; };
        eb.subscribe("a", fn);
        eb.publishAsync("a", "x");
        setTimeout(() => {
            try {
                expect(called).toBe(true);
                done();
            } catch (err) {
                done(err);
            }
        }, 10);
    });

    test("unsubscribe removes specific callback and entire event", () => {
        const eb = new EventBus(5);
        const fn1 = () => 1;
        const fn2 = () => 2;
        eb.subscribe("multi", fn1);
        eb.subscribe("multi", fn2);
        expect(eb.getEvent("multi").length).toBeGreaterThanOrEqual(2);
        eb.unsubscribe("multi", fn1);
        const remaining = eb.getEvent("multi");
        expect(remaining.every(cb => cb !== fn1)).toBe(true);
        eb.unsubscribe("multi"); // remove entire event
        expect(eb.getEvent("multi")).toBeNull();
    });

    test("clearEventBus empties everything", () => {
        const eb = new EventBus(3);
        eb.subscribe("x", () => {});
        eb.clearEventBus();
        expect(eb.getHistory()).toEqual([]);
        expect(eb.getEvent("x")).toBeNull();
    });
});
