import { IComponentModel } from "../components/component-model.js";


describe("IComponent interface tests", () => {

    test("Test if IComponent is an interface", () => { 
        const component = new IComponentModel(); 
        
        expect(component.componentModelIsInterface()).toBe(true);
    });
    
});