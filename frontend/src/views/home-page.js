import pkg from '../../package.json';

export function HomePage() {
    return /* html */`
        <section class="container-fluid d-flex justify-content-center align-items-center h-100" aria-label="home-page">
            <div id="home-page-container" class="d-flex flex-column flex-wrap">
                <h1><span style="color: var(--orderhub-brand-color); font-weight: 500; margin-bottom: 0;">Solvi</span> Software<br>Manager</h1>
                <h3 style="margin: 0; font-weight: normal;">V${pkg.version}</h3>
            </div>
        </section>
    `;
}
