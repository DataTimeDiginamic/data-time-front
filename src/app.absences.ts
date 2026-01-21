import {
    qs,
    httpGet,
    httpPostJSON,
    httpPutJSON,
    httpDelete,
    toast,
    isMobile
} from "./app.utils";

/* ============================================================
   TYPES
   ============================================================ */

export interface Absence {
    id_absence: number;
    type: "conge" | "maladie";
    debut: string;
    fin: string | null;
    motif: string | null;
    id_salarie: number;
}

/* ============================================================
   ÉTAT LOCAL
   ============================================================ */

let absences: Absence[] = [];

/* ============================================================
   CHARGEMENT
   ============================================================ */

export async function loadAbsences(): Promise<void> {
    const data = await httpGet<{ success: boolean; data: Absence[] }>("/api/absences");
    absences = data.data;
    renderAbsences();
}

/* ============================================================
   RENDU
   ============================================================ */

function renderAbsences(): void {
    if (isMobile()) renderAbsenceCards();
    else renderAbsenceTable();
}

/* ---------- TABLE ---------- */

function renderAbsenceTable(): void {
    const tbody = qs<HTMLTableSectionElement>("#absence-table-body");
    tbody.innerHTML = "";

    absences.forEach(a => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${a.id_absence}</td>
            <td>${a.type}</td>
            <td>${a.debut}</td>
            <td>${a.fin ?? "-"}</td>
            <td>${a.motif ?? "-"}</td>
            <td>${a.id_salarie}</td>
            <td>
                <button class="edit-btn" data-id="${a.id_absence}">✏️</button>
                <button class="delete-btn" data-id="${a.id_absence}">🗑️</button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    setupAbsenceActions();
}

/* ---------- CARDS ---------- */

function renderAbsenceCards(): void {
    const container = qs<HTMLDivElement>("#absence-cards");
    container.innerHTML = "";

    absences.forEach(a => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <p><strong>ID :</strong> ${a.id_absence}</p>
            <p><strong>Type :</strong> ${a.type}</p>
            <p><strong>Début :</strong> ${a.debut}</p>
            <p><strong>Fin :</strong> ${a.fin ?? "-"}</p>
            <p><strong>Motif :</strong> ${a.motif ?? "-"}</p>
            <p><strong>ID Salarié :</strong> ${a.id_salarie}</p>
            <div class="card-actions">
                <button class="edit-btn" data-id="${a.id_absence}">✏️</button>
                <button class="delete-btn" data-id="${a.id_absence}">🗑️</button>
            </div>
        `;

        container.appendChild(div);
    });

    setupAbsenceActions();
}

/* ============================================================
   ACTIONS (EDIT / DELETE)
   ============================================================ */

function setupAbsenceActions(): void {
    const section = qs<HTMLElement>("#section-absences");

    /* ----- EDIT ----- */
    section.querySelectorAll<HTMLButtonElement>(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            const a = absences.find(x => x.id_absence === id);
            if (!a) return;

            qs<HTMLInputElement>("#absence-id").value = String(a.id_absence);
            qs<HTMLSelectElement>("#absence-type").value = a.type;
            qs<HTMLInputElement>("#absence-debut").value = a.debut;
            qs<HTMLInputElement>("#absence-fin").value = a.fin ?? "";
            qs<HTMLInputElement>("#absence-motif").value = a.motif ?? "";
            qs<HTMLInputElement>("#absence-salarie").value = String(a.id_salarie);

            qs<HTMLElement>("#absence-form-title").textContent = "Modifier une absence";
        });
    });

    /* ----- DELETE ----- */
    section.querySelectorAll<HTMLButtonElement>(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = Number(btn.dataset.id);

            if (!confirm("Supprimer cette absence ?")) return;

            try {
                await httpDelete(`/api/absences/${id}`);
                toast("Absence supprimée");
                loadAbsences();
            } catch (err) {
                toast("Impossible de supprimer cette absence.", "error");
            }
        });
    });
}

/* ============================================================
   FORMULAIRE
   ============================================================ */

export function setupAbsenceForm(): void {
    const form = qs<HTMLFormElement>("#absence-form");

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const id = qs<HTMLInputElement>("#absence-id").value;

        const data = {
            type: qs<HTMLSelectElement>("#absence-type").value,
            debut: qs<HTMLInputElement>("#absence-debut").value,
            fin: qs<HTMLInputElement>("#absence-fin").value || null,
            motif: qs<HTMLInputElement>("#absence-motif").value || null,
            id_salarie: Number(qs<HTMLInputElement>("#absence-salarie").value)
        };

        if (!data.debut || !data.id_salarie) {
            toast("Les champs Début et ID Salarié sont obligatoires", "error");
            return;
        }

        try {
            if (id) {
                await httpPutJSON(`/api/absences/${id}`, data);
                toast("Absence mise à jour");
            } else {
                await httpPostJSON("/api/absences", data);
                toast("Absence créée");
            }
        } catch (err) {
            // 🔥 Message clair si l’ID salarié n’existe pas
            toast(
                "Impossible d’enregistrer l’absence : l’ID salarié indiqué n’existe pas.",
                "error"
            );
            return;
        }

        form.reset();
        qs<HTMLElement>("#absence-form-title").textContent = "Créer une absence";

        loadAbsences();
    });

    qs("#absence-form-cancel").addEventListener("click", () => {
        form.reset();
        qs<HTMLElement>("#absence-form-title").textContent = "Créer une absence";
    });
}

/* ============================================================
   EXPORT
   ============================================================ */

export function initAbsences(): void {
    setupAbsenceForm();
    loadAbsences();
}
