import {
    qs,
    httpGet,
    httpPostJSON,
    toast,
    isMobile
} from "./app.utils";

/* ============================================================
   TYPES
   ============================================================ */

export interface Tache {
    id_tache: number;
    Nom: string;
    temps_previsionnel: number;
    temps_passe: number;
    debut: string;
    fin: string | null;
    statut: string;
    id_projet: number;
    id_salarie: number;
}

/* ============================================================
   ÉTAT LOCAL
   ============================================================ */

let taches: Tache[] = [];

/* ============================================================
   CHARGEMENT
   ============================================================ */

export async function loadTaches(): Promise<void> {
    const data = await httpGet<Tache[]>("/api/taches");
    taches = data;
    renderTaches();
}

/* ============================================================
   RENDU
   ============================================================ */

function renderTaches(): void {
    if (isMobile()) renderTacheCards();
    else renderTacheTable();
}

/* ---------- TABLE ---------- */

function renderTacheTable(): void {
    const tbody = qs<HTMLTableSectionElement>("#tache-table-body");
    tbody.innerHTML = "";

    taches.forEach(t => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${t.id_tache}</td>
            <td>${t.Nom}</td>
            <td>${t.temps_previsionnel}</td>
            <td>${t.temps_passe}</td>
            <td>${t.debut}</td>
            <td>${t.fin ?? "-"}</td>
            <td>${t.statut}</td>
            <td>${t.id_projet}</td>
            <td>${t.id_salarie}</td>
            <td>
                <button class="edit-btn" data-id="${t.id_tache}">✏️</button>
                <button class="delete-btn" data-id="${t.id_tache}">🗑️</button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    setupTacheActions();
}

/* ---------- CARDS ---------- */

function renderTacheCards(): void {
    const container = qs<HTMLDivElement>("#tache-cards");
    container.innerHTML = "";

    taches.forEach(t => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <p><strong>ID :</strong> ${t.id_tache}</p>
            <p><strong>Nom :</strong> ${t.Nom}</p>
            <p><strong>Prévu :</strong> ${t.temps_previsionnel}</p>
            <p><strong>Passé :</strong> ${t.temps_passe}</p>
            <p><strong>Début :</strong> ${t.debut}</p>
            <p><strong>Fin :</strong> ${t.fin ?? "-"}</p>
            <p><strong>Statut :</strong> ${t.statut}</p>
            <p><strong>ID Projet :</strong> ${t.id_projet}</p>
            <p><strong>ID Salarié :</strong> ${t.id_salarie}</p>
            <div class="card-actions">
                <button class="edit-btn" data-id="${t.id_tache}">✏️</button>
                <button class="delete-btn" data-id="${t.id_tache}">🗑️</button>
            </div>
        `;

        container.appendChild(div);
    });

    setupTacheActions();
}

/* ============================================================
   ACTIONS (EDIT / DELETE)
   ============================================================ */

function setupTacheActions(): void {
    const section = qs<HTMLElement>("#section-taches");

    /* ----- EDIT ----- */
    section.querySelectorAll<HTMLButtonElement>(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            const t = taches.find(x => x.id_tache === id);
            if (!t) return;

            qs<HTMLInputElement>("#tache-id").value = String(t.id_tache);
            qs<HTMLInputElement>("#tache-nom").value = t.Nom;
            qs<HTMLInputElement>("#tache-prev").value = String(t.temps_previsionnel);
            qs<HTMLInputElement>("#tache-passe").value = String(t.temps_passe);
            qs<HTMLInputElement>("#tache-debut").value = t.debut;
            qs<HTMLInputElement>("#tache-fin").value = t.fin ?? "";
            qs<HTMLInputElement>("#tache-statut").value = t.statut;
            qs<HTMLInputElement>("#tache-projet").value = String(t.id_projet);
            qs<HTMLInputElement>("#tache-salarie").value = String(t.id_salarie);

            qs<HTMLElement>("#tache-form-title").textContent = "Modifier une tâche";
        });
    });

    /* ----- DELETE ----- */
    section.querySelectorAll<HTMLButtonElement>(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = Number(btn.dataset.id);

            if (!confirm("Supprimer cette tâche ?")) return;

            try {
                await httpPostJSON("/api/taches/delete", { id_tache: id });
                toast("Tâche supprimée");
                loadTaches();
            } catch (err) {
                toast("Impossible de supprimer cette tâche.", "error");
            }
        });
    });
}

/* ============================================================
   FORMULAIRE
   ============================================================ */

export function setupTacheForm(): void {
    const form = qs<HTMLFormElement>("#tache-form");

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const id = qs<HTMLInputElement>("#tache-id").value;

        const data = {
            id_tache: id ? Number(id) : undefined,
            Nom: qs<HTMLInputElement>("#tache-nom").value.trim(),
            temps_previsionnel: Number(qs<HTMLInputElement>("#tache-prev").value),
            temps_passe: Number(qs<HTMLInputElement>("#tache-passe").value),
            debut: qs<HTMLInputElement>("#tache-debut").value,
            fin: qs<HTMLInputElement>("#tache-fin").value || null,
            statut: qs<HTMLInputElement>("#tache-statut").value.trim(),
            id_projet: Number(qs<HTMLInputElement>("#tache-projet").value),
            id_salarie: Number(qs<HTMLInputElement>("#tache-salarie").value)
        };

        if (!data.Nom || !data.debut || !data.id_projet || !data.id_salarie) {
            toast("Les champs Nom, Début, ID Projet et ID Salarié sont obligatoires", "error");
            return;
        }

        try {
            if (id) {
                await httpPostJSON("/api/taches/update", data);
                toast("Tâche mise à jour");
            } else {
                await httpPostJSON("/api/taches", data);
                toast("Tâche créée");
            }
        } catch (err) {
            toast(
                "Impossible d’enregistrer la tâche : l’ID projet ou l’ID salarié indiqué n’existe pas.",
                "error"
            );
            return;
        }

        form.reset();
        qs<HTMLElement>("#tache-form-title").textContent = "Créer une tâche";

        loadTaches();
    });

    qs("#tache-form-cancel").addEventListener("click", () => {
        form.reset();
        qs<HTMLElement>("#tache-form-title").textContent = "Créer une tâche";
    });
}

/* ============================================================
   EXPORT
   ============================================================ */

export function initTaches(): void {
    setupTacheForm();
    loadTaches();
}
