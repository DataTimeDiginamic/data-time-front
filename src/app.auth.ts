/* ============================================================
   AUTHENTIFICATION (connexion / déconnexion)
   ============================================================ */

import { API_BASE_URL, qs, toast, httpPostForm } from "./app.utils";

/** Affiche seulement les onglets autorisés pour le rôle, et ouvre le premier */
function showTabs(role: string): void {
    let tabs = ["tab-clients", "tab-projets", "tab-salaries", "tab-absences", "tab-taches"];

    if (role === "client") {
        tabs = ["tab-projets", "tab-taches"];
    }
    if (role === "admin") {
        tabs.push("tab-utilisateurs");
    }

    const allTabs = ["tab-clients", "tab-projets", "tab-salaries", "tab-absences", "tab-taches", "tab-utilisateurs"];
    allTabs.forEach(id => {
        qs<HTMLElement>("#" + id).classList.toggle("hidden", !tabs.includes(id));
    });

    qs<HTMLElement>("#" + tabs[0]).click();
}

/** Affiche l'application ou le formulaire de connexion */
function showApp(connected: boolean, nom: string = "", role: string = ""): void {
    if (connected) {
        qs<HTMLElement>("#login-section").classList.add("hidden");
        qs<HTMLElement>("#app-content").classList.remove("hidden");
        qs<HTMLElement>("#user-nom").textContent = `${nom} (${role})`;
        showTabs(role);
    } else {
        qs<HTMLElement>("#login-section").classList.remove("hidden");
        qs<HTMLElement>("#app-content").classList.add("hidden");
    }
}

/** Vérifie si une session est déjà ouverte côté serveur : retourne le rôle, ou "" si non connecté */
export async function checkSession(): Promise<string> {
    try {
        const res = await fetch(API_BASE_URL + "/api/me", { credentials: "include" });
        if (!res.ok) {
            showApp(false);
            return "";
        }
        const data = await res.json();
        showApp(true, data.user.nom, data.user.role);
        return data.user.role;
    } catch (err) {
        showApp(false);
        toast("Erreur réseau : impossible de contacter le serveur", "error");
        return "";
    }
}

/** Branche le formulaire de connexion et le bouton de déconnexion */
export function setupAuth(onLogin: (role: string) => void): void {
    qs<HTMLFormElement>("#login-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = qs<HTMLInputElement>("#login-email").value;
        const motDePasse = qs<HTMLInputElement>("#login-password").value;

        // On n'utilise pas httpPostForm : un 401 (mauvais mot de passe) est un cas normal
        const form = new FormData();
        form.append("email", email);
        form.append("mot_de_passe", motDePasse);

        const res = await fetch(API_BASE_URL + "/login", {
            method: "POST",
            body: form,
            credentials: "include"
        });
        const data = await res.json();

        if (!res.ok) {
            toast(data.message ?? "Veuillez remplir tous les champs", "error");
            return;
        }

        toast("Connexion réussie");
        qs<HTMLFormElement>("#login-form").reset();
        showApp(true, data.user.nom, data.user.role);
        onLogin(data.user.role);
    });

    qs("#logout-btn").addEventListener("click", async () => {
        await httpPostForm("/logout", {});
        // On recharge la page : elle repart de zéro et affiche le formulaire de connexion
        location.reload();
    });
}
