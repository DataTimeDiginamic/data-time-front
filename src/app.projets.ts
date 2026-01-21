import { qs, qsa, isMobile, toast, httpGet, httpPostForm } from "./app.utils";

/* ============================================================
   ÉTAT LOCAL
   ============================================================ */
let projets: any[] = [];

/* ============================================================
   PARSING ROBUSTE
   ============================================================ */
function extractProjetList(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.results)) return data.results;
    console.warn("Format API inattendu (projets) :", data);
    return [];
}

/* ============================================================
   CHARGEMENT
   ============================================================ */
export async function loadProjets() {
    const data = await httpGet("/api/projet");
    projets = extractProjetList(data);
    renderProjets();
}

/* ============================================================
   RENDU
   ============================================================ */
function renderProjets() {
    if (isMobile()) renderProjetCards();
    else renderProjetTable();
}

/* ---------- TABLE ---------- */
function renderProjetTable() {
    const tbody = qs<HTMLTableSectionElement>("#projet-table-body");
    tbody.innerHTML = "";

    projets.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.id_projet}</td>
            <td>${p.nom}</td>
            <td>
                <button class="edit-btn" data-id="${p.id_projet}">✏️</button>
                <button class="delete-btn" data-id="${p.id_projet}">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    setupProjetActions();
}

/* ---------- CARDS ---------- */
function renderProjetCards() {
    const container = qs<HTMLDivElement>("#projet-cards");
    container.innerHTML = "";

    projets.forEach(p => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <p><strong>ID :</strong> ${p.id_projet}</p>
            <p><strong>Nom :</strong> ${p.nom}</p>
            <div class="card-actions">
                <button class="edit-btn" data-id="${p.id_projet}">✏️</button>
                <button class="delete-btn" data-id="${p.id_projet}">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });

    setupProjetActions();
}

/* ============================================================
   ACTIONS (EDIT / DELETE)
   ============================================================ */
function setupProjetActions() {
    qsa<HTMLButtonElement>(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            const projet = projets.find(p => p.id_projet === id);
            if (!projet) return;

            qs<HTMLInputElement>("#projet-id").value = String(projet.id_projet);
            qs<HTMLInputElement>("#projet-nom").value = projet.nom;
            qs("#projet-form-title").textContent = "Modifier un projet";
        });
    });

    qsa<HTMLButtonElement>(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = Number(btn.dataset.id);
            if (!confirm("Supprimer ce projet ?")) return;

            await httpPostForm("/api/projet/delete", { id });
            toast("Projet supprimé");
            loadProjets();
        });
    });
}

/* ============================================================
   FORMULAIRE
   ============================================================ */
function setupProjetForm() {
    const form = qs<HTMLFormElement>("#projet-form");

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const id = qs<HTMLInputElement>("#projet-id").value;
        const nom = qs<HTMLInputElement>("#projet-nom").value.trim();

        if (!nom) {
            toast("Le nom est obligatoire", "error");
            return;
        }

        if (id) {
            await httpPostForm("/api/projet/update", { id, nom });
            toast("Projet mis à jour");
        } else {
            await httpPostForm("/api/projet/add", { nom });
            toast("Projet créé");
        }

        form.reset();
        qs("#projet-form-title").textContent = "Créer un projet";
        loadProjets();
    });

    qs("#projet-form-cancel").addEventListener("click", () => {
        form.reset();
        qs("#projet-form-title").textContent = "Créer un projet";
    });
}

/* ============================================================
   RECHERCHE
   ============================================================ */
function setupProjetSearch() {
    const form = qs<HTMLFormElement>("#projet-search-form");

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const query = qs<HTMLInputElement>("#projet-search-query").value.trim();

        if (!query) {
            loadProjets();
            return;
        }

        const data = await httpGet(`/api/projet/nom/${encodeURIComponent(query)}`);
        projets = extractProjetList(data);

        renderProjets();
    });

    qs("#projet-search-reset").addEventListener("click", () => {
        qs<HTMLInputElement>("#projet-search-query").value = "";
        loadProjets();
    });
}

/* ============================================================
   EXPORT
   ============================================================ */
export function initProjets() {
    setupProjetForm();
    setupProjetSearch();
    loadProjets();
}
