import { qs, qsa, isMobile, toast, httpGet, httpPostForm } from "./app.utils";

/* ============================================================
   ÉTAT LOCAL
   ============================================================ */
let clients: any[] = [];

/* ============================================================
   PARSING ROBUSTE
   ============================================================ */
function extractClientList(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.results)) return data.results;
    console.warn("Format API inattendu (clients) :", data);
    return [];
}

/* ============================================================
   CHARGEMENT
   ============================================================ */
export async function loadClients() {
    const data = await httpGet("/api/client");
    clients = extractClientList(data);
    renderClients();
}

/* ============================================================
   RENDU
   ============================================================ */
function renderClients() {
    if (isMobile()) renderClientCards();
    else renderClientTable();
}

/* ---------- TABLE ---------- */
function renderClientTable() {
    const tbody = qs<HTMLTableSectionElement>("#client-table-body");
    tbody.innerHTML = "";

    clients.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${c.id_client}</td>
            <td>${c.nom}</td>
            <td>
                <button class="edit-btn" data-id="${c.id_client}">✏️</button>
                <button class="delete-btn" data-id="${c.id_client}">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    setupClientActions();
}

/* ---------- CARDS ---------- */
function renderClientCards() {
    const container = qs<HTMLDivElement>("#client-cards");
    container.innerHTML = "";

    clients.forEach(c => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <p><strong>ID :</strong> ${c.id_client}</p>
            <p><strong>Nom :</strong> ${c.nom}</p>
            <div class="card-actions">
                <button class="edit-btn" data-id="${c.id_client}">✏️</button>
                <button class="delete-btn" data-id="${c.id_client}">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });

    setupClientActions();
}

/* ============================================================
   ACTIONS (EDIT / DELETE)
   ============================================================ */
function setupClientActions() {
    qsa<HTMLButtonElement>(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            const client = clients.find(c => c.id_client === id);
            if (!client) return;

            qs<HTMLInputElement>("#client-id").value = String(client.id_client);
            qs<HTMLInputElement>("#client-nom").value = client.nom;
            qs("#client-form-title").textContent = "Modifier un client";
        });
    });

    qsa<HTMLButtonElement>(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = Number(btn.dataset.id);
            if (!confirm("Supprimer ce client ?")) return;

            await httpPostForm("/api/client/delete", { id });
            toast("Client supprimé");
            loadClients();
        });
    });
}

/* ============================================================
   FORMULAIRE
   ============================================================ */
function setupClientForm() {
    const form = qs<HTMLFormElement>("#client-form");

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const id = qs<HTMLInputElement>("#client-id").value;
        const nom = qs<HTMLInputElement>("#client-nom").value.trim();

        if (!nom) {
            toast("Le nom est obligatoire", "error");
            return;
        }

        if (id) {
            await httpPostForm("/api/client/update", { id, nom });
            toast("Client mis à jour");
        } else {
            await httpPostForm("/api/client/add", { nom });
            toast("Client créé");
        }

        form.reset();
        qs("#client-form-title").textContent = "Créer un client";
        loadClients();
    });

    qs("#client-form-cancel").addEventListener("click", () => {
        form.reset();
        qs("#client-form-title").textContent = "Créer un client";
    });
}

/* ============================================================
   RECHERCHE
   ============================================================ */
function setupClientSearch() {
    const form = qs<HTMLFormElement>("#client-search-form");

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const query = qs<HTMLInputElement>("#client-search-query").value.trim();

        if (!query) {
            loadClients();
            return;
        }

        const data = await httpGet(`/api/client/nom/${encodeURIComponent(query)}`);
        clients = extractClientList(data);

        renderClients();
    });

    qs("#client-search-reset").addEventListener("click", () => {
        qs<HTMLInputElement>("#client-search-query").value = "";
        loadClients();
    });
}

/* ============================================================
   EXPORT
   ============================================================ */
export function initClients() {
    setupClientForm();
    setupClientSearch();
    loadClients();
}
