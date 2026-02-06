console.log("DIRECTORY.JS LOADED");

const listEl   = document.getElementById("resourceList");
const statusEl = document.getElementById("resourceStatus");
const searchEl = document.getElementById("resourceSearch");
const filterEl = document.getElementById("categoryFilter");

// NEW (optional UI controls)
const sortEl  = document.getElementById("sortSelect");
const clearEl = document.getElementById("clearFilters");

let allResources = [];

// If this page doesn't have directory UI, stop (safe if script is included elsewhere)
if (!listEl || !statusEl) {
    console.log("No directory elements found. Exiting.");
} else {

    function setStatus(msg) {
        statusEl.textContent = msg;
    }

    async function loadResources() {
        // robust: works from /index.html and /pages/directory.html
        const url = new URL("../data/resources.json", window.location.href);

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status} loading ${url}`);

        return res.json();
    }

    function getName(r) {
        return (r?.name ?? r?.title ?? "Unnamed resource").toString();
    }

    function getCategory(r) {
        return (r?.category ?? r?.type ?? "Uncategorized").toString();
    }

    function render(resources) {
        listEl.innerHTML = "";

        if (!resources.length) {
            listEl.innerHTML = `<li style="opacity:.8;">No resources found.</li>`;
            return;
        }

        resources.forEach(r => {
            const li = document.createElement("li");
            // ✅ No inline styles — let CSS handle card styling via .dir-list > li

            const name = getName(r);
            const category = getCategory(r);

            li.innerHTML = `
        <div style="font-weight:800; font-size:18px; margin-bottom:6px;">${escapeHtml(name)}</div>
        <div style="opacity:.85;">${escapeHtml(category)}</div>
      `;

            listEl.appendChild(li);
        });
    }

    function populateCategories(resources) {
        if (!filterEl) return;

        const cats = Array.from(
            new Set(resources.map(r => getCategory(r).trim()).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b));

        filterEl.innerHTML = `<option value="">All categories</option>`;
        cats.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c;
            opt.textContent = c;
            filterEl.appendChild(opt);
        });
    }

    function applySort(resources) {
        const mode = (sortEl?.value || "name-asc").toLowerCase();

        const sorted = [...resources];
        sorted.sort((a, b) => {
            const nameA = getName(a).toLowerCase();
            const nameB = getName(b).toLowerCase();
            const catA  = getCategory(a).toLowerCase();
            const catB  = getCategory(b).toLowerCase();

            switch (mode) {
                case "name-desc":
                    return nameB.localeCompare(nameA);
                case "category-asc":
                    return catA.localeCompare(catB) || nameA.localeCompare(nameB);
                case "category-desc":
                    return catB.localeCompare(catA) || nameA.localeCompare(nameB);
                case "name-asc":
                default:
                    return nameA.localeCompare(nameB);
            }
        });

        return sorted;
    }

    function applyFilters() {
        const q = (searchEl?.value || "").trim().toLowerCase();
        const cat = (filterEl?.value || "").trim().toLowerCase();

        const filtered = allResources.filter(r => {
            const name = getName(r).toLowerCase();
            const category = getCategory(r).toLowerCase();

            const matchesSearch = !q || name.includes(q) || category.includes(q);
            const matchesCat = !cat || category === cat;

            return matchesSearch && matchesCat;
        });

        const finalList = applySort(filtered);

        setStatus(`Showing ${finalList.length} of ${allResources.length}`);
        render(finalList);
    }

    function clearFilters() {
        if (searchEl) searchEl.value = "";
        if (filterEl) filterEl.value = "";
        if (sortEl) sortEl.value = "name-asc";
        applyFilters();
    }

    // simple XSS-safe output for name/category (good habit since JSON is data)
    function escapeHtml(str) {
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    // Boot
    setStatus("Loading resources...");
    loadResources()
        .then(data => {
            console.log("Resources from JSON:", data);

            allResources = Array.isArray(data)
                ? data
                : (Array.isArray(data.resources) ? data.resources : []);

            populateCategories(allResources);

            // ✅ default to sorted list right away
            applyFilters();
            setStatus(`Loaded ${allResources.length} resources`);

            // Events
            if (searchEl) searchEl.addEventListener("input", applyFilters);
            if (filterEl) filterEl.addEventListener("change", applyFilters);
            if (sortEl) sortEl.addEventListener("change", applyFilters);
            if (clearEl) clearEl.addEventListener("click", clearFilters);
        })
        .catch(err => {
            console.error("FETCH ERROR:", err);
            setStatus("Failed to load resources.json (check path + JSON format).");
            listEl.innerHTML = `<li style="color:#b00020;">${err.message}</li>`;
        });
}
