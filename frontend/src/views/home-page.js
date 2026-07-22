import '../components/ticket/ticket.js';

export function Home() {
    // Aqui no futuro os dados virão do banco de dados (Wails/Go Backend)
    // Usando dados mockados para demonstrar a mecânica solicitada
    const mockTickets = [
        { id: "49801", client: "João Silva", budget: "R$ 1.985,84", address: "Rua A, 123", desc: "Instalação de câmeras e sensores." },
        { id: "49802", client: "Maria Souza", budget: "R$ 3.450,00", address: "Av. B, 456", desc: "Manutenção na rede estruturada." },
        { id: "49803", client: "Empresa XPTO", budget: "R$ 12.000,00", address: "Rodovia C, km 10", desc: "Projeto completo de segurança eletrônica." }
    ];

    const ticketsHtml = mockTickets.map(t => 
        `<ticket-card ticket-id="${t.id}" client="${t.client}" budget="${t.budget}" address="${t.address}" description="${t.desc}"></ticket-card>`
    ).join('');

    return (`
        <section class="container mt-4">
            <h1>Home Page</h1>
            <h4 class="mt-4 mb-3">Últimos Tickets</h4>
            <div class="d-flex flex-wrap gap-3">
                ${ticketsHtml}
            </div>
        </section>
    `);
}