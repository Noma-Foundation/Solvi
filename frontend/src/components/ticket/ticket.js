import './ticket.css';

export class TicketCard extends HTMLElement {
    constructor() {
        super();
        this.isOpen = false;
        
        // Define default properties
        this.ticketId = this.getAttribute('ticket-id') || '49801';
        this.client = this.getAttribute('client') || 'Client Name';
        this.budget = this.getAttribute('budget') || 'R$1985,84';
        this.address = this.getAttribute('address') || 'Address';
        this.description = this.getAttribute('description') || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...';
    }

    connectedCallback() {
        this.render();
    }

    toggle() {
        this.isOpen = !this.isOpen;
        this.render();
    }

    render() {
        if (!this.isOpen) {
            this.innerHTML = `
            <div class="card card-ticket-closed">
                <article class="card-header">
                    <div>
                        <p class="h5 m-0 pb-1">Ticket - #${this.ticketId}</p>
                        <p class="m-0">${this.client}</p>
                    </div>
                    <button class="btn btn-light" arial-label="Archive">
                        <img src="./src/assets/icons/move_to_inbox.png" />
                    </button>
                </article>
            </div>
            `;
            
            // Add event listeners for closed state
            this.querySelector('.card-ticket-closed').addEventListener('click', () => this.toggle());
        } else {
            this.innerHTML = `
            <div class="card card-ticket-open">
                <div class="card-header m-0">
                    <div>
                        <p class="h5 m-0 pb-1">Ticket - #${this.ticketId}</p>
                        <p class="m-0">${this.client}</p>
                    </div>
                    <button class="btn btn-light" aria-label="More options">
                        <img src="./src/assets/icons/more_icon.png" alt="" />
                    </button>
                </div>
                <div class="card-body">
                    <div class="pb-2">
                        <p class="h6 m-0">
                            Budget: <strong class="ticket-budget">${this.budget}</strong>
                        </p>
                        <p class="m-0">${this.address}</p>
                    </div>
                    <p class="m-0">
                        ${this.description}
                    </p>
                </div>
                <div class="card-footer">
                    <div>
                        <button class="btn btn-light button-edit-ticket">Edit ticket</button>
                        <button class="btn btn-primary button-close-ticket">Close ticket</button>
                    </div>
                </div>
            </div>
            `;
            
            // Add event listeners for open state
            this.querySelector('.button-close-ticket').addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        }
    }
}

// Define the custom element
if (!customElements.get('ticket-card')) {
    customElements.define('ticket-card', TicketCard);
}
