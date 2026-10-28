/* ============================================================
   CONFIG API
   ============================================================ */
define("app.utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.API_BASE_URL = void 0;
    exports.toast = toast;
    exports.httpGet = httpGet;
    exports.httpPostForm = httpPostForm;
    exports.httpPostJSON = httpPostJSON;
    exports.httpPutJSON = httpPutJSON;
    exports.httpDelete = httpDelete;
    exports.openDetailModal = openDetailModal;
    exports.closeDetailModal = closeDetailModal;
    exports.setupDetailModal = setupDetailModal;
    exports.isMobile = isMobile;
    exports.qs = qs;
    exports.qsa = qsa;
    exports.setupTabs = setupTabs;
    exports.setupResponsiveRerender = setupResponsiveRerender;
    // L'API tourne sur Laragon (Apache). Avec "php -S localhost:8000 -t public", mettre "http://localhost:8000".
    exports.API_BASE_URL = "http://localhost/datatime/game-catalog/public";
    /* ============================================================
       UTILITAIRES GLOBAUX
       ============================================================ */
    /** Affiche un toast visuel */
    function toast(message, type = "success") {
        const container = document.getElementById("toast-container");
        if (!container)
            return;
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
    function statusMessage(status) {
        if (status === 401)
            return "Session expirée : veuillez vous reconnecter";
        if (status === 403)
            return "Action interdite pour votre rôle";
        return `Erreur serveur (${status})`;
    }
    /** GET JSON */
    async function httpGet(url) {
        try {
            const res = await fetch(exports.API_BASE_URL + url, { credentials: "include" });
            if (!res.ok) {
                toast(statusMessage(res.status), "error");
                throw new Error(`GET ${url} -> ${res.status}`);
            }
            return await res.json();
        }
        catch (err) {
            // Une erreur serveur (401, 403...) a déjà affiché son message : on n'ajoute pas "Erreur réseau"
            if (err instanceof TypeError) {
                toast("Erreur réseau : impossible de contacter le serveur", "error");
            }
            throw err;
        }
    }
    /** POST FormData (Client / Projet / Salarie) */
    async function httpPostForm(url, data) {
        try {
            const form = new FormData();
            for (const key in data)
                form.append(key, data[key]);
            const res = await fetch(exports.API_BASE_URL + url, {
                method: "POST",
                body: form,
                credentials: "include"
            });
            if (!res.ok) {
                toast(statusMessage(res.status), "error");
                throw new Error(`POST ${url} -> ${res.status}`);
            }
            return await res.json();
        }
        catch (err) {
            // Une erreur serveur (401, 403...) a déjà affiché son message : on n'ajoute pas "Erreur réseau"
            if (err instanceof TypeError) {
                toast("Erreur réseau : impossible de contacter le serveur", "error");
            }
            throw err;
        }
    }
    /** POST JSON (Absence / Tache) */
    async function httpPostJSON(url, data) {
        try {
            const res = await fetch(exports.API_BASE_URL + url, {
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
        }
        catch (err) {
            // Une erreur serveur (401, 403...) a déjà affiché son message : on n'ajoute pas "Erreur réseau"
            if (err instanceof TypeError) {
                toast("Erreur réseau : impossible de contacter le serveur", "error");
            }
            throw err;
        }
    }
    /** PUT JSON (Absence update) */
    async function httpPutJSON(url, data) {
        try {
            const res = await fetch(exports.API_BASE_URL + url, {
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
        }
        catch (err) {
            // Une erreur serveur (401, 403...) a déjà affiché son message : on n'ajoute pas "Erreur réseau"
            if (err instanceof TypeError) {
                toast("Erreur réseau : impossible de contacter le serveur", "error");
            }
            throw err;
        }
    }
    /** DELETE JSON (Absence delete) */
    async function httpDelete(url) {
        try {
            const res = await fetch(exports.API_BASE_URL + url, { method: "DELETE", credentials: "include" });
            if (!res.ok) {
                toast(statusMessage(res.status), "error");
                throw new Error(`DELETE ${url} -> ${res.status}`);
            }
        }
        catch (err) {
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
    function openDetailModal(title, bodyHtml) {
        qs("#detail-modal-title").textContent = title;
        qs("#detail-modal-body").innerHTML = bodyHtml;
        qs("#detail-modal").classList.remove("hidden");
    }
    function closeDetailModal() {
        qs("#detail-modal").classList.add("hidden");
    }
    function setupDetailModal() {
        qs("#detail-modal-close").addEventListener("click", closeDetailModal);
    }
    /* ============================================================
       RESPONSIVE
       ============================================================ */
    function isMobile() {
        return window.innerWidth <= 768;
    }
    /* ============================================================
       DOM HELPERS
       ============================================================ */
    function qs(selector) {
        const el = document.querySelector(selector);
        if (!el)
            throw new Error(`Élément introuvable : ${selector}`);
        return el;
    }
    function qsa(selector) {
        return Array.from(document.querySelectorAll(selector));
    }
    /* ============================================================
       TABS (onglets)
       ============================================================ */
    function setupTabs(tabMap) {
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
    function setupResponsiveRerender(callback) {
        window.addEventListener("resize", () => callback());
    }
});
define("app.absences", ["require", "exports", "app.utils"], function (require, exports, app_utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadAbsences = loadAbsences;
    exports.setupAbsenceForm = setupAbsenceForm;
    exports.initAbsences = initAbsences;
    /* ============================================================
       ÉTAT LOCAL
       ============================================================ */
    let absences = [];
    /* ============================================================
       CHARGEMENT
       ============================================================ */
    async function loadAbsences() {
        const data = await (0, app_utils_1.httpGet)("/api/absences");
        absences = data.data;
        renderAbsences();
    }
    /* ============================================================
       RENDU
       ============================================================ */
    function renderAbsences() {
        if ((0, app_utils_1.isMobile)())
            renderAbsenceCards();
        else
            renderAbsenceTable();
    }
    /* ---------- TABLE ---------- */
    function renderAbsenceTable() {
        const tbody = (0, app_utils_1.qs)("#absence-table-body");
        tbody.innerHTML = "";
        absences.forEach(a => {
            var _a, _b;
            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td>${a.id_absence}</td>
            <td>${a.type}</td>
            <td>${a.debut}</td>
            <td>${(_a = a.fin) !== null && _a !== void 0 ? _a : "-"}</td>
            <td>${(_b = a.motif) !== null && _b !== void 0 ? _b : "-"}</td>
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
    function renderAbsenceCards() {
        const container = (0, app_utils_1.qs)("#absence-cards");
        container.innerHTML = "";
        absences.forEach(a => {
            var _a, _b;
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `
            <p><strong>ID :</strong> ${a.id_absence}</p>
            <p><strong>Type :</strong> ${a.type}</p>
            <p><strong>Début :</strong> ${a.debut}</p>
            <p><strong>Fin :</strong> ${(_a = a.fin) !== null && _a !== void 0 ? _a : "-"}</p>
            <p><strong>Motif :</strong> ${(_b = a.motif) !== null && _b !== void 0 ? _b : "-"}</p>
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
    function setupAbsenceActions() {
        const section = (0, app_utils_1.qs)("#section-absences");
        /* ----- EDIT ----- */
        section.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                var _a, _b;
                const id = Number(btn.dataset.id);
                const a = absences.find(x => x.id_absence === id);
                if (!a)
                    return;
                (0, app_utils_1.qs)("#absence-id").value = String(a.id_absence);
                (0, app_utils_1.qs)("#absence-type").value = a.type;
                (0, app_utils_1.qs)("#absence-debut").value = a.debut;
                (0, app_utils_1.qs)("#absence-fin").value = (_a = a.fin) !== null && _a !== void 0 ? _a : "";
                (0, app_utils_1.qs)("#absence-motif").value = (_b = a.motif) !== null && _b !== void 0 ? _b : "";
                (0, app_utils_1.qs)("#absence-salarie").value = String(a.id_salarie);
                (0, app_utils_1.qs)("#absence-form-title").textContent = "Modifier une absence";
            });
        });
        /* ----- DELETE ----- */
        section.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = Number(btn.dataset.id);
                if (!confirm("Supprimer cette absence ?"))
                    return;
                try {
                    await (0, app_utils_1.httpDelete)(`/api/absences/${id}`);
                    (0, app_utils_1.toast)("Absence supprimée");
                    loadAbsences();
                }
                catch (err) {
                    (0, app_utils_1.toast)("Impossible de supprimer cette absence.", "error");
                }
            });
        });
    }
    /* ============================================================
       FORMULAIRE
       ============================================================ */
    function setupAbsenceForm() {
        const form = (0, app_utils_1.qs)("#absence-form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = (0, app_utils_1.qs)("#absence-id").value;
            const data = {
                type: (0, app_utils_1.qs)("#absence-type").value,
                debut: (0, app_utils_1.qs)("#absence-debut").value,
                fin: (0, app_utils_1.qs)("#absence-fin").value || null,
                motif: (0, app_utils_1.qs)("#absence-motif").value || null,
                id_salarie: Number((0, app_utils_1.qs)("#absence-salarie").value)
            };
            if (!data.debut || !data.id_salarie) {
                (0, app_utils_1.toast)("Les champs Début et ID Salarié sont obligatoires", "error");
                return;
            }
            try {
                if (id) {
                    await (0, app_utils_1.httpPutJSON)(`/api/absences/${id}`, data);
                    (0, app_utils_1.toast)("Absence mise à jour");
                }
                else {
                    await (0, app_utils_1.httpPostJSON)("/api/absences", data);
                    (0, app_utils_1.toast)("Absence créée");
                }
            }
            catch (err) {
                // 🔥 Message clair si l’ID salarié n’existe pas
                (0, app_utils_1.toast)("Impossible d’enregistrer l’absence : l’ID salarié indiqué n’existe pas.", "error");
                return;
            }
            form.reset();
            (0, app_utils_1.qs)("#absence-form-title").textContent = "Créer une absence";
            loadAbsences();
        });
        (0, app_utils_1.qs)("#absence-form-cancel").addEventListener("click", () => {
            form.reset();
            (0, app_utils_1.qs)("#absence-form-title").textContent = "Créer une absence";
        });
    }
    /* ============================================================
       EXPORT
       ============================================================ */
    function initAbsences() {
        setupAbsenceForm();
        loadAbsences();
    }
});
/* ============================================================
   AUTHENTIFICATION (connexion / déconnexion)
   ============================================================ */
define("app.auth", ["require", "exports", "app.utils"], function (require, exports, app_utils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkSession = checkSession;
    exports.setupAuth = setupAuth;
    /** Affiche seulement les onglets autorisés pour le rôle, et ouvre le premier */
    function showTabs(role) {
        let tabs = ["tab-clients", "tab-projets", "tab-salaries", "tab-absences", "tab-taches"];
        if (role === "client") {
            tabs = ["tab-projets", "tab-taches"];
        }
        if (role === "admin") {
            tabs.push("tab-utilisateurs");
        }
        const allTabs = ["tab-clients", "tab-projets", "tab-salaries", "tab-absences", "tab-taches", "tab-utilisateurs"];
        allTabs.forEach(id => {
            (0, app_utils_2.qs)("#" + id).classList.toggle("hidden", !tabs.includes(id));
        });
        (0, app_utils_2.qs)("#" + tabs[0]).click();
    }
    /** Affiche l'application ou le formulaire de connexion */
    function showApp(connected, nom = "", role = "") {
        if (connected) {
            (0, app_utils_2.qs)("#login-section").classList.add("hidden");
            (0, app_utils_2.qs)("#app-content").classList.remove("hidden");
            (0, app_utils_2.qs)("#user-nom").textContent = `${nom} (${role})`;
            showTabs(role);
        }
        else {
            (0, app_utils_2.qs)("#login-section").classList.remove("hidden");
            (0, app_utils_2.qs)("#app-content").classList.add("hidden");
        }
    }
    /** Vérifie si une session est déjà ouverte côté serveur : retourne le rôle, ou "" si non connecté */
    async function checkSession() {
        try {
            const res = await fetch(app_utils_2.API_BASE_URL + "/api/me", { credentials: "include" });
            if (!res.ok) {
                showApp(false);
                return "";
            }
            const data = await res.json();
            showApp(true, data.user.nom, data.user.role);
            return data.user.role;
        }
        catch (err) {
            showApp(false);
            (0, app_utils_2.toast)("Erreur réseau : impossible de contacter le serveur", "error");
            return "";
        }
    }
    /** Branche le formulaire de connexion et le bouton de déconnexion */
    function setupAuth(onLogin) {
        (0, app_utils_2.qs)("#login-form").addEventListener("submit", async (e) => {
            var _a;
            e.preventDefault();
            const email = (0, app_utils_2.qs)("#login-email").value;
            const motDePasse = (0, app_utils_2.qs)("#login-password").value;
            // On n'utilise pas httpPostForm : un 401 (mauvais mot de passe) est un cas normal
            const form = new FormData();
            form.append("email", email);
            form.append("mot_de_passe", motDePasse);
            const res = await fetch(app_utils_2.API_BASE_URL + "/api/login", {
                method: "POST",
                body: form,
                credentials: "include"
            });
            const data = await res.json();
            if (!res.ok) {
                (0, app_utils_2.toast)((_a = data.message) !== null && _a !== void 0 ? _a : "Veuillez remplir tous les champs", "error");
                return;
            }
            (0, app_utils_2.toast)("Connexion réussie");
            (0, app_utils_2.qs)("#login-form").reset();
            showApp(true, data.user.nom, data.user.role);
            onLogin(data.user.role);
        });
        (0, app_utils_2.qs)("#logout-btn").addEventListener("click", async () => {
            await (0, app_utils_2.httpPostForm)("/api/logout", {});
            // On recharge la page : elle repart de zéro et affiche le formulaire de connexion
            location.reload();
        });
    }
});
define("app.clients", ["require", "exports", "app.utils"], function (require, exports, app_utils_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadClients = loadClients;
    exports.initClients = initClients;
    /* ============================================================
       ÉTAT LOCAL
       ============================================================ */
    let clients = [];
    /* ============================================================
       PARSING ROBUSTE
       ============================================================ */
    function extractClientList(data) {
        if (Array.isArray(data))
            return data;
        if (data && Array.isArray(data.data))
            return data.data;
        if (data && Array.isArray(data.results))
            return data.results;
        console.warn("Format API inattendu (clients) :", data);
        return [];
    }
    /* ============================================================
       CHARGEMENT
       ============================================================ */
    async function loadClients() {
        const data = await (0, app_utils_3.httpGet)("/api/client");
        clients = extractClientList(data);
        renderClients();
    }
    /* ============================================================
       RENDU
       ============================================================ */
    function renderClients() {
        if ((0, app_utils_3.isMobile)())
            renderClientCards();
        else
            renderClientTable();
    }
    /* ---------- TABLE ---------- */
    function renderClientTable() {
        const tbody = (0, app_utils_3.qs)("#client-table-body");
        tbody.innerHTML = "";
        clients.forEach(c => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td>${c.id_client}</td>
            <td>${c.nom}</td>
            <td>
                <button class="view-btn" data-id="${c.id_client}">👁️</button>
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
        const container = (0, app_utils_3.qs)("#client-cards");
        container.innerHTML = "";
        clients.forEach(c => {
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `
            <p><strong>ID :</strong> ${c.id_client}</p>
            <p><strong>Nom :</strong> ${c.nom}</p>
            <div class="card-actions">
                <button class="view-btn" data-id="${c.id_client}">👁️</button>
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
        const section = (0, app_utils_3.qs)("#section-clients");
        section.querySelectorAll(".view-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = Number(btn.dataset.id);
                const client = await (0, app_utils_3.httpGet)(`/api/client/id/${id}`);
                (0, app_utils_3.openDetailModal)("Détail du client", `
                <p><strong>ID :</strong> ${client.id_client}</p>
                <p><strong>Nom :</strong> ${client.nom}</p>
            `);
            });
        });
        section.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = Number(btn.dataset.id);
                const client = clients.find(c => c.id_client === id);
                if (!client)
                    return;
                (0, app_utils_3.qs)("#client-id").value = String(client.id_client);
                (0, app_utils_3.qs)("#client-nom").value = client.nom;
                (0, app_utils_3.qs)("#client-form-title").textContent = "Modifier un client";
            });
        });
        section.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = Number(btn.dataset.id);
                if (!confirm("Supprimer ce client ?"))
                    return;
                await (0, app_utils_3.httpPostForm)("/api/client/delete", { id });
                (0, app_utils_3.toast)("Client supprimé");
                loadClients();
            });
        });
    }
    /* ============================================================
       FORMULAIRE
       ============================================================ */
    function setupClientForm() {
        const form = (0, app_utils_3.qs)("#client-form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = (0, app_utils_3.qs)("#client-id").value;
            const nom = (0, app_utils_3.qs)("#client-nom").value.trim();
            if (!nom) {
                (0, app_utils_3.toast)("Le nom est obligatoire", "error");
                return;
            }
            if (id) {
                await (0, app_utils_3.httpPostForm)("/api/client/update", { id, nom });
                (0, app_utils_3.toast)("Client mis à jour");
            }
            else {
                await (0, app_utils_3.httpPostForm)("/api/client/add", { nom });
                (0, app_utils_3.toast)("Client créé");
            }
            form.reset();
            (0, app_utils_3.qs)("#client-form-title").textContent = "Créer un client";
            loadClients();
        });
        (0, app_utils_3.qs)("#client-form-cancel").addEventListener("click", () => {
            form.reset();
            (0, app_utils_3.qs)("#client-form-title").textContent = "Créer un client";
        });
    }
    /* ============================================================
       RECHERCHE
       ============================================================ */
    function setupClientSearch() {
        const form = (0, app_utils_3.qs)("#client-search-form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const query = (0, app_utils_3.qs)("#client-search-query").value.trim();
            if (!query) {
                loadClients();
                return;
            }
            const data = await (0, app_utils_3.httpGet)(`/api/client/nom/${encodeURIComponent(query)}`);
            clients = extractClientList(data);
            renderClients();
        });
        (0, app_utils_3.qs)("#client-search-reset").addEventListener("click", () => {
            (0, app_utils_3.qs)("#client-search-query").value = "";
            loadClients();
        });
    }
    /* ============================================================
       EXPORT
       ============================================================ */
    function initClients() {
        setupClientForm();
        setupClientSearch();
        loadClients();
    }
});
define("app.projets", ["require", "exports", "app.utils"], function (require, exports, app_utils_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadProjets = loadProjets;
    exports.initProjets = initProjets;
    /* ============================================================
       ÉTAT LOCAL
       ============================================================ */
    let projets = [];
    /* ============================================================
       PARSING ROBUSTE
       ============================================================ */
    function extractProjetList(data) {
        if (Array.isArray(data))
            return data;
        if (data && Array.isArray(data.data))
            return data.data;
        if (data && Array.isArray(data.results))
            return data.results;
        console.warn("Format API inattendu (projets) :", data);
        return [];
    }
    /* ============================================================
       CHARGEMENT
       ============================================================ */
    async function loadProjets() {
        const data = await (0, app_utils_4.httpGet)("/api/projet");
        projets = extractProjetList(data);
        renderProjets();
    }
    /* ============================================================
       RENDU
       ============================================================ */
    function renderProjets() {
        if ((0, app_utils_4.isMobile)())
            renderProjetCards();
        else
            renderProjetTable();
    }
    /* ---------- TABLE ---------- */
    function renderProjetTable() {
        const tbody = (0, app_utils_4.qs)("#projet-table-body");
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
        const container = (0, app_utils_4.qs)("#projet-cards");
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
        const section = (0, app_utils_4.qs)("#section-projets");
        /* ----- EDIT ----- */
        section.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = Number(btn.dataset.id);
                const projet = projets.find(p => p.id_projet === id);
                if (!projet)
                    return;
                (0, app_utils_4.qs)("#projet-id").value = String(projet.id_projet);
                (0, app_utils_4.qs)("#projet-nom").value = projet.nom;
                (0, app_utils_4.qs)("#projet-form-title").textContent = "Modifier un projet";
            });
        });
        /* ----- DELETE ----- */
        section.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = Number(btn.dataset.id);
                if (!confirm("Supprimer ce projet ?"))
                    return;
                try {
                    await (0, app_utils_4.httpPostForm)("/api/projet/delete", { id });
                    (0, app_utils_4.toast)("Projet supprimé");
                    loadProjets();
                }
                catch (err) {
                    (0, app_utils_4.toast)("Impossible de supprimer ce projet car il est utilisé dans d'autres éléments (tâches, absences, etc.)", "error");
                }
            });
        });
    }
    /* ============================================================
       FORMULAIRE
       ============================================================ */
    function setupProjetForm() {
        const form = (0, app_utils_4.qs)("#projet-form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = (0, app_utils_4.qs)("#projet-id").value;
            const nom = (0, app_utils_4.qs)("#projet-nom").value.trim();
            if (!nom) {
                (0, app_utils_4.toast)("Le nom est obligatoire", "error");
                return;
            }
            try {
                if (id) {
                    await (0, app_utils_4.httpPostForm)("/api/projet/update", { id, nom });
                    (0, app_utils_4.toast)("Projet mis à jour");
                }
                else {
                    await (0, app_utils_4.httpPostForm)("/api/projet/add", { nom });
                    (0, app_utils_4.toast)("Projet créé");
                }
            }
            catch (err) {
                (0, app_utils_4.toast)("Erreur lors de l'enregistrement du projet", "error");
                return;
            }
            form.reset();
            (0, app_utils_4.qs)("#projet-form-title").textContent = "Créer un projet";
            loadProjets();
        });
        (0, app_utils_4.qs)("#projet-form-cancel").addEventListener("click", () => {
            form.reset();
            (0, app_utils_4.qs)("#projet-form-title").textContent = "Créer un projet";
        });
    }
    /* ============================================================
       RECHERCHE
       ============================================================ */
    function setupProjetSearch() {
        const form = (0, app_utils_4.qs)("#projet-search-form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const query = (0, app_utils_4.qs)("#projet-search-query").value.trim();
            if (!query) {
                loadProjets();
                return;
            }
            const data = await (0, app_utils_4.httpGet)(`/api/projet/nom/${encodeURIComponent(query)}`);
            projets = extractProjetList(data);
            renderProjets();
        });
        (0, app_utils_4.qs)("#projet-search-reset").addEventListener("click", () => {
            (0, app_utils_4.qs)("#projet-search-query").value = "";
            loadProjets();
        });
    }
    /* ============================================================
       EXPORT
       ============================================================ */
    function initProjets() {
        setupProjetForm();
        setupProjetSearch();
        loadProjets();
    }
});
define("app.salaries", ["require", "exports", "app.utils"], function (require, exports, app_utils_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadSalaries = loadSalaries;
    exports.setupSalarieForm = setupSalarieForm;
    exports.initSalaries = initSalaries;
    /* ============================================================
       ÉTAT LOCAL
       ============================================================ */
    let salaries = [];
    /* ============================================================
       CHARGEMENT
       ============================================================ */
    async function loadSalaries() {
        const data = await (0, app_utils_5.httpGet)("/api/salaries");
        salaries = data;
        renderSalaries();
    }
    /* ============================================================
       RENDU
       ============================================================ */
    function renderSalaries() {
        if ((0, app_utils_5.isMobile)())
            renderSalarieCards();
        else
            renderSalarieTable();
    }
    /* ---------- TABLE ---------- */
    function renderSalarieTable() {
        const tbody = (0, app_utils_5.qs)("#salarie-table-body");
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
    function renderSalarieCards() {
        const container = (0, app_utils_5.qs)("#salarie-cards");
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
    function setupSalarieActions() {
        const section = (0, app_utils_5.qs)("#section-salaries");
        /* ----- EDIT ----- */
        section.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = Number(btn.dataset.id);
                const s = salaries.find(x => x.id_salarie === id);
                if (!s)
                    return;
                (0, app_utils_5.qs)("#salarie-id").value = String(s.id_salarie);
                (0, app_utils_5.qs)("#salarie-nom").value = s.nom;
                (0, app_utils_5.qs)("#salarie-prenom").value = s.prenom;
                (0, app_utils_5.qs)("#salarie-poste").value = s.poste;
                (0, app_utils_5.qs)("#salarie-contrat").value = s.contrat;
                (0, app_utils_5.qs)("#salarie-tjm").value = s.taux_journalier_moyen;
                (0, app_utils_5.qs)("#salarie-role").value = String(s.role);
                (0, app_utils_5.qs)("#salarie-form-title").textContent = "Modifier un salarié";
            });
        });
        /* ----- DELETE ----- */
        section.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = Number(btn.dataset.id);
                if (!confirm("Supprimer ce salarié ?"))
                    return;
                try {
                    const res = await fetch(app_utils_5.API_BASE_URL + `/api/salaries/${id}`, {
                        method: "DELETE"
                    });
                    if (!res.ok) {
                        (0, app_utils_5.toast)("Impossible de supprimer ce salarié (peut-être utilisé ailleurs)", "error");
                        return;
                    }
                    (0, app_utils_5.toast)("Salarié supprimé");
                    loadSalaries();
                }
                catch (err) {
                    (0, app_utils_5.toast)("Erreur lors de la suppression du salarié", "error");
                }
            });
        });
    }
    /* ============================================================
       FORMULAIRE
       ============================================================ */
    function setupSalarieForm() {
        const form = (0, app_utils_5.qs)("#salarie-form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = (0, app_utils_5.qs)("#salarie-id").value;
            const data = {
                nom: (0, app_utils_5.qs)("#salarie-nom").value.trim(),
                prenom: (0, app_utils_5.qs)("#salarie-prenom").value.trim(),
                poste: (0, app_utils_5.qs)("#salarie-poste").value.trim(),
                contrat: (0, app_utils_5.qs)("#salarie-contrat").value.trim(),
                taux_journalier_moyen: (0, app_utils_5.qs)("#salarie-tjm").value.trim(),
                role: (0, app_utils_5.qs)("#salarie-role").value.trim()
            };
            if (!data.nom || !data.prenom || !data.poste || !data.contrat || !data.taux_journalier_moyen) {
                (0, app_utils_5.toast)("Tous les champs sont obligatoires", "error");
                return;
            }
            try {
                if (id) {
                    await (0, app_utils_5.httpPostForm)(`/api/salaries/${id}`, data);
                    (0, app_utils_5.toast)("Salarié mis à jour");
                }
                else {
                    await (0, app_utils_5.httpPostForm)("/api/salaries", data);
                    (0, app_utils_5.toast)("Salarié créé");
                }
            }
            catch (err) {
                (0, app_utils_5.toast)("Erreur lors de l'enregistrement du salarié", "error");
                return;
            }
            form.reset();
            (0, app_utils_5.qs)("#salarie-form-title").textContent = "Créer un salarié";
            loadSalaries();
        });
        (0, app_utils_5.qs)("#salarie-form-cancel").addEventListener("click", () => {
            form.reset();
            (0, app_utils_5.qs)("#salarie-form-title").textContent = "Créer un salarié";
        });
    }
    /* ============================================================
       EXPORT
       ============================================================ */
    function initSalaries() {
        setupSalarieForm();
        loadSalaries();
    }
});
define("app.taches", ["require", "exports", "app.utils"], function (require, exports, app_utils_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadTaches = loadTaches;
    exports.setupTacheForm = setupTacheForm;
    exports.initTaches = initTaches;
    /* ============================================================
       ÉTAT LOCAL
       ============================================================ */
    let taches = [];
    /* ============================================================
       CHARGEMENT
       ============================================================ */
    async function loadTaches() {
        const data = await (0, app_utils_6.httpGet)("/api/taches");
        taches = data;
        renderTaches();
    }
    /* ============================================================
       RENDU
       ============================================================ */
    function renderTaches() {
        if ((0, app_utils_6.isMobile)())
            renderTacheCards();
        else
            renderTacheTable();
    }
    /* ---------- TABLE ---------- */
    function renderTacheTable() {
        const tbody = (0, app_utils_6.qs)("#tache-table-body");
        tbody.innerHTML = "";
        taches.forEach(t => {
            var _a;
            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td>${t.id_tache}</td>
            <td>${t.Nom}</td>
            <td>${t.temps_previsionnel}</td>
            <td>${t.temps_passe}</td>
            <td>${t.debut}</td>
            <td>${(_a = t.fin) !== null && _a !== void 0 ? _a : "-"}</td>
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
    function renderTacheCards() {
        const container = (0, app_utils_6.qs)("#tache-cards");
        container.innerHTML = "";
        taches.forEach(t => {
            var _a;
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `
            <p><strong>ID :</strong> ${t.id_tache}</p>
            <p><strong>Nom :</strong> ${t.Nom}</p>
            <p><strong>Prévu :</strong> ${t.temps_previsionnel}</p>
            <p><strong>Passé :</strong> ${t.temps_passe}</p>
            <p><strong>Début :</strong> ${t.debut}</p>
            <p><strong>Fin :</strong> ${(_a = t.fin) !== null && _a !== void 0 ? _a : "-"}</p>
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
    function setupTacheActions() {
        const section = (0, app_utils_6.qs)("#section-taches");
        /* ----- EDIT ----- */
        section.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                var _a;
                const id = Number(btn.dataset.id);
                const t = taches.find(x => x.id_tache === id);
                if (!t)
                    return;
                (0, app_utils_6.qs)("#tache-id").value = String(t.id_tache);
                (0, app_utils_6.qs)("#tache-nom").value = t.Nom;
                (0, app_utils_6.qs)("#tache-prev").value = String(t.temps_previsionnel);
                (0, app_utils_6.qs)("#tache-passe").value = String(t.temps_passe);
                (0, app_utils_6.qs)("#tache-debut").value = t.debut;
                (0, app_utils_6.qs)("#tache-fin").value = (_a = t.fin) !== null && _a !== void 0 ? _a : "";
                (0, app_utils_6.qs)("#tache-statut").value = t.statut;
                (0, app_utils_6.qs)("#tache-projet").value = String(t.id_projet);
                (0, app_utils_6.qs)("#tache-salarie").value = String(t.id_salarie);
                (0, app_utils_6.qs)("#tache-form-title").textContent = "Modifier une tâche";
            });
        });
        /* ----- DELETE ----- */
        section.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = Number(btn.dataset.id);
                if (!confirm("Supprimer cette tâche ?"))
                    return;
                try {
                    await (0, app_utils_6.httpPostJSON)("/api/taches/delete", { id_tache: id });
                    (0, app_utils_6.toast)("Tâche supprimée");
                    loadTaches();
                }
                catch (err) {
                    (0, app_utils_6.toast)("Impossible de supprimer cette tâche.", "error");
                }
            });
        });
    }
    /* ============================================================
       FORMULAIRE
       ============================================================ */
    function setupTacheForm() {
        const form = (0, app_utils_6.qs)("#tache-form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = (0, app_utils_6.qs)("#tache-id").value;
            const data = {
                id_tache: id ? Number(id) : undefined,
                Nom: (0, app_utils_6.qs)("#tache-nom").value.trim(),
                temps_previsionnel: Number((0, app_utils_6.qs)("#tache-prev").value),
                temps_passe: Number((0, app_utils_6.qs)("#tache-passe").value),
                debut: (0, app_utils_6.qs)("#tache-debut").value,
                fin: (0, app_utils_6.qs)("#tache-fin").value || null,
                statut: (0, app_utils_6.qs)("#tache-statut").value.trim(),
                id_projet: Number((0, app_utils_6.qs)("#tache-projet").value),
                id_salarie: Number((0, app_utils_6.qs)("#tache-salarie").value)
            };
            if (!data.Nom || !data.debut || !data.id_projet || !data.id_salarie) {
                (0, app_utils_6.toast)("Les champs Nom, Début, ID Projet et ID Salarié sont obligatoires", "error");
                return;
            }
            try {
                if (id) {
                    await (0, app_utils_6.httpPostJSON)("/api/taches/update", data);
                    (0, app_utils_6.toast)("Tâche mise à jour");
                }
                else {
                    await (0, app_utils_6.httpPostJSON)("/api/taches", data);
                    (0, app_utils_6.toast)("Tâche créée");
                }
            }
            catch (err) {
                (0, app_utils_6.toast)("Impossible d’enregistrer la tâche : l’ID projet ou l’ID salarié indiqué n’existe pas.", "error");
                return;
            }
            form.reset();
            (0, app_utils_6.qs)("#tache-form-title").textContent = "Créer une tâche";
            loadTaches();
        });
        (0, app_utils_6.qs)("#tache-form-cancel").addEventListener("click", () => {
            form.reset();
            (0, app_utils_6.qs)("#tache-form-title").textContent = "Créer une tâche";
        });
    }
    /* ============================================================
       EXPORT
       ============================================================ */
    function initTaches() {
        setupTacheForm();
        loadTaches();
    }
});
define("app.utilisateurs", ["require", "exports", "app.utils"], function (require, exports, app_utils_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadUtilisateurs = loadUtilisateurs;
    exports.initUtilisateurs = initUtilisateurs;
    /* ============================================================
       ÉTAT LOCAL
       ============================================================ */
    let utilisateurs = [];
    /* ============================================================
       CHARGEMENT
       ============================================================ */
    async function loadUtilisateurs() {
        utilisateurs = await (0, app_utils_7.httpGet)("/api/utilisateurs");
        renderUtilisateurs();
    }
    /* ============================================================
       RENDU
       ============================================================ */
    function renderUtilisateurs() {
        if ((0, app_utils_7.isMobile)())
            renderUtilisateurCards();
        else
            renderUtilisateurTable();
    }
    /* ---------- TABLE ---------- */
    function renderUtilisateurTable() {
        const tbody = (0, app_utils_7.qs)("#utilisateur-table-body");
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
        const container = (0, app_utils_7.qs)("#utilisateur-cards");
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
        const section = (0, app_utils_7.qs)("#section-utilisateurs");
        section.querySelectorAll(".view-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = Number(btn.dataset.id);
                const u = await (0, app_utils_7.httpGet)(`/api/utilisateurs/${id}`);
                (0, app_utils_7.openDetailModal)("Détail de l'utilisateur", `
                <p><strong>ID :</strong> ${u.id_utilisateur}</p>
                <p><strong>Nom :</strong> ${u.nom}</p>
                <p><strong>Email :</strong> ${u.email}</p>
                <p><strong>Rôle :</strong> ${u.role}</p>
            `);
            });
        });
        section.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = Number(btn.dataset.id);
                const u = utilisateurs.find(x => x.id_utilisateur === id);
                if (!u)
                    return;
                (0, app_utils_7.qs)("#utilisateur-id").value = String(u.id_utilisateur);
                (0, app_utils_7.qs)("#utilisateur-nom").value = u.nom;
                (0, app_utils_7.qs)("#utilisateur-email").value = u.email;
                (0, app_utils_7.qs)("#utilisateur-role").value = u.role;
                (0, app_utils_7.qs)("#utilisateur-password").value = "";
                (0, app_utils_7.qs)("#utilisateur-password").required = false;
                (0, app_utils_7.qs)("#utilisateur-form-title").textContent = "Modifier un utilisateur";
            });
        });
        section.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                var _a;
                const id = Number(btn.dataset.id);
                if (!confirm("Supprimer cet utilisateur ?"))
                    return;
                // On n'utilise pas httpDelete : on veut afficher le message du serveur
                const res = await fetch(app_utils_7.API_BASE_URL + `/api/utilisateurs/${id}`, {
                    method: "DELETE",
                    credentials: "include"
                });
                const data = await res.json();
                if (!res.ok) {
                    (0, app_utils_7.toast)((_a = data.message) !== null && _a !== void 0 ? _a : "Erreur", "error");
                    return;
                }
                (0, app_utils_7.toast)("Utilisateur supprimé");
                loadUtilisateurs();
            });
        });
    }
    /* ============================================================
       FORMULAIRE
       ============================================================ */
    function resetUtilisateurForm() {
        (0, app_utils_7.qs)("#utilisateur-form").reset();
        (0, app_utils_7.qs)("#utilisateur-password").required = true;
        (0, app_utils_7.qs)("#utilisateur-form-title").textContent = "Créer un utilisateur";
    }
    function setupUtilisateurForm() {
        const form = (0, app_utils_7.qs)("#utilisateur-form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = (0, app_utils_7.qs)("#utilisateur-id").value;
            const body = new FormData();
            body.append("nom", (0, app_utils_7.qs)("#utilisateur-nom").value.trim());
            body.append("email", (0, app_utils_7.qs)("#utilisateur-email").value.trim());
            body.append("mot_de_passe", (0, app_utils_7.qs)("#utilisateur-password").value);
            body.append("role", (0, app_utils_7.qs)("#utilisateur-role").value);
            // Création : POST /api/utilisateurs — Modification : POST /api/utilisateurs/{id}
            const url = id ? `/api/utilisateurs/${id}` : "/api/utilisateurs";
            const res = await fetch(app_utils_7.API_BASE_URL + url, {
                method: "POST",
                body: body,
                credentials: "include"
            });
            const data = await res.json();
            if (!res.ok) {
                // On affiche la première erreur de validation envoyée par le serveur
                const firstError = data.errors ? Object.values(data.errors)[0] : data.message;
                (0, app_utils_7.toast)(String(firstError), "error");
                return;
            }
            (0, app_utils_7.toast)(id ? "Utilisateur mis à jour" : "Utilisateur créé");
            resetUtilisateurForm();
            loadUtilisateurs();
        });
        (0, app_utils_7.qs)("#utilisateur-form-cancel").addEventListener("click", resetUtilisateurForm);
    }
    /* ============================================================
       INIT
       ============================================================ */
    function initUtilisateurs() {
        setupUtilisateurForm();
        loadUtilisateurs();
    }
});
/* ============================================================
   IMPORTS
   ============================================================ */
define("app", ["require", "exports", "app.utils", "app.auth", "app.clients", "app.projets", "app.salaries", "app.absences", "app.taches", "app.utilisateurs"], function (require, exports, app_utils_8, app_auth_1, app_clients_1, app_projets_1, app_salaries_1, app_absences_1, app_taches_1, app_utilisateurs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /* ============================================================
       INITIALISATION DES ONGLETS
       ============================================================ */
    function initTabs() {
        (0, app_utils_8.setupTabs)({
            "tab-clients": "section-clients",
            "tab-projets": "section-projets",
            "tab-salaries": "section-salaries",
            "tab-absences": "section-absences",
            "tab-taches": "section-taches",
            "tab-utilisateurs": "section-utilisateurs"
        });
    }
    /* ============================================================
       RESPONSIVE
       ============================================================ */
    // Rôle de l'utilisateur connecté (admin, recruteur, salarie, client)
    let currentRole = "";
    function initResponsive() {
        (0, app_utils_8.setupResponsiveRerender)(() => {
            // Rien à recharger si l'utilisateur n'est pas connecté
            if (document.getElementById("app-content").classList.contains("hidden"))
                return;
            // On recharge seulement les listes pour forcer le re-render table/cards
            if (currentRole !== "client") {
                (0, app_clients_1.loadClients)();
                (0, app_salaries_1.loadSalaries)();
                (0, app_absences_1.loadAbsences)();
            }
            (0, app_projets_1.loadProjets)();
            (0, app_taches_1.loadTaches)();
        });
    }
    /* ============================================================
       MAIN INIT
       ============================================================ */
    function initModules(role) {
        currentRole = role;
        // Le client voit seulement les projets et les tâches
        if (role !== "client") {
            (0, app_clients_1.initClients)();
            (0, app_salaries_1.initSalaries)();
            (0, app_absences_1.initAbsences)();
        }
        (0, app_projets_1.initProjets)();
        (0, app_taches_1.initTaches)();
        // Seul l'admin gère les utilisateurs
        if (role === "admin") {
            (0, app_utilisateurs_1.initUtilisateurs)();
        }
    }
    async function main() {
        initTabs();
        initResponsive();
        (0, app_utils_8.setupDetailModal)();
        (0, app_auth_1.setupAuth)(initModules);
        // Les listes ne sont chargées que si l'utilisateur est connecté
        const role = await (0, app_auth_1.checkSession)();
        if (role !== "") {
            initModules(role);
        }
    }
    /* ============================================================
       LANCEMENT — FIX AMD / REQUIREJS
       ============================================================ */
    // RequireJS charge les modules APRÈS le DOM → DOMContentLoaded est déjà passé.
    // On doit donc exécuter main() immédiatement si le DOM est prêt.
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", main);
    }
    else {
        main();
    }
});
