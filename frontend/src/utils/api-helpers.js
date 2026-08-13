export function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function parseApiResult(result) {
    if (typeof result === "string") {
        try {
            return JSON.parse(result);
        } catch {
            return null;
        }
    }
    return result;
}

export function apiAvailable() {
    return Boolean(window.pywebview && window.pywebview.api);
}

/**
 * pywebview injects `window.pywebview.api` asynchronously after the page loads,
 * dispatching `pywebviewready` when it's done. Callers that need the API on
 * startup must wait for it instead of checking synchronously, or they'll lose
 * the race against injection (most noticeable on the fast-loading packaged build).
 */
export function waitForPywebviewApi(timeoutMs = 8000) {
    if (apiAvailable()) return Promise.resolve(true);

    return new Promise((resolve) => {
        let settled = false;
        const finish = (result) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            window.removeEventListener("pywebviewready", onReady);
            resolve(result);
        };
        const onReady = () => finish(true);
        const timer = setTimeout(() => finish(apiAvailable()), timeoutMs);

        window.addEventListener("pywebviewready", onReady, { once: true });
    });
}

export function formatBytes(bytes) {
    const n = Number(bytes) || 0;
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
    return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function formatCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}
