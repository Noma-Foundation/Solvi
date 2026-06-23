import { EventBus } from "../utils/event-bus.js";

class EventBusTest {

    eventBus;

    constructor() {
        this.eventBus = new EventBus();
    }

    testSubscribeEvent() {
        const assert_event_name = "SaveTicket";
        let current_events = "SaveTicket";
        console.assert(current_events === assert_event_name, "Event name should not be equal to the asserted value.");
    }

}

function test() {
    const eventBus = new EventBusTest();

    eventBus.testSubscribeEvent();
}

test();
