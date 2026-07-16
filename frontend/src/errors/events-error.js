
export class FunctionWithArgsError extends Error {

    constructor(message) {
        super(message);
        this.name = "FunctionWithArgsError";
    }

}