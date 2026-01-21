import {
    qs,
    httpGet,
    httpPostForm,
    toast,
    isMobile,
    API_BASE_URL
} from "./app.utils";

/* ============================================================
   TYPES
   ============================================================ */

export interface Salarie {
    id_salarie: number;
    nom: string;
    prenom: string;
    poste: string;
    contrat: string;
    taux_journalier_moyen: string;
    role: number;
}

/* ============================================================
   ÉTAT LOCAL
   ============================================================ */

let salaries: Salarie[] = [];

/* ============================================================
   CHARGEMENT
   ============================================================ */

export async function loadSalaries(): Promise<void> {
    const data = await httpGet<Salarie[]>("/api/salaries");
    salaries = data;
    renderSalaries();
}

/* ============================================================
   RENDU
   ============================================================ */

function renderSalaries(): void {
    if (isMobile()) renderSalarieCards();
    else renderSalarieTable();
}

/* ---------- TABLE ---------- */

function renderSalarieTable(): void {
    const tbody = qs<HTMLTableSectionElement>("#salarie-table-body");
    tbody.innerHTML = "";

    salaries.forEach(s => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${s.id_salarie}</td>
            <td>${s.nom}</td>
            <td>${s.prenom}</td>
            <td>${s.poste}</td>
            <td>${s.contrat}</td>
            <td>${s.taux_journalier_moyen}</td>
            <td>${s.role}</td>
            <td>
                <button class="edit-btn" data-id="${s.id_salarie}">✏️</button>
                <button class="delete-btn" data-id="${s.id_salarie}">🗑️</button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    setupSalarieActions();
}

/* ---------- CARDS ---------- */

function renderSalarieCards(): void {
    const container = qs<HTMLDivElement>("#salarie-cards");
    container.innerHTML = "";

    salaries.forEach(s => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <p><strong>ID :</strong> ${s.id_salarie}</p>
            <p><strong>Nom :</strong> ${s.nom}</p>
            <p><strong>Prénom :</strong> ${s.prenom}</p>
            <p><strong>Poste :</strong> ${s.poste}</p>
            <p><strong>Contrat :</strong> ${s.contrat}</p>
            <p><strong>TJM :</strong> ${s.taux_journalier_moyen}</p>
            <p><strong>Role :</strong> ${s.role}</p>
            <div class="card-actions">
                <button class="edit-btn" data-id="${s.id_salarie}">✏️</button>
                <button class="delete-btn" data-id="${s.id_salarie}">🗑️</button>
            </div>
        `;

        container.appendChild(div);
    });

    setupSalarieActions();
}

/* ============================================================
   ACTIONS (EDIT / DELETE)
   ============================================================ */

function setupSalarieActions(): void {
    const section = qs<HTMLElement>("#section-salaries");

    /* ----- EDIT ----- */
    section.querySelectorAll<HTMLButtonElement>(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            const s = salaries.find(x => x.id_salarie === id);
            if (!s) return;

            qs<HTMLInputElement>("#salarie-id").value = String(s.id_salarie);
            qs<HTMLInputElement>("#salarie-nom").value = s.nom;
            qs<HTMLInputElement>("#salarie-prenom").value = s.prenom;
            qs<HTMLInputElement>("#salarie-poste").value = s.poste;
            qs<HTMLInputElement>("#salarie-contrat").value = s.contrat;
            qs<HTMLInputElement>("#salarie-tjm").value = s.taux_journalier_moyen;
            qs<HTMLInputElement>("#salarie-role").value = String(s.role);

            qs<HTMLElement>("#salarie-form-title").textContent = "Modifier un salarié";
        });
    });

    /* ----- DELETE ----- */
    section.querySelectorAll<HTMLButtonElement>(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = Number(btn.dataset.id);

            if (!confirm("Supprimer ce salarié ?")) return;

            try {
                const res = await fetch(API_BASE_URL + `/api/salaries/${id}`, {
                    method: "DELETE"
                });

                if (!res.ok) {
                    toast("Impossible de supprimer ce salarié (peut-être utilisé ailleurs)", "error");
                    return;
                }

                toast("Salarié supprimé");
                loadSalaries();
            } catch (err) {
                toast("Erreur lors de la suppression du salarié", "error");
            }
        });
    });
}

/* ============================================================
   FORMULAIRE
   ============================================================ */

export function setupSalarieForm(): void {
    const form = qs<HTMLFormElement>("#salarie-form");

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const id = qs<HTMLInputElement>("#salarie-id").value;

        const data = {
            nom: qs<HTMLInputElement>("#salarie-nom").value.trim(),
            prenom: qs<HTMLInputElement>("#salarie-prenom").value.trim(),
            poste: qs<HTMLInputElement>("#salarie-poste").value.trim(),
            contrat: qs<HTMLInputElement>("#salarie-contrat").value.trim(),
            taux_journalier_moyen: qs<HTMLInputElement>("#salarie-tjm").value.trim(),
            role: qs<HTMLInputElement>("#salarie-role").value.trim()
        };

        if (!data.nom || !data.prenom || !data.poste || !data.contrat || !data.taux_journalier_moyen) {
            toast("Tous les champs sont obligatoires", "error");
            return;
        }

        try {
            if (id) {
                await httpPostForm(`/api/salaries/${id}`, data);
                toast("Salarié mis à jour");
            } else {
                await httpPostForm("/api/salaries", data);
                toast("Salarié créé");
            }
        } catch (err) {
            toast("Erreur lors de l'enregistrement du salarié", "error");
            return;
        }

        form.reset();
        qs<HTMLElement>("#salarie-form-title").textContent = "Créer un salarié";

        loadSalaries();
    });

    qs("#salarie-form-cancel").addEventListener("click", () => {
        form.reset();
        qs<HTMLElement>("#salarie-form-title").textContent = "Créer un salarié";
    });
}

/* ============================================================
   EXPORT
   ============================================================ */

export function initSalaries(): void {
    setupSalarieForm();
    loadSalaries();
}
