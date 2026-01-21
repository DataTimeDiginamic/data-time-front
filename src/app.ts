/* ============================================================
   IMPORTS
   ============================================================ */

import { setupTabs, setupResponsiveRerender } from "./app.utils";

import { initClients } from "./app.clients";
import { initProjets } from "./app.projets";
import { initSalaries } from "./app.salaries";
import { initAbsences } from "./app.absences";
import { initTaches } from "./app.taches";

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
        // On recharge les listes pour forcer le re-render table/cards
        initClients();
        initProjets();
        initSalaries();
        initAbsences();
        initTaches();
    });
}

/* ============================================================
   MAIN INIT
   ============================================================ */

function main(): void {
    initTabs();
    initResponsive();

    // Initialisation des modules
    initClients();
    initProjets();
    initSalaries();
    initAbsences();
    initTaches();
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
