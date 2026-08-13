import { IComponentModel } from "../components/component-model.js";

class MyComponentWithoutImplementation {
}


class MyComponent extends IComponentModel { 
}


describe("IComponent interface tests", () => {

    test("Test if IComponent is an interface", () => { 
        const myComponent = new MyComponent(); 

        expect(myComponent.checkIfThisComponentIsInterface()).toBe(true);
    });

    test("Test if MyComponent is not an interface", () => {
        const myComponent = new MyComponent();
        const otherComponent = new MyComponentWithoutImplementation();

        expect(myComponent.checkIfOtherComponentIsInterface(otherComponent)).toBe(false);
    });

    test("Test template property is null", () => { 
        const myComponent = new MyComponent();

        expect(myComponent.template).toBeNull();
    });

    test("Test set template property", () => { 
        const myComponent = new MyComponent();
        myComponent.template = /* html */ `<div><h1>Hello, World!</h1></div>`;

        expect(myComponent.template).toBe(`<div><h1>Hello, World!</h1></div>`);
    });

    test("Test context property is null", () => {
        const myComponent = new MyComponent();
        
        expect(myComponent.context).toBeNull();
    });

    test("Test set context property", () => {
        const myComponent = new MyComponent();
        myComponent.context = "#my-component";

        expect(myComponent.context).toBe("#my-component");
    });
    
});