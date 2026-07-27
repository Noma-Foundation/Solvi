
import pkg from '../../package.json';
import { html } from '../utils/html.js';

export function Home() {
    return html`
        <section class="container mt-4">
            <div id="home-page-container" class="d-flex flex-column flex-wrap">
                <h1><span style="color: var(--orderhub-brand-color); font-weight: 500;">FixIT</span> Software<br>Manager</h1>
                <h3 style="margin: 0; font-weight: normal;">V${pkg.version}</h3>
            </div>
        </section>
    `;
}
