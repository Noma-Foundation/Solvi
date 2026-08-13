import { eventBus } from "../event-manager-singleton.js";
import { apiAvailable, parseApiResult } from "./api-helpers.js";

const EVENT_MAP = {
    "customer:created": {
        title: "Cliente criado",
        description: (d) => `Cliente "${d?.name || ""}" cadastrado.`,
        category: "cliente",
        level: "Sucesso",
    },
    "customer:removed": {
        title: "Cliente removido",
        description: (d) => `Cliente removido do sistema.`,
        category: "cliente",
        level: "Aviso",
    },
    "budget:created": {
        title: "Orçamento criado",
        description: (d) => `Orçamento ${d?.number || ""} para ${d?.client || ""} criado.`,
        category: "orcamento",
        level: "Sucesso",
    },
    "budget:updated": {
        title: "Orçamento atualizado",
        description: (d) => `Orçamento ${d?.number || ""} atualizado.`,
        category: "orcamento",
        level: "Informação",
    },
    "budget:status-changed": {
        title: "Status do orçamento",
        description: (d) => `Orçamento ${d?.number || ""} agora está "${d?.status || ""}".`,
        category: "orcamento",
        level: (d) => (d?.status === "Aprovado" ? "Sucesso" : "Informação"),
    },
    "calendar:task-added": {
        title: "Tarefa adicionada",
        description: (d) => `Tarefa "${d?.title || ""}" agendada.`,
        category: "calendario",
        level: "Sucesso",
    },
    "calendar:task-updated": {
        title: "Tarefa atualizada",
        description: (d) => `Tarefa "${d?.title || ""}" atualizada.`,
        category: "calendario",
        level: "Informação",
    },
    "calendar:task-removed": {
        title: "Tarefa removida",
        description: (d) => `Uma tarefa foi removida do calendário.`,
        category: "calendario",
        level: "Aviso",
    },
    "system:error": {
        title: "Erro interno",
        description: (d) => d?.message || "Ocorreu um erro no sistema.",
        category: "sistema",
        level: "Erro",
    },
};

function resolveLevel(spec, data) {
    if (typeof spec.level === "function") return spec.level(data);
    return spec.level;
}

class NotificationService {
    #started = false;

    start() {
        if (this.#started) return;
        this.#started = true;

        for (const [eventName, spec] of Object.entries(EVENT_MAP)) {
            eventBus.subscribe(eventName, async (data) => {
                await this.#persist(spec, data);
            });
        }
    }

    async #persist(spec, data) {
        if (!apiAvailable()) return;

        try {
            const raw = await window.pywebview.api.add_notification(
                spec.title,
                typeof spec.description === "function" ? spec.description(data) : spec.description,
                spec.category,
                resolveLevel(spec, data),
            );
            const result = parseApiResult(raw);
            if (result && !result.error) {
                eventBus.publishAsync("notifications:changed", { notification: result });
            }
        } catch {
            // swallow – notification pipeline must not break domain flows
        }
    }

    async refresh() {
        eventBus.publishAsync("notifications:changed", {});
    }
}

export const notificationService = new NotificationService();
