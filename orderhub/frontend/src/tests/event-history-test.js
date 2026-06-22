import { History } from "../utils/history.js";


class EventHistoryTest {
    actualSize;
    history;

    constructor(maxSize) {
        this.history = new History(maxSize);
        this.actualSize = 0;
    }

    testMaxSizeWithNegativeValue() {
        const history1 = new History(-5);
        const history2 = new History(-10);

        console.assert(history1.getMaxSize() === 5, "Should be 5");
        console.assert(history2.getMaxSize() === 10, "Should be 10");
    }

    testMaxSizeWithLetterValue() {
    }

    testGetHistory() {
        const allEvents = this.history.getHistory();
        console.assert(allEvents instanceof Array, "getHistory() should return an Array");
    }

}

function test() {
    const history = new EventHistoryTest(5);

    // Max Size Tests
    history.testMaxSizeWithNegativeValue();
    history.testMaxSizeWithLetterValue();

    // Get Tests
    history.testGetHistory();
}

test();
