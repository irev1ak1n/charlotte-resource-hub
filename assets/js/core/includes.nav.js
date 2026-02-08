(() => {
    function initNavSearch() {
        const searchInput = document.getElementById("navSearchInput");
        if (!searchInput) return;

        const basePlaceholder = "Search resources...";
        const examples = [
            "Food assistance in Charlotte",
            "Charlotte housing & shelters",
            "Free clinics near me",
            "Job training in Mecklenburg County",
            "Youth programs in Charlotte",
        ];

        let exIndex = 0;
        let charIndex = 0;
        let deleting = false;

        const isUserUsing = () =>
            document.activeElement === searchInput || searchInput.value.trim().length > 0;

        function tick() {
            if (isUserUsing()) {
                searchInput.placeholder = basePlaceholder;
                setTimeout(tick, 250);
                return;
            }

            const full = examples[exIndex];

            if (!deleting) {
                charIndex++;
                searchInput.placeholder = full.slice(0, charIndex);
                if (charIndex >= full.length) {
                    deleting = true;
                    setTimeout(tick, 1100);
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

            setTimeout(tick, deleting ? 25 : 40);
        }

        searchInput.placeholder = basePlaceholder;
        tick();

        searchInput.addEventListener("focus", () => {
            searchInput.placeholder = basePlaceholder;
        });
    }

    function initNavScroll() {
        const topBar = document.querySelector(".hero-top");
        if (!topBar) return;

        const onScroll = () => topBar.classList.toggle("is-scrolled", window.scrollY > 10);

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
    }

    function setActiveLink(navMount) {
        const normalize = (p) => {
            if (!p) return "";
            p = p.split("?")[0].split("#")[0];
            p = p.replace(/\/+$/, "");
            p = p.split("/").pop() || "index";
            p = p.replace(/\.html$/i, "");
            return p.toLowerCase();
        };

        const current = normalize(location.pathname);

        navMount.querySelectorAll(".nav a.is-active").forEach((a) => a.classList.remove("is-active"));

        navMount.querySelectorAll(".nav a").forEach((a) => {
            const href = a.getAttribute("href") || "";
            if (href.startsWith("#") || href.startsWith("http")) return;

            const target = normalize(href);
            const isHome = (x) => x === "" || x === "index";

            if (isHome(current) && isHome(target)) {
                a.classList.add("is-active");
                return;
            }

            if (target && target === current) a.classList.add("is-active");
        });
    }

    function initDropdowns(navMount) {
        const nav = navMount.querySelector(".nav");
        if (!nav) return;

        const items = Array.from(nav.querySelectorAll(".nav-item.has-dd"));

        const closeAll = (except = null) => {
            items.forEach((item) => {
                if (item === except) return;
                item.classList.remove("open");
                const link = item.querySelector(".nav-link");
                if (link) link.setAttribute("aria-expanded", "false");
            });
        };

        items.forEach((item) => {
            const trigger = item.querySelector(".nav-link");
            const menu = item.querySelector(".nav-dd");
            if (!trigger || !menu) return;

            trigger.addEventListener("click", (e) => {
                const willOpen = !item.classList.contains("open");
                if (willOpen) e.preventDefault();
                closeAll(item);
                item.classList.toggle("open", willOpen);
                trigger.setAttribute("aria-expanded", String(willOpen));
            });

            trigger.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    closeAll(item);
                    item.classList.add("open");
                    trigger.setAttribute("aria-expanded", "true");
                    const first = menu.querySelector("a");
                    if (first) first.focus();
                }

                if (e.key === "Escape") {
                    closeAll();
                    trigger.focus();
                }

                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    closeAll(item);
                    item.classList.add("open");
                    trigger.setAttribute("aria-expanded", "true");
                    const first = menu.querySelector("a");
                    if (first) first.focus();
                }
            });

            menu.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    closeAll();
                    trigger.focus();
                }
            });
        });

        document.addEventListener("click", (e) => {
            if (!nav.contains(e.target)) closeAll();
        });

        window.addEventListener("scroll", () => closeAll(), { passive: true });
    }

    function setNavThemeByHero() {
        const hero = document.querySelector(".hero");
        const heroVisible = hero && getComputedStyle(hero).display !== "none";
        document.body.classList.toggle("no-hero", !heroVisible);
        document.body.classList.toggle("has-hero", !!heroVisible);
    }

    async function injectNav() {
        const navMount = document.getElementById("siteNav");
        if (!navMount) return;

        if (navMount.dataset.loaded === "1") return;
        navMount.dataset.loaded = "1";

        const inPages = location.pathname.includes("/pages/");
        const base = inPages ? ".." : ".";

        const res = await fetch(`${base}/partials/nav.html`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Nav include failed: ${res.status}`);

        navMount.innerHTML = await res.text();

        if (inPages) {
            navMount.querySelectorAll('[src^="assets/"], [href^="assets/"]').forEach((el) => {
                const attr = el.hasAttribute("src") ? "src" : "href";
                el.setAttribute(attr, "../" + el.getAttribute(attr));
            });
        }

        setNavThemeByHero();
        setActiveLink(navMount);
        initNavSearch();
        initNavScroll();
        initDropdowns(navMount);
    }

    injectNav().catch(console.error);
})();
