// ============================
// CONFIG API
// ============================

const API_BASE = "http://localhost:8000/api";

// CLIENT ROUTES
const CLIENT_LIST_URL = `${API_BASE}/client`;
const CLIENT_BY_NOM_URL = (nom: string) =>
    `${API_BASE}/client/nom/${encodeURIComponent(nom)}`;
const CLIENT_ADD_URL = `${API_BASE}/client/add`;
const CLIENT_UPDATE_URL = `${API_BASE}/client/update`;
const CLIENT_DELETE_URL = `${API_BASE}/client/delete`;

// PROJET ROUTES
const PROJET_LIST_URL = `${API_BASE}/projet`;
const PROJET_BY_NOM_URL = (nom: string) =>
    `${API_BASE}/projet/nom/${encodeURIComponent(nom)}`;
const PROJET_ADD_URL = `${API_BASE}/projet/add`;
const PROJET_UPDATE_URL = `${API_BASE}/projet/update`;
const PROJET_DELETE_URL = `${API_BASE}/projet/delete`;

// ============================
// TYPES
// ============================

interface Client {
    id_client: number;
    nom: string;
}

interface Projet {
    id_projet: number;
    nom: string;
}

// ============================
// TOAST NOTIFICATIONS
// ============================

function toast(message: string, type: "success" | "error" = "success"): void {
    const container = document.getElementById("toast-container")!;
    const div = document.createElement("div");
    div.className = `toast ${type}`;
    div.textContent = message;

    container.appendChild(div);

    setTimeout(() => div.remove(), 3500);
}

// ============================
// FETCH HELPERS
// ============================

async function httpGet<T>(url: string): Promise<T> {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            toast(`Erreur serveur (${response.status})`, "error");
            throw new Error(`GET ${url} -> ${response.status}`);
        }

        const data = await response.json();

        if (data && data.ok === false) {
            toast(data.message ?? "Erreur", "error");
            throw new Error(data.message);
        }

        return data;
    } catch (err) {
        toast("Erreur réseau : impossible de contacter le serveur", "error");
        throw err;
    }
}

async function httpPost<T>(url: string, body: Record<string, any>): Promise<T> {
    try {
        const formData = new FormData();
        for (const key in body) {
            formData.append(key, body[key]);
        }

        const response = await fetch(url, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            toast(`Erreur serveur (${response.status})`, "error");
            throw new Error(`POST ${url} -> ${response.status}`);
        }

        const data = await response.json();

        if (data && data.ok === false) {
            const msg =
                data.message ??
                (data.errors ? Object.values(data.errors).join(", ") : "Erreur");
            toast(msg, "error");
            throw new Error(msg);
        }

        return data;
    } catch (err) {
        toast("Erreur réseau : impossible de contacter le serveur", "error");
        throw err;
    }
}

// ============================
// RESPONSIVE HELPERS
// ============================

function isMobile(): boolean {
    return window.innerWidth <= 768;
}

// ============================
// CLIENTS
// ============================

const clientTableBody = document.getElementById(
    "client-table-body"
) as HTMLTableSectionElement;
const clientCardsContainer = document.getElementById(
    "client-cards"
) as HTMLDivElement;

const clientForm = document.getElementById("client-form") as HTMLFormElement;
const clientFormTitle = document.getElementById(
    "client-form-title"
) as HTMLHeadingElement;
const clientIdInput = document.getElementById("client-id") as HTMLInputElement;
const clientNomInput = document.getElementById(
    "client-nom"
) as HTMLInputElement;
const clientFormCancel = document.getElementById(
    "client-form-cancel"
) as HTMLButtonElement;

const clientSearchForm = document.getElementById(
    "client-search-form"
) as HTMLFormElement;
const clientSearchQueryInput = document.getElementById(
    "client-search-query"
) as HTMLInputElement;
const clientSearchReset = document.getElementById(
    "client-search-reset"
) as HTMLButtonElement;

async function loadClients(query?: string): Promise<void> {
    try {
        let clients: Client[];

        if (query && query.trim().length > 0) {
            const nom = query.trim();
            const result = await httpGet<any>(CLIENT_BY_NOM_URL(nom));
            clients = result.ok ? result.results : [];
        } else {
            clients = await httpGet<Client[]>(CLIENT_LIST_URL);
        }

        if (isMobile()) {
            renderClientCards(clients);
            clientTableBody.innerHTML = "";
        } else {
            renderClientTable(clients);
            clientCardsContainer.innerHTML = "";
        }
    } catch (error) {
        console.error("Erreur lors du chargement des clients", error);
    }
}

function renderClientTable(clients: Client[]): void {
    clientTableBody.innerHTML = "";

    for (const client of clients) {
        const tr = document.createElement("tr");

        tr.innerHTML = `
      <td>${client.id_client}</td>
      <td>${client.nom}</td>
      <td class="actions">
        <button class="edit-btn">Modifier</button>
        <button class="danger delete-btn">Supprimer</button>
      </td>
    `;

        tr
            .querySelector(".edit-btn")!
            .addEventListener("click", () => fillClientFormForEdit(client));
        tr
            .querySelector(".delete-btn")!
            .addEventListener("click", () => deleteClient(client.id_client));

        clientTableBody.appendChild(tr);
    }
}

function renderClientCards(clients: Client[]): void {
    clientCardsContainer.innerHTML = "";

    for (const client of clients) {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
      <div class="card-title">${client.nom}</div>
      <div class="card-id">ID : ${client.id_client}</div>
      <div class="card-actions">
        <button class="edit-btn">Modifier</button>
        <button class="danger delete-btn">Supprimer</button>
      </div>
    `;

        card
            .querySelector(".edit-btn")!
            .addEventListener("click", () => fillClientFormForEdit(client));
        card
            .querySelector(".delete-btn")!
            .addEventListener("click", () => deleteClient(client.id_client));

        clientCardsContainer.appendChild(card);
    }
}

function resetClientForm(): void {
    clientForm.reset();
    clientIdInput.value = "";
    clientFormTitle.textContent = "Créer un client";
}

function fillClientFormForEdit(client: Client): void {
    clientIdInput.value = String(client.id_client);
    clientNomInput.value = client.nom;
    clientFormTitle.textContent = `Modifier le client #${client.id_client}`;
}

async function deleteClient(id_client: number): Promise<void> {
    if (!confirm(`Supprimer le client #${id_client} ?`)) return;

    try {
        await httpPost(CLIENT_DELETE_URL, { id: id_client });
        toast("Client supprimé");
        await loadClients(clientSearchQueryInput.value);
    } catch (error) {
        console.error("Erreur suppression client", error);
    }
}

clientForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const idValue = clientIdInput.value.trim();
    const nom = clientNomInput.value.trim();

    if (!nom) {
        toast("Le nom est obligatoire", "error");
        return;
    }

    try {
        if (idValue) {
            await httpPost(CLIENT_UPDATE_URL, { id: Number(idValue), nom });
            toast("Client mis à jour");
        } else {
            await httpPost(CLIENT_ADD_URL, { nom });
            toast("Client créé");
        }

        resetClientForm();
        await loadClients(clientSearchQueryInput.value);
    } catch (error) {
        console.error("Erreur enregistrement client", error);
    }
});

clientFormCancel.addEventListener("click", resetClientForm);

clientSearchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await loadClients(clientSearchQueryInput.value);
});

clientSearchReset.addEventListener("click", async () => {
    clientSearchQueryInput.value = "";
    await loadClients();
});

// ============================
// PROJETS
// ============================

const projetTableBody = document.getElementById(
    "projet-table-body"
) as HTMLTableSectionElement;
const projetCardsContainer = document.getElementById(
    "projet-cards"
) as HTMLDivElement;

const projetForm = document.getElementById("projet-form") as HTMLFormElement;
const projetFormTitle = document.getElementById(
    "projet-form-title"
) as HTMLHeadingElement;
const projetIdInput = document.getElementById(
    "projet-id"
) as HTMLInputElement;
const projetNomInput = document.getElementById(
    "projet-nom"
) as HTMLInputElement;
const projetFormCancel = document.getElementById(
    "projet-form-cancel"
) as HTMLButtonElement;

const projetSearchForm = document.getElementById(
    "projet-search-form"
) as HTMLFormElement;
const projetSearchQueryInput = document.getElementById(
    "projet-search-query"
) as HTMLInputElement;
const projetSearchReset = document.getElementById(
    "projet-search-reset"
) as HTMLButtonElement;

async function loadProjets(query?: string): Promise<void> {
    try {
        let projets: Projet[];

        if (query && query.trim().length > 0) {
            const nom = query.trim();
            const result = await httpGet<any>(PROJET_BY_NOM_URL(nom));
            projets = result.ok ? result.results : [];
        } else {
            projets = await httpGet<Projet[]>(PROJET_LIST_URL);
        }

        if (isMobile()) {
            renderProjetCards(projets);
            projetTableBody.innerHTML = "";
        } else {
            renderProjetTable(projets);
            projetCardsContainer.innerHTML = "";
        }
    } catch (error) {
        console.error("Erreur chargement projets", error);
    }
}

function renderProjetTable(projets: Projet[]): void {
    projetTableBody.innerHTML = "";

    for (const projet of projets) {
        const tr = document.createElement("tr");

        tr.innerHTML = `
      <td>${projet.id_projet}</td>
      <td>${projet.nom}</td>
      <td class="actions">
        <button class="edit-btn">Modifier</button>
        <button class="danger delete-btn">Supprimer</button>
      </td>
    `;

        tr
            .querySelector(".edit-btn")!
            .addEventListener("click", () => fillProjetFormForEdit(projet));
        tr
            .querySelector(".delete-btn")!
            .addEventListener("click", () => deleteProjet(projet.id_projet));

        projetTableBody.appendChild(tr);
    }
}

function renderProjetCards(projets: Projet[]): void {
    projetCardsContainer.innerHTML = "";

    for (const projet of projets) {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
      <div class="card-title">${projet.nom}</div>
      <div class="card-id">ID : ${projet.id_projet}</div>
      <div class="card-actions">
        <button class="edit-btn">Modifier</button>
        <button class="danger delete-btn">Supprimer</button>
      </div>
    `;

        card
            .querySelector(".edit-btn")!
            .addEventListener("click", () => fillProjetFormForEdit(projet));
        card
            .querySelector(".delete-btn")!
            .addEventListener("click", () => deleteProjet(projet.id_projet));

        projetCardsContainer.appendChild(card);
    }
}

function resetProjetForm(): void {
    projetForm.reset();
    projetIdInput.value = "";
    projetFormTitle.textContent = "Créer un projet";
}

function fillProjetFormForEdit(projet: Projet): void {
    projetIdInput.value = String(projet.id_projet);
    projetNomInput.value = projet.nom;
    projetFormTitle.textContent = `Modifier le projet #${projet.id_projet}`;
}

async function deleteProjet(id_projet: number): Promise<void> {
    if (!confirm(`Supprimer le projet #${id_projet} ?`)) return;

    try {
        await httpPost(PROJET_DELETE_URL, { id: id_projet });
        toast("Projet supprimé");
        await loadProjets(projetSearchQueryInput.value);
    } catch (error) {
        console.error("Erreur suppression projet", error);
    }
}

projetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const idValue = projetIdInput.value.trim();
    const nom = projetNomInput.value.trim();

    if (!nom) {
        toast("Le nom est obligatoire", "error");
        return;
    }

    try {
        if (idValue) {
            await httpPost(PROJET_UPDATE_URL, { id: Number(idValue), nom });
            toast("Projet mis à jour");
        } else {
            await httpPost(PROJET_ADD_URL, { nom });
            toast("Projet créé");
        }

        resetProjetForm();
        await loadProjets(projetSearchQueryInput.value);
    } catch (error) {
        console.error("Erreur enregistrement projet", error);
    }
});

projetFormCancel.addEventListener("click", resetProjetForm);

projetSearchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await loadProjets(projetSearchQueryInput.value);
});

projetSearchReset.addEventListener("click", async () => {
    projetSearchQueryInput.value = "";
    await loadProjets();
});

// ============================
// TABS + TRANSITIONS
// ============================

const tabClientsBtn = document.getElementById(
    "tab-clients"
) as HTMLButtonElement;
const tabProjetsBtn = document.getElementById(
    "tab-projets"
) as HTMLButtonElement;

const sectionClients = document.getElementById(
    "section-clients"
) as HTMLElement;
const sectionProjets = document.getElementById(
    "section-projets"
) as HTMLElement;

function showClientsTab(): void {
    tabClientsBtn.classList.add("active");
    tabProjetsBtn.classList.remove("active");

    sectionClients.classList.add("active-section");
    sectionProjets.classList.remove("active-section");

    sectionClients.classList.remove("hidden");
    sectionProjets.classList.add("hidden");
}

function showProjetsTab(): void {
    tabProjetsBtn.classList.add("active");
    tabClientsBtn.classList.remove("active");

    sectionProjets.classList.add("active-section");
    sectionClients.classList.remove("active-section");

    sectionProjets.classList.remove("hidden");
    sectionClients.classList.add("hidden");
}

tabClientsBtn.addEventListener("click", showClientsTab);
tabProjetsBtn.addEventListener("click", showProjetsTab);

// ============================
// INIT
// ============================

async function init(): Promise<void> {
    await loadClients();
    await loadProjets();

    window.addEventListener("resize", () => {
        void loadClients(clientSearchQueryInput.value);
        void loadProjets(projetSearchQueryInput.value);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    void init();
});
