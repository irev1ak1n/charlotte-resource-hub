(() => {
    function initNavSearch() {
        const searchInput = document.getElementById("navSearchInput");
        if (!searchInput) return;

        const url = new URL(window.location.href);
        const qParam = (url.searchParams.get("q") || "").trim();

        if (qParam) {
            searchInput.value = qParam;
        }

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

        const searchBtn = document.getElementById("navSearchBtn");

        // safe word match (prevents "contact" matching "contactless")
        const hasWord = (text, word) =>
            new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text);

        // block garbage / nonsense queries
        function isValidQuery(raw) {
            const s = (raw || "").trim();

            // must contain at least one letter or digit
            if (!/[a-z0-9]/i.test(s)) return false;

            // allow only reasonable characters
            const allowed = /^[a-z0-9\s'&.,-]+$/i;
            if (!allowed.test(s)) return false;

            // at least 2 chars
            if (s.length < 2) return false;

            // reject if mostly punctuation
            const lettersDigits = (s.match(/[a-z0-9]/gi) || []).length;
            const ratio = lettersDigits / s.length;
            if (ratio < 0.35) return false;

            const q = s.toLowerCase().replace(/\s+/g, " ").trim();

            // numbers-only should never navigate
            if (/^\d+$/.test(q)) return false;

            // guard absurdly long paste
            if (q.length > 80) return false;

            const tokens = q.split(" ").filter(Boolean);

            const allowedSingles = new Set([
                // site navigation intents
                "news","updates","highlights","events","event","things","activities","fun","weekend","chill",
                "volunteer","donate","donation","give","help","support",
                "contact","email","message","about","mission","purpose",
                "faq","faqs","questions",
                "references","sources","citations",

                // directory / resources general
                "resources","directory","services","assistance","aid","support","programs","organizations",
                // education / youth
                "education","school","schools","learning","students","student",
                "youth","kids","children","after-school","tutoring","literacy","mentoring",
                // housing
                "housing","shelter","shelters","rent","rental","homeless","eviction","utilities",
                // food
                "food","meals","pantry","pantries","groceries","hunger",
                // health
                "health","medical","clinic","clinics","mental","therapy","counseling","wellness",
                // jobs / workforce
                "jobs","job","employment","career","careers","training","workforce","resume","internships",
                // crisis / safety
                "crisis","emergency","hotline","safety","abuse","violence",
                // location terms
                "charlotte","clt","mecklenburg","nc"
            ]);


            if (tokens.length === 1) {
                const t = tokens[0];

                // block any one-word query that isn't an approved intent
                if (!allowedSingles.has(t)) return false;

                // (extra safety) block repeated chars like "aaaaaa"
                if (/^(.)\1{4,}$/i.test(t)) return false;
            }

            return true;
        }

        function goToSmartSearch() {
            const raw = searchInput.value.trim();
            if (!raw) return;

            // If the query looks like junk, do nothing (keeps them on the homepage/current page)
            if (!isValidQuery(raw)) return;

            const q = raw.toLowerCase().replace(/\s+/g, " ").trim();

            const inPages = location.pathname.includes("/pages/");
            const base = inPages ? ".." : ".";
            const resourcesPath = `${base}/pages/resources`;

            const routes = [
                {
                    page: "news.html",
                    keys: [
                        "news",
                        "updates",
                        "highlights",
                        "now in clt",
                        "now in charlotte",
                        "clt news",
                        "community news",
                        "latest",
                        "latest news",
                    ],
                },

                { page: "events.html?cat=free", keys: ["free events"] },
                { page: "events.html?cat=music", keys: ["live music", "concerts"] },

                {
                    page: "events.html",
                    keys: [
                        "events",
                        "event",
                        "festival",
                        "festivals",
                        "markets",
                        "pop up",
                        "popup",
                    ],
                },

                { page: "things.html?cat=art", keys: ["art", "art & culture", "culture"] },
                {
                    page: "things.html?cat=outdoor",
                    keys: ["outdoor", "outdoors", "parks", "hiking"],
                },

                {
                    page: "things.html",
                    keys: [
                        "things to do",
                        "things",
                        "activities",
                        "what to do",
                        "fun",
                        "weekend",
                        "chill",
                    ],
                },

                {
                    page: "volunteer-donate.html",
                    keys: [
                        "volunteer",
                        "donate",
                        "donation",
                        "give",
                        "get involved",
                        "help out",
                        "community service",
                    ],
                },

                {
                    page: "references.html",
                    keys: ["references", "sources", "citations", "works cited"],
                },

                {
                    page: "faqs.html",
                    keys: ["faq", "faqs", "questions", "help questions"],
                },

                {
                    page: "contact-us.html",
                    keys: [
                        "contact",
                        "contact us",
                        "email",
                        "message",
                        "reach out",
                        "get in touch",
                    ],
                },

                {
                    page: "about-us.html",
                    keys: ["about", "about us", "who we are", "our mission", "mission", "purpose"],
                },

                // resources category intent (should FILTER, not just open the page)
                {
                    page: "resources.html",
                    keys: ["education", "school", "students", "youth", "after school", "tutoring", "literacy"],
                },
                {
                    page: "resources.html",
                    keys: ["housing", "shelter", "rent", "homeless", "eviction", "temporary housing"],
                },
                {
                    page: "resources.html",
                    keys: ["food", "food pantry", "meals", "groceries", "hunger"],
                },
                {
                    page: "resources.html",
                    keys: ["health", "clinic", "medical", "mental health", "therapy", "counseling"],
                },
                {
                    page: "resources.html",
                    keys: ["jobs", "job training", "employment", "career", "resume", "workforce"],
                },

                // genereral resources terms
                {
                    page: "resources.html",
                    keys: ["resources", "city resources", "directory", "resource hub", "help", "support", "assistance", "services"],
                },
            ];

            const matches = (keys) =>
                keys.some((k) => {
                    if (k.includes(" ")) return q.includes(k);
                    return hasWord(q, k);
                });

            const pageOnlyTerms = new Set([
                "resources",
                "city resources",
                "directory",
                "resource hub",
            ]);

            for (const r of routes) {
                if (!matches(r.keys)) continue;

                // Resources usually filter via ?q=
                if (r.page.startsWith("resources.html") || r.page.startsWith("resources")) {
                    // If user typed ONLY generic page terms, just open resources page
                    if (pageOnlyTerms.has(q)) {
                        window.location.href = resourcesPath;
                        return;
                    }

                    // Build URL safely (no string bugs)
                    const u = new URL(resourcesPath, window.location.href);
                    u.searchParams.set("q", raw);

                    let catSlug = "";
                    if (matches(["education", "school", "students", "youth", "after school", "tutoring", "literacy"])) catSlug = "education";
                    else if (matches(["housing", "shelter", "rent", "homeless", "eviction", "temporary housing"])) catSlug = "housing";
                    else if (matches(["food", "food pantry", "meals", "groceries", "hunger"])) catSlug = "food";
                    else if (matches(["health", "clinic", "medical", "mental health", "therapy", "counseling"])) catSlug = "health";
                    else if (matches(["jobs", "job training", "employment", "career", "resume", "workforce"])) catSlug = "jobs";

                    if (catSlug) u.searchParams.set("cat", catSlug);

                    window.location.href = u.toString();
                    return;
                }


                window.location.href = `${base}/pages/${r.page}`;
                return;
            }

            // fallback: treat as directory search
            sessionStorage.setItem("nav_q", raw);
            sessionStorage.setItem("nav_cat", "");
            const u = new URL(`${base}/pages/resources`, window.location.href);
            u.searchParams.set("q", raw);
            window.location.href = u.toString();

        }

        // Enter key
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                goToSmartSearch();
            }
        });

        // Search button click
        if (searchBtn) {
            searchBtn.addEventListener("click", goToSmartSearch);
        }
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
