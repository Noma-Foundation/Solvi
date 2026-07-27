import '../components/ticket/ticket.js';

export function Home() {
    return (`
        <section class="container mt-4">
            <div id="home-page-container" class="d-flex flex-column flex-wrap">
                <h1><span style="color: var(--orderhub-brand-color); font-weight: 500;">FixIT</span> Software<br>Manager</h1>
                <h3 style="margin: 0; font-weight: normal;">V1.1.2</h3>
            </div>
        </section>
    `);
}