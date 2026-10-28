/* ============================================================
   IMPORTS
   ============================================================ */

import { setupTabs, setupResponsiveRerender, setupDetailModal } from "./app.utils";

import { checkSession, setupAuth } from "./app.auth";
import { initClients, loadClients } from "./app.clients";
import { initProjets, loadProjets } from "./app.projets";
import { initSalaries, loadSalaries } from "./app.salaries";
import { initAbsences, loadAbsences } from "./app.absences";
import { initTaches, loadTaches } from "./app.taches";
import { initUtilisateurs } from "./app.utilisateurs";

/* ============================================================
   INITIALISATION DES ONGLETS
   ============================================================ */

function initTabs(): void {
    setupTabs({
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

function initResponsive(): void {
    setupResponsiveRerender(() => {
        // Rien à recharger si l'utilisateur n'est pas connecté
        if (document.getElementById("app-content")!.classList.contains("hidden")) return;

        // On recharge seulement les listes pour forcer le re-render table/cards
        if (currentRole !== "client") {
            loadClients();
            loadSalaries();
            loadAbsences();
        }
        loadProjets();
        loadTaches();
    });
}

/* ============================================================
   MAIN INIT
   ============================================================ */

function initModules(role: string): void {
    currentRole = role;

    // Le client voit seulement les projets et les tâches
    if (role !== "client") {
        initClients();
        initSalaries();
        initAbsences();
    }
    initProjets();
    initTaches();

    // Seul l'admin gère les utilisateurs
    if (role === "admin") {
        initUtilisateurs();
    }
}

async function main(): Promise<void> {
    initTabs();
    initResponsive();
    setupDetailModal();
    setupAuth(initModules);

    // Les listes ne sont chargées que si l'utilisateur est connecté
    const role = await checkSession();
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
} else {
    main();
}
