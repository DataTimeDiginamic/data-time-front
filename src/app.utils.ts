/* ============================================================
   CONFIG API
   ============================================================ */

// L'API tourne sur Laragon (Apache). Avec "php -S localhost:8000 -t public", mettre "http://localhost:8000".
export const API_BASE_URL = "http://localhost/datatime/game-catalog/public";

/* ============================================================
   UTILITAIRES GLOBAUX
   ============================================================ */

/** Affiche un toast visuel */
export function toast(message: string, type: "success" | "error" = "success"): void {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const div = document.createElement("div");
    div.className = `toast ${type}`;
    div.textContent = message;

    container.appendChild(div);
    setTimeout(() => div.remove(), 3500);
}

/* ============================================================
   FETCH HELPERS
   ============================================================ */

/** Message affiché quand le serveur répond avec une erreur */
function statusMessage(status: number): string {
    if (status === 401) return "Session expirée : veuillez vous reconnecter";
    if (status === 403) return "Action interdite pour votre rôle";
    return `Erreur serveur (${status})`;
}

/** GET JSON */
export async function httpGet<T>(url: string): Promise<T> {
    try {
        const res = await fetch(API_BASE_URL + url, { credentials: "include" });
        if (!res.ok) {
            toast(statusMessage(res.status), "error");
            throw new Error(`GET ${url} -> ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        // Une erreur serveur (401, 403...) a déjà affiché son message : on n'ajoute pas "Erreur réseau"
        if (err instanceof TypeError) {
            toast("Erreur réseau : impossible de contacter le serveur", "error");
        }
        throw err;
    }
}

/** POST FormData (Client / Projet / Salarie) */
export async function httpPostForm<T>(url: string, data: Record<string, any>): Promise<T> {
    try {
        const form = new FormData();
        for (const key in data) form.append(key, data[key]);

        const res = await fetch(API_BASE_URL + url, {
            method: "POST",
            body: form,
            credentials: "include"
        });

        if (!res.ok) {
            toast(statusMessage(res.status), "error");
            throw new Error(`POST ${url} -> ${res.status}`);
        }

        return await res.json();
    } catch (err) {
        // Une erreur serveur (401, 403...) a déjà affiché son message : on n'ajoute pas "Erreur réseau"
        if (err instanceof TypeError) {
            toast("Erreur réseau : impossible de contacter le serveur", "error");
        }
        throw err;
    }
}

/** POST JSON (Absence / Tache) */
export async function httpPostJSON<T>(url: string, data: any): Promise<T> {
    try {
        const res = await fetch(API_BASE_URL + url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include"
        });

        if (!res.ok) {
            toast(statusMessage(res.status), "error");
            throw new Error(`POST JSON ${url} -> ${res.status}`);
        }

        return await res.json();
    } catch (err) {
        // Une erreur serveur (401, 403...) a déjà affiché son message : on n'ajoute pas "Erreur réseau"
        if (err instanceof TypeError) {
            toast("Erreur réseau : impossible de contacter le serveur", "error");
        }
        throw err;
    }
}

/** PUT JSON (Absence update) */
export async function httpPutJSON<T>(url: string, data: any): Promise<T> {
    try {
        const res = await fetch(API_BASE_URL + url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include"
        });

        if (!res.ok) {
            toast(statusMessage(res.status), "error");
            throw new Error(`PUT ${url} -> ${res.status}`);
        }

        return await res.json();
    } catch (err) {
        // Une erreur serveur (401, 403...) a déjà affiché son message : on n'ajoute pas "Erreur réseau"
        if (err instanceof TypeError) {
            toast("Erreur réseau : impossible de contacter le serveur", "error");
        }
        throw err;
    }
}

/** DELETE JSON (Absence delete) */
export async function httpDelete(url: string): Promise<void> {
    try {
        const res = await fetch(API_BASE_URL + url, { method: "DELETE", credentials: "include" });

        if (!res.ok) {
            toast(statusMessage(res.status), "error");
            throw new Error(`DELETE ${url} -> ${res.status}`);
        }
    } catch (err) {
        // Une erreur serveur (401, 403...) a déjà affiché son message : on n'ajoute pas "Erreur réseau"
        if (err instanceof TypeError) {
            toast("Erreur réseau : impossible de contacter le serveur", "error");
        }
        throw err;
    }
}

/* ============================================================
   MODALE DÉTAIL
   ============================================================ */

/** Affiche la modale de détail avec un titre et du HTML pour le contenu */
export function openDetailModal(title: string, bodyHtml: string): void {
    qs<HTMLElement>("#detail-modal-title").textContent = title;
    qs<HTMLElement>("#detail-modal-body").innerHTML = bodyHtml;
    qs<HTMLDivElement>("#detail-modal").classList.remove("hidden");
}

export function closeDetailModal(): void {
    qs<HTMLDivElement>("#detail-modal").classList.add("hidden");
}

export function setupDetailModal(): void {
    qs("#detail-modal-close").addEventListener("click", closeDetailModal);
}

/* ============================================================
   RESPONSIVE
   ============================================================ */

export function isMobile(): boolean {
    return window.innerWidth <= 768;
}

/* ============================================================
   DOM HELPERS
   ============================================================ */

export function qs<T extends HTMLElement>(selector: string): T {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`Élément introuvable : ${selector}`);
    return el as T;
}

export function qsa<T extends HTMLElement>(selector: string): T[] {
    return Array.from(document.querySelectorAll(selector)) as T[];
}

/* ============================================================
   TABS (onglets)
   ============================================================ */

export function setupTabs(tabMap: Record<string, string>): void {
    for (const tabId in tabMap) {
        const sectionId = tabMap[tabId];
        const tabBtn = qs(`#${tabId}`);
        const section = qs(`#${sectionId}`);

        tabBtn.addEventListener("click", () => {
            // désactiver tous les onglets
            for (const t of Object.keys(tabMap)) {
                qs(`#${t}`).classList.remove("active");
                qs(`#${tabMap[t]}`).classList.add("hidden");
                qs(`#${tabMap[t]}`).classList.remove("active-section");
            }

            // activer l'onglet cliqué
            tabBtn.classList.add("active");
            section.classList.remove("hidden");
            section.classList.add("active-section");
        });
    }
}

/* ============================================================
   RE-RENDER RESPONSIVE
   ============================================================ */

export function setupResponsiveRerender(callback: () => void): void {
    window.addEventListener("resize", () => callback());
}
