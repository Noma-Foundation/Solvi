import { IComponentModel } from "../../../framework/interfaces/component-model.js";


export class DashboardComponent extends IComponentModel {

    constructor() { 
        super();
        this.init();
    }

    buildTemplate() { 
        this.template = /* html */ `
            <div class="dashboard-component">
                <h2 id="dashboard-title">Dashboard</h2>
            </div>
        `;
        
        const dashboardContainer = document.querySelector(".dashboard-page");
        dashboardContainer.innerHTML = this.template;
    }

    bindEvents() { 
        const dashboardTitle = document.getElementById("dashboard-title");

        dashboardTitle.addEventListener("click", () => { 
            this.openPromise();
        });
    }

    // Test promise with async/await
    async openPromise() { 
        try { 
            const response = await fetch("/api/clients"); // Fetch data from the backend API
            const data = await response.json();
            const dashboardTitle = document.getElementById("dashboard-title");
            
            // Do something with the fetched data
            dashboardTitle.textContent = `${data.message}`;
        } catch(error) { 
            console.error("Error fetching data from backend:", error);
        }
    
    }

}