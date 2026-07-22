export namespace internal {
	
	export class TicketView {
	    id: string;
	    client: string;
	    budget: string;
	    address: string;
	    desc: string;
	
	    static createFrom(source: any = {}) {
	        return new TicketView(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.client = source["client"];
	        this.budget = source["budget"];
	        this.address = source["address"];
	        this.desc = source["desc"];
	    }
	}

}

