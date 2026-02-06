console.log("DIRECTORY.JS LOADED");

const listEl = document.getElementById("resourceList");
const statusEl = document.getElementById("resourceStatus");
const searchEl = document.getElementById("resourceSearch");
const filterEl = document.getElementById("categoryFilter");

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

    function render(resources) {
        listEl.innerHTML = "";

        if (!resources.length) {
            listEl.innerHTML = `<li style="opacity:.8;">No resources found.</li>`;
            return;
        }

        resources.forEach(r => {
            const li = document.createElement("li");
            li.style.border = "1px solid rgba(0,0,0,.12)";
            li.style.borderRadius = "12px";
            li.style.padding = "14px";
            li.style.background = "#fff";

            const name = r.name ?? r.title ?? "Unnamed resource";
            const category = r.category ?? r.type ?? "Uncategorized";

            li.innerHTML = `
        <div style="font-weight:800; font-size:18px; margin-bottom:6px;">${name}</div>
        <div style="opacity:.85;">${category}</div>
      `;

            listEl.appendChild(li);
        });
    }

    function populateCategories(resources) {
        if (!filterEl) return;

        const cats = Array.from(
            new Set(resources.map(r => (r.category || r.type || "").trim()).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b));

        filterEl.innerHTML = `<option value="">All categories</option>`;
        cats.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c;
            opt.textContent = c;
            filterEl.appendChild(opt);
        });
    }

    function applyFilters() {
        const q = (searchEl?.value || "").trim().toLowerCase();
        const cat = (filterEl?.value || "").trim().toLowerCase();

        const filtered = allResources.filter(r => {
            const name = (r.name || r.title || "").toLowerCase();
            const category = (r.category || r.type || "").toLowerCase();

            const matchesSearch = !q || name.includes(q) || category.includes(q);
            const matchesCat = !cat || category === cat;

            return matchesSearch && matchesCat;
        });

        setStatus(`Showing ${filtered.length} of ${allResources.length}`);
        render(filtered);
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
            setStatus(`Loaded ${allResources.length} resources`);
            render(allResources);

            if (searchEl) searchEl.addEventListener("input", applyFilters);
            if (filterEl) filterEl.addEventListener("change", applyFilters);
        })
        .catch(err => {
            console.error("FETCH ERROR:", err);
            setStatus("Failed to load resources.json (check path + JSON format).");
            listEl.innerHTML = `<li style="color:#b00020;">${err.message}</li>`;
        });
}