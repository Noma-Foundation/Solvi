import { EventBus } from "../utils/event-bus.js";

class EventBusTest extends EventBus {

    constructor() {
        super();
    }

}

function test() {
    const eventBus = new EventBusTest();
}

test();
