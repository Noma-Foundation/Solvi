import { eventBus } from "./event-manager-singleton.js";

import { LoginPage } from "./components/login-page/login-page.js";
import { MenuBar } from "./components/menu-bar/menu-bar.js";
import { SearchBar } from "./components/search-bar/search-bar.js";

// Initialize main app components
const context = "#app-main-context";

const menuBar = new MenuBar();
const searchBar = new SearchBar();

//eventBus.subscribe("login", () => {
//    const loginPage = new LoginPage(context);
//});

console.log("Hello, World!");
