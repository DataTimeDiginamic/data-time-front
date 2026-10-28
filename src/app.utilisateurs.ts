import { API_BASE_URL, qs, isMobile, toast, httpGet, openDetailModal } from "./app.utils";

/* ============================================================
   ÉTAT LOCAL
   ============================================================ */
let utilisateurs: any[] = [];

/* ============================================================
   CHARGEMENT
   ============================================================ */
export async function loadUtilisateurs() {
    utilisateurs = await httpGet<any[]>("/api/utilisateurs");
    renderUtilisateurs();
}

/* ============================================================
   RENDU
   ============================================================ */
function renderUtilisateurs() {
    if (isMobile()) renderUtilisateurCards();
    else renderUtilisateurTable();
}

/* ---------- TABLE ---------- */
function renderUtilisateurTable() {
    const tbody = qs<HTMLTableSectionElement>("#utilisateur-table-body");
    tbody.innerHTML = "";

    utilisateurs.forEach(u => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${u.id_utilisateur}</td>
            <td>${u.nom}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>
                <button class="view-btn" data-id="${u.id_utilisateur}">👁️</button>
                <button class="edit-btn" data-id="${u.id_utilisateur}">✏️</button>
                <button class="delete-btn" data-id="${u.id_utilisateur}">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    setupUtilisateurActions();
}

/* ---------- CARDS ---------- */
function renderUtilisateurCards() {
    const container = qs<HTMLDivElement>("#utilisateur-cards");
    container.innerHTML = "";

    utilisateurs.forEach(u => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <p><strong>ID :</strong> ${u.id_utilisateur}</p>
            <p><strong>Nom :</strong> ${u.nom}</p>
            <p><strong>Email :</strong> ${u.email}</p>
            <p><strong>Rôle :</strong> ${u.role}</p>
            <div class="card-actions">
                <button class="view-btn" data-id="${u.id_utilisateur}">👁️</button>
                <button class="edit-btn" data-id="${u.id_utilisateur}">✏️</button>
                <button class="delete-btn" data-id="${u.id_utilisateur}">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });

    setupUtilisateurActions();
}

/* ============================================================
   ACTIONS (VIEW / EDIT / DELETE)
   ============================================================ */
function setupUtilisateurActions() {
    const section = qs<HTMLElement>("#section-utilisateurs");

    section.querySelectorAll<HTMLButtonElement>(".view-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = Number(btn.dataset.id);
            const u = await httpGet<any>(`/api/utilisateurs/${id}`);

            openDetailModal("Détail de l'utilisateur", `
                <p><strong>ID :</strong> ${u.id_utilisateur}</p>
                <p><strong>Nom :</strong> ${u.nom}</p>
                <p><strong>Email :</strong> ${u.email}</p>
                <p><strong>Rôle :</strong> ${u.role}</p>
            `);
        });
    });

    section.querySelectorAll<HTMLButtonElement>(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            const u = utilisateurs.find(x => x.id_utilisateur === id);
            if (!u) return;

            qs<HTMLInputElement>("#utilisateur-id").value = String(u.id_utilisateur);
            qs<HTMLInputElement>("#utilisateur-nom").value = u.nom;
            qs<HTMLInputElement>("#utilisateur-email").value = u.email;
            qs<HTMLSelectElement>("#utilisateur-role").value = u.role;
            qs<HTMLInputElement>("#utilisateur-password").value = "";
            qs<HTMLInputElement>("#utilisateur-password").required = false;
            qs("#utilisateur-form-title").textContent = "Modifier un utilisateur";
        });
    });

    section.querySelectorAll<HTMLButtonElement>(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = Number(btn.dataset.id);
            if (!confirm("Supprimer cet utilisateur ?")) return;

            // On n'utilise pas httpDelete : on veut afficher le message du serveur
            const res = await fetch(API_BASE_URL + `/api/utilisateurs/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            const data = await res.json();

            if (!res.ok) {
                toast(data.message ?? "Erreur", "error");
                return;
            }

            toast("Utilisateur supprimé");
            loadUtilisateurs();
        });
    });
}

/* ============================================================
   FORMULAIRE
   ============================================================ */
function resetUtilisateurForm() {
    qs<HTMLFormElement>("#utilisateur-form").reset();
    qs<HTMLInputElement>("#utilisateur-password").required = true;
    qs("#utilisateur-form-title").textContent = "Créer un utilisateur";
}

function setupUtilisateurForm() {
    const form = qs<HTMLFormElement>("#utilisateur-form");

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const id = qs<HTMLInputElement>("#utilisateur-id").value;

        const body = new FormData();
        body.append("nom", qs<HTMLInputElement>("#utilisateur-nom").value.trim());
        body.append("email", qs<HTMLInputElement>("#utilisateur-email").value.trim());
        body.append("mot_de_passe", qs<HTMLInputElement>("#utilisateur-password").value);
        body.append("role", qs<HTMLSelectElement>("#utilisateur-role").value);

        // Création : POST /api/utilisateurs — Modification : POST /api/utilisateurs/{id}
        const url = id ? `/api/utilisateurs/${id}` : "/api/utilisateurs";
        const res = await fetch(API_BASE_URL + url, {
            method: "POST",
            body: body,
            credentials: "include"
        });
        const data = await res.json();

        if (!res.ok) {
            // On affiche la première erreur de validation envoyée par le serveur
            const firstError = data.errors ? Object.values(data.errors)[0] : data.message;
            toast(String(firstError), "error");
            return;
        }

        toast(id ? "Utilisateur mis à jour" : "Utilisateur créé");
        resetUtilisateurForm();
        loadUtilisateurs();
    });

    qs("#utilisateur-form-cancel").addEventListener("click", resetUtilisateurForm);
}

/* ============================================================
   INIT
   ============================================================ */
export function initUtilisateurs() {
    setupUtilisateurForm();
    loadUtilisateurs();
}
