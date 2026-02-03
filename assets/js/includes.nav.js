(async () => {
    async function injectNav() {
        const navMount = document.getElementById("siteNav");
        if (!navMount) return;

        const inPages = location.pathname.includes("/pages/");
        const base = inPages ? ".." : ".";

        const res = await fetch(`${base}/partials/nav.html`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Nav include failed: ${res.status}`);

        // 1) Inject nav HTML first (now elements exist)
        navMount.innerHTML = await res.text();

        // 2) Fix asset paths ONLY if your nav partial contains assets/...
        if (inPages) {
            navMount.querySelectorAll('[src^="assets/"], [href^="assets/"]').forEach(el => {
                const attr = el.hasAttribute("src") ? "src" : "href";
                el.setAttribute(attr, "../" + el.getAttribute(attr));
            });
        }

        // 3) Auto-active link
        setActiveLink(navMount);

        //  initialize behaviors that need the injected nav to exist
        if (window.initNavSearch) window.initNavSearch();
        if (window.initNavScroll) window.initNavScroll();
    }

    function setActiveLink(navMount) {
        const path = location.pathname.split("/").pop() || "index.html";

        navMount.querySelectorAll(".nav a.is-active").forEach(a => a.classList.remove("is-active"));

        navMount.querySelectorAll(".nav a").forEach(a => {
            const href = a.getAttribute("href") || "";
            const file = href.split("/").pop();

            if (path === "index.html" && (href === "index.html" || href === "../index.html" || href === "./index.html")) {
                a.classList.add("is-active");
            }

            if (file && file === path) {
                a.classList.add("is-active");
            }
        });
    }

    injectNav().catch(console.error);
})();
