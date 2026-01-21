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
    exports.isMobile = isMobile;
    exports.qs = qs;
    exports.qsa = qsa;
    exports.setupTabs = setupTabs;
    exports.setupResponsiveRerender = setupResponsiveRerender;
    exports.API_BASE_URL = "http://localhost:8000";
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
    /** GET JSON */
    async function httpGet(url) {
        try {
            const res = await fetch(exports.API_BASE_URL + url);
            if (!res.ok) {
                toast(`Erreur serveur (${res.status})`, "error");
                throw new Error(`GET ${url} -> ${res.status}`);
            }
            return await res.json();
        }
        catch (err) {
            toast("Erreur réseau : impossible de contacter le serveur", "error");
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
                body: form
            });
            if (!res.ok) {
                toast(`Erreur serveur (${res.status})`, "error");
                throw new Error(`POST ${url} -> ${res.status}`);
            }
            return await res.json();
        }
        catch (err) {
            toast("Erreur réseau : impossible de contacter le serveur", "error");
            throw err;
        }
    }
    /** POST JSON (Absence / Tache) */
    async function httpPostJSON(url, data) {
        try {
            const res = await fetch(exports.API_BASE_URL + url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                toast(`Erreur serveur (${res.status})`, "error");
                throw new Error(`POST JSON ${url} -> ${res.status}`);
            }
            return await res.json();
        }
        catch (err) {
            toast("Erreur réseau : impossible de contacter le serveur", "error");
            throw err;
        }
    }
    /** PUT JSON (Absence update) */
    async function httpPutJSON(url, data) {
        try {
            const res = await fetch(exports.API_BASE_URL + url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                toast(`Erreur serveur (${res.status})`, "error");
                throw new Error(`PUT ${url} -> ${res.status}`);
            }
            return await res.json();
        }
        catch (err) {
            toast("Erreur réseau : impossible de contacter le serveur", "error");
            throw err;
        }
    }
    /** DELETE JSON (Absence delete) */
    async function httpDelete(url) {
        try {
            const res = await fetch(exports.API_BASE_URL + url, { method: "DELETE" });
            if (!res.ok) {
                toast(`Erreur serveur (${res.status})`, "error");
                throw new Error(`DELETE ${url} -> ${res.status}`);
            }
        }
        catch (err) {
            toast("Erreur réseau : impossible de contacter le serveur", "error");
            throw err;
        }
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
        document.querySelectorAll(".edit-btn").forEach(btn => {
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
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = Number(btn.dataset.id);
                if (!confirm("Supprimer cette absence ?"))
                    return;
                await (0, app_utils_1.httpDelete)(`/api/absences/${id}`);
                (0, app_utils_1.toast)("Absence supprimée");
                loadAbsences();
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
            if (id) {
                await (0, app_utils_1.httpPutJSON)(`/api/absences/${id}`, data);
                (0, app_utils_1.toast)("Absence mise à jour");
            }
            else {
                await (0, app_utils_1.httpPostJSON)("/api/absences", data);
                (0, app_utils_1.toast)("Absence créée");
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
define("app.clients", ["require", "exports", "app.utils"], function (require, exports, app_utils_2) {
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
        const data = await (0, app_utils_2.httpGet)("/api/client");
        clients = extractClientList(data);
        renderClients();
    }
    /* ============================================================
       RENDU
       ============================================================ */
    function renderClients() {
        if ((0, app_utils_2.isMobile)())
            renderClientCards();
        else
            renderClientTable();
    }
    /* ---------- TABLE ---------- */
    function renderClientTable() {
        const tbody = (0, app_utils_2.qs)("#client-table-body");
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
        const container = (0, app_utils_2.qs)("#client-cards");
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
        (0, app_utils_2.qsa)(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = Number(btn.dataset.id);
                const client = clients.find(c => c.id_client === id);
                if (!client)
                    return;
                (0, app_utils_2.qs)("#client-id").value = String(client.id_client);
                (0, app_utils_2.qs)("#client-nom").value = client.nom;
                (0, app_utils_2.qs)("#client-form-title").textContent = "Modifier un client";
            });
        });
        (0, app_utils_2.qsa)(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = Number(btn.dataset.id);
                if (!confirm("Supprimer ce client ?"))
                    return;
                await (0, app_utils_2.httpPostForm)("/api/client/delete", { id });
                (0, app_utils_2.toast)("Client supprimé");
                loadClients();
            });
        });
    }
    /* ============================================================
       FORMULAIRE
       ============================================================ */
    function setupClientForm() {
        const form = (0, app_utils_2.qs)("#client-form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = (0, app_utils_2.qs)("#client-id").value;
            const nom = (0, app_utils_2.qs)("#client-nom").value.trim();
            if (!nom) {
                (0, app_utils_2.toast)("Le nom est obligatoire", "error");
                return;
            }
            if (id) {
                await (0, app_utils_2.httpPostForm)("/api/client/update", { id, nom });
                (0, app_utils_2.toast)("Client mis à jour");
            }
            else {
                await (0, app_utils_2.httpPostForm)("/api/client/add", { nom });
                (0, app_utils_2.toast)("Client créé");
            }
            form.reset();
            (0, app_utils_2.qs)("#client-form-title").textContent = "Créer un client";
            loadClients();
        });
        (0, app_utils_2.qs)("#client-form-cancel").addEventListener("click", () => {
            form.reset();
            (0, app_utils_2.qs)("#client-form-title").textContent = "Créer un client";
        });
    }
    /* ============================================================
       RECHERCHE
       ============================================================ */
    function setupClientSearch() {
        const form = (0, app_utils_2.qs)("#client-search-form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const query = (0, app_utils_2.qs)("#client-search-query").value.trim();
            if (!query) {
                loadClients();
                return;
            }
            const data = await (0, app_utils_2.httpGet)(`/api/client/nom/${encodeURIComponent(query)}`);
            clients = extractClientList(data);
            renderClients();
        });
        (0, app_utils_2.qs)("#client-search-reset").addEventListener("click", () => {
            (0, app_utils_2.qs)("#client-search-query").value = "";
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
define("app.projets", ["require", "exports", "app.utils"], function (require, exports, app_utils_3) {
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
        const data = await (0, app_utils_3.httpGet)("/api/projet");
        projets = extractProjetList(data);
        renderProjets();
    }
    /* ============================================================
       RENDU
       ============================================================ */
    function renderProjets() {
        if ((0, app_utils_3.isMobile)())
            renderProjetCards();
        else
            renderProjetTable();
    }
    /* ---------- TABLE ---------- */
    function renderProjetTable() {
        const tbody = (0, app_utils_3.qs)("#projet-table-body");
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
        const container = (0, app_utils_3.qs)("#projet-cards");
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
        (0, app_utils_3.qsa)(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = Number(btn.dataset.id);
                const projet = projets.find(p => p.id_projet === id);
                if (!projet)
                    return;
                (0, app_utils_3.qs)("#projet-id").value = String(projet.id_projet);
                (0, app_utils_3.qs)("#projet-nom").value = projet.nom;
                (0, app_utils_3.qs)("#projet-form-title").textContent = "Modifier un projet";
            });
        });
        (0, app_utils_3.qsa)(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = Number(btn.dataset.id);
                if (!confirm("Supprimer ce projet ?"))
                    return;
                await (0, app_utils_3.httpPostForm)("/api/projet/delete", { id });
                (0, app_utils_3.toast)("Projet supprimé");
                loadProjets();
            });
        });
    }
    /* ============================================================
       FORMULAIRE
       ============================================================ */
    function setupProjetForm() {
        const form = (0, app_utils_3.qs)("#projet-form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = (0, app_utils_3.qs)("#projet-id").value;
            const nom = (0, app_utils_3.qs)("#projet-nom").value.trim();
            if (!nom) {
                (0, app_utils_3.toast)("Le nom est obligatoire", "error");
                return;
            }
            if (id) {
                await (0, app_utils_3.httpPostForm)("/api/projet/update", { id, nom });
                (0, app_utils_3.toast)("Projet mis à jour");
            }
            else {
                await (0, app_utils_3.httpPostForm)("/api/projet/add", { nom });
                (0, app_utils_3.toast)("Projet créé");
            }
            form.reset();
            (0, app_utils_3.qs)("#projet-form-title").textContent = "Créer un projet";
            loadProjets();
        });
        (0, app_utils_3.qs)("#projet-form-cancel").addEventListener("click", () => {
            form.reset();
            (0, app_utils_3.qs)("#projet-form-title").textContent = "Créer un projet";
        });
    }
    /* ============================================================
       RECHERCHE
       ============================================================ */
    function setupProjetSearch() {
        const form = (0, app_utils_3.qs)("#projet-search-form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const query = (0, app_utils_3.qs)("#projet-search-query").value.trim();
            if (!query) {
                loadProjets();
                return;
            }
            const data = await (0, app_utils_3.httpGet)(`/api/projet/nom/${encodeURIComponent(query)}`);
            projets = extractProjetList(data);
            renderProjets();
        });
        (0, app_utils_3.qs)("#projet-search-reset").addEventListener("click", () => {
            (0, app_utils_3.qs)("#projet-search-query").value = "";
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
define("app.salaries", ["require", "exports", "app.utils"], function (require, exports, app_utils_4) {
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
        const data = await (0, app_utils_4.httpGet)("/api/salaries");
        salaries = data;
        renderSalaries();
    }
    /* ============================================================
       RENDU
       ============================================================ */
    function renderSalaries() {
        if ((0, app_utils_4.isMobile)())
            renderSalarieCards();
        else
            renderSalarieTable();
    }
    /* ---------- TABLE ---------- */
    function renderSalarieTable() {
        const tbody = (0, app_utils_4.qs)("#salarie-table-body");
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
        const container = (0, app_utils_4.qs)("#salarie-cards");
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
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = Number(btn.dataset.id);
                const s = salaries.find(x => x.id_salarie === id);
                if (!s)
                    return;
                (0, app_utils_4.qs)("#salarie-id").value = String(s.id_salarie);
                (0, app_utils_4.qs)("#salarie-nom").value = s.nom;
                (0, app_utils_4.qs)("#salarie-prenom").value = s.prenom;
                (0, app_utils_4.qs)("#salarie-poste").value = s.poste;
                (0, app_utils_4.qs)("#salarie-contrat").value = s.contrat;
                (0, app_utils_4.qs)("#salarie-tjm").value = s.taux_journalier_moyen;
                (0, app_utils_4.qs)("#salarie-role").value = String(s.role);
                (0, app_utils_4.qs)("#salarie-form-title").textContent = "Modifier un salarié";
            });
        });
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = Number(btn.dataset.id);
                if (!confirm("Supprimer ce salarié ?"))
                    return;
                const res = await fetch(`/api/salaries/${id}`, { method: "DELETE" });
                if (!res.ok) {
                    (0, app_utils_4.toast)("Erreur lors de la suppression", "error");
                    return;
                }
                (0, app_utils_4.toast)("Salarié supprimé");
                loadSalaries();
            });
        });
    }
    /* ============================================================
       FORMULAIRE
       ============================================================ */
    function setupSalarieForm() {
        const form = (0, app_utils_4.qs)("#salarie-form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = (0, app_utils_4.qs)("#salarie-id").value;
            const data = {
                nom: (0, app_utils_4.qs)("#salarie-nom").value.trim(),
                prenom: (0, app_utils_4.qs)("#salarie-prenom").value.trim(),
                poste: (0, app_utils_4.qs)("#salarie-poste").value.trim(),
                contrat: (0, app_utils_4.qs)("#salarie-contrat").value.trim(),
                taux_journalier_moyen: (0, app_utils_4.qs)("#salarie-tjm").value.trim(),
                role: (0, app_utils_4.qs)("#salarie-role").value.trim()
            };
            if (!data.nom || !data.prenom || !data.poste || !data.contrat || !data.taux_journalier_moyen) {
                (0, app_utils_4.toast)("Tous les champs sont obligatoires", "error");
                return;
            }
            if (id) {
                await (0, app_utils_4.httpPostForm)(`/api/salaries/${id}`, data);
                (0, app_utils_4.toast)("Salarié mis à jour");
            }
            else {
                await (0, app_utils_4.httpPostForm)("/api/salaries", data);
                (0, app_utils_4.toast)("Salarié créé");
            }
            form.reset();
            (0, app_utils_4.qs)("#salarie-form-title").textContent = "Créer un salarié";
            loadSalaries();
        });
        (0, app_utils_4.qs)("#salarie-form-cancel").addEventListener("click", () => {
            form.reset();
            (0, app_utils_4.qs)("#salarie-form-title").textContent = "Créer un salarié";
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
define("app.taches", ["require", "exports", "app.utils"], function (require, exports, app_utils_5) {
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
        const data = await (0, app_utils_5.httpGet)("/api/taches");
        taches = data;
        renderTaches();
    }
    /* ============================================================
       RENDU
       ============================================================ */
    function renderTaches() {
        if ((0, app_utils_5.isMobile)())
            renderTacheCards();
        else
            renderTacheTable();
    }
    /* ---------- TABLE ---------- */
    function renderTacheTable() {
        const tbody = (0, app_utils_5.qs)("#tache-table-body");
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
        const container = (0, app_utils_5.qs)("#tache-cards");
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
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                var _a;
                const id = Number(btn.dataset.id);
                const t = taches.find(x => x.id_tache === id);
                if (!t)
                    return;
                (0, app_utils_5.qs)("#tache-id").value = String(t.id_tache);
                (0, app_utils_5.qs)("#tache-nom").value = t.Nom;
                (0, app_utils_5.qs)("#tache-prev").value = String(t.temps_previsionnel);
                (0, app_utils_5.qs)("#tache-passe").value = String(t.temps_passe);
                (0, app_utils_5.qs)("#tache-debut").value = t.debut;
                (0, app_utils_5.qs)("#tache-fin").value = (_a = t.fin) !== null && _a !== void 0 ? _a : "";
                (0, app_utils_5.qs)("#tache-statut").value = t.statut;
                (0, app_utils_5.qs)("#tache-projet").value = String(t.id_projet);
                (0, app_utils_5.qs)("#tache-salarie").value = String(t.id_salarie);
                (0, app_utils_5.qs)("#tache-form-title").textContent = "Modifier une tâche";
            });
        });
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = Number(btn.dataset.id);
                if (!confirm("Supprimer cette tâche ?"))
                    return;
                await (0, app_utils_5.httpPostJSON)("/api/taches/delete", { id_tache: id });
                (0, app_utils_5.toast)("Tâche supprimée");
                loadTaches();
            });
        });
    }
    /* ============================================================
       FORMULAIRE
       ============================================================ */
    function setupTacheForm() {
        const form = (0, app_utils_5.qs)("#tache-form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = (0, app_utils_5.qs)("#tache-id").value;
            const data = {
                id_tache: id ? Number(id) : undefined,
                Nom: (0, app_utils_5.qs)("#tache-nom").value.trim(),
                temps_previsionnel: Number((0, app_utils_5.qs)("#tache-prev").value),
                temps_passe: Number((0, app_utils_5.qs)("#tache-passe").value),
                debut: (0, app_utils_5.qs)("#tache-debut").value,
                fin: (0, app_utils_5.qs)("#tache-fin").value || null,
                statut: (0, app_utils_5.qs)("#tache-statut").value.trim(),
                id_projet: Number((0, app_utils_5.qs)("#tache-projet").value),
                id_salarie: Number((0, app_utils_5.qs)("#tache-salarie").value)
            };
            if (!data.Nom || !data.debut || !data.id_projet || !data.id_salarie) {
                (0, app_utils_5.toast)("Les champs Nom, Début, ID Projet et ID Salarié sont obligatoires", "error");
                return;
            }
            if (id) {
                await (0, app_utils_5.httpPostJSON)("/api/taches/update", data);
                (0, app_utils_5.toast)("Tâche mise à jour");
            }
            else {
                await (0, app_utils_5.httpPostJSON)("/api/taches", data);
                (0, app_utils_5.toast)("Tâche créée");
            }
            form.reset();
            (0, app_utils_5.qs)("#tache-form-title").textContent = "Créer une tâche";
            loadTaches();
        });
        (0, app_utils_5.qs)("#tache-form-cancel").addEventListener("click", () => {
            form.reset();
            (0, app_utils_5.qs)("#tache-form-title").textContent = "Créer une tâche";
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
/* ============================================================
   IMPORTS
   ============================================================ */
define("app", ["require", "exports", "app.utils", "app.clients", "app.projets", "app.salaries", "app.absences", "app.taches"], function (require, exports, app_utils_6, app_clients_1, app_projets_1, app_salaries_1, app_absences_1, app_taches_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /* ============================================================
       INITIALISATION DES ONGLETS
       ============================================================ */
    function initTabs() {
        (0, app_utils_6.setupTabs)({
            "tab-clients": "section-clients",
            "tab-projets": "section-projets",
            "tab-salaries": "section-salaries",
            "tab-absences": "section-absences",
            "tab-taches": "section-taches"
        });
    }
    /* ============================================================
       RESPONSIVE
       ============================================================ */
    function initResponsive() {
        (0, app_utils_6.setupResponsiveRerender)(() => {
            // On recharge les listes pour forcer le re-render table/cards
            (0, app_clients_1.initClients)();
            (0, app_projets_1.initProjets)();
            (0, app_salaries_1.initSalaries)();
            (0, app_absences_1.initAbsences)();
            (0, app_taches_1.initTaches)();
        });
    }
    /* ============================================================
       MAIN INIT
       ============================================================ */
    function main() {
        initTabs();
        initResponsive();
        // Initialisation des modules
        (0, app_clients_1.initClients)();
        (0, app_projets_1.initProjets)();
        (0, app_salaries_1.initSalaries)();
        (0, app_absences_1.initAbsences)();
        (0, app_taches_1.initTaches)();
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
