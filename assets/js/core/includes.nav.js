(() => {
    /* ================= SEARCH PLACEHOLDER TYPEWRITER ================= */
    function initNavSearch() {
        const searchInput = document.getElementById("navSearchInput");
        if (!searchInput) return;

        const basePlaceholder = "Search resources...";
        const examples = [
            "Food assistance in Charlotte",
            "Charlotte housing & shelters",
            "Free clinics near me",
            "Job training in Mecklenburg County",
            "Youth programs in Charlotte"
        ];

        let exIndex = 0;
        let charIndex = 0;
        let deleting = false;
        let timer = null;

        const isUserUsing = () =>
            document.activeElement === searchInput ||
            searchInput.value.trim().length > 0;

        function tick() {
            if (isUserUsing()) {
                searchInput.placeholder = basePlaceholder;
                timer = setTimeout(tick, 250);
                return;
            }

            const full = examples[exIndex];

            if (!deleting) {
                charIndex++;
                searchInput.placeholder = full.slice(0, charIndex);

                if (charIndex >= full.length) {
                    deleting = true;
                    timer = setTimeout(tick, 1100);
                    return;
                }
            } else {
                charIndex--;
                searchInput.placeholder = full.slice(0, charIndex);

                if (charIndex <= 0) {
                    deleting = false;
                    exIndex = (exIndex + 1) % examples.length;
                }
            }

            timer = setTimeout(tick, deleting ? 25 : 40);
        }

        searchInput.placeholder = basePlaceholder;
        tick();

        searchInput.addEventListener("focus", () => {
            searchInput.placeholder = basePlaceholder;
        });
    }

    /* navbar scroll shrink */
    function initNavScroll() {
        const topBar = document.querySelector(".hero-top");
        if (!topBar) return;

        const onScroll = () =>
            topBar.classList.toggle("is-scrolled", window.scrollY > 10);

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* ================= ACTIVE LINK ================= */
    function setActiveLink(navMount) {
        const normalize = (p) => {
            if (!p) return "";
            p = p.split("?")[0].split("#")[0]; // remove query/hash
            p = p.replace(/\/+$/, "");         // trim trailing slashes
            p = p.split("/").pop() || "index"; // last segment
            p = p.replace(/\.html$/i, "");     // drop .html
            return p.toLowerCase();
        };

        const current = normalize(location.pathname);

        // clear
        navMount.querySelectorAll(".nav a.is-active")
            .forEach(a => a.classList.remove("is-active"));

        navMount.querySelectorAll(".nav a").forEach(a => {
            const href = a.getAttribute("href") || "";

            // ignore anchors/external
            if (href.startsWith("#") || href.startsWith("http"))
                return;

            const target = normalize(href);

            // homepage cases
            const isHome = (x) => x === "" || x === "index";

            if (isHome(current) && isHome(target)) {
                a.classList.add("is-active");
                return;
            }

            if (target && target === current) {
                a.classList.add("is-active");
            }
        });
    }

    /* nav injection */
    async function injectNav() {
        const navMount = document.getElementById("siteNav");
        if (!navMount) return;

        // prevent double-inject (super important when dev server reloads)
        if (navMount.dataset.loaded === "1") return;
        navMount.dataset.loaded = "1";

        const inPages = location.pathname.includes("/pages/");
        const base = inPages ? ".." : ".";

        const res = await fetch(`${base}/partials/nav.html`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Nav include failed: ${res.status}`);

        navMount.innerHTML = await res.text();

        // fix asset paths inside injected nav (only if needed)
        if (inPages) {
            navMount.querySelectorAll('[src^="assets/"], [href^="assets/"]').forEach(el => {
                const attr = el.hasAttribute("src") ? "src" : "href";
                el.setAttribute(attr, "../" + el.getAttribute(attr));
            });
        }

        setActiveLink(navMount);
        initNavSearch();
        initNavScroll();
    }

    injectNav().catch(console.error);
})();