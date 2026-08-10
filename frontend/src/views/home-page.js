
import pkg from '../../package.json';

export function HomePage() {
    return `
        <section class="container mt-4">
            <div id="home-page-container" class="d-flex flex-column flex-wrap">
                <h1><span style="color: var(--orderhub-brand-color); font-weight: 500; margin-bottom: 0;">Solvi</span> Software<br>Manager</h1>
                <h3 style="margin: 0; font-weight: normal;">V${pkg.version}</h3>
            </div>
        </section>

        <script>
            console.log("[CHANGE PAGE] Home Page");
        </script>
    `;
}
