import { IComponentModel } from "../components/component-model.js";

class MyComponentWithoutImplementation {
}


class MyComponentWithImplementation extends IComponentModel { 
}


describe("IComponent interface tests", () => {

    test("Test if IComponent is an interface", () => { 
        const myComponent = new MyComponentWithImplementation(); 

        expect(myComponent.checkIfThisComponentIsInterface()).toBe(true);
    });

    test("Test if MyComponent is not an interface", () => {
        const myComponent = new MyComponentWithImplementation();
        const otherComponent = new MyComponentWithoutImplementation();

        expect(myComponent.checkIfOtherComponentIsInterface(otherComponent)).toBe(false);
    });

    test("Test template property is null", () => { 
        const myComponent = new MyComponentWithImplementation();

        expect(myComponent.template).toBeNull();
    });

    test("Test set template property", () => { 
        const myComponent = new MyComponentWithImplementation();
        myComponent.template = /* html */ `<div><h1>Hello, World!</h1></div>`;

        expect(myComponent.template).toBe(`<div><h1>Hello, World!</h1></div>`);
    });
    
});