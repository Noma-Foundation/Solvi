import { MenuBar } from "../components/menu-bar/menu-bar.js";


class MenuBarTest extends MenuBar {
    constructor() {
        super();
    }

    test_setCurrentPageID_passedWithValidID() {
    }

    test_setCurrentPageID_withNull() {
    }

    test_setCurrentPageID_withUndefined() {
    }

    test_setCurrentPageID_withSameId() {
    }

}

function test() {
    const testMenu = new MenuBarTest();

    testMenu.test_setCurrentPageID_passedWithValidID();
    testMenu.test_setCurrentPageID_withNull();
    testMenu.test_setCurrentPageID_withUndefined();
    testMenu.test_setCurrentPageID_withSameId();
}

test();
