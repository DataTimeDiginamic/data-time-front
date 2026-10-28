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

/* ============================================================
   INITIALISATION DES ONGLETS
   ============================================================ */

function initTabs(): void {
    setupTabs({
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

function initResponsive(): void {
    setupResponsiveRerender(() => {
        // Rien à recharger si l'utilisateur n'est pas connecté
        if (document.getElementById("app-content")!.classList.contains("hidden")) return;

        // On recharge seulement les listes pour forcer le re-render table/cards
        loadClients();
        loadProjets();
        loadSalaries();
        loadAbsences();
        loadTaches();
    });
}

/* ============================================================
   MAIN INIT
   ============================================================ */

function initModules(): void {
    initClients();
    initProjets();
    initSalaries();
    initAbsences();
    initTaches();
}

async function main(): Promise<void> {
    initTabs();
    initResponsive();
    setupDetailModal();
    setupAuth(initModules);

    // Les listes ne sont chargées que si l'utilisateur est connecté
    if (await checkSession()) {
        initModules();
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
