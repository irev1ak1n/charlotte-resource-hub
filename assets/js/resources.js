console.log("DIRECTORY.JS LOADED");

const listEl = document.getElementById("resourceList");
const statusEl = document.getElementById("resourceStatus");
const searchEl = document.getElementById("resourceSearch");

const sortEl = document.getElementById("sortSelect");
const clearEl = document.getElementById("clearFilters");

const catWrap = document.getElementById("categoryList");

const viewListBtn = document.getElementById("viewList");
const viewGridBtn = document.getElementById("viewGrid");

let allResources = [];
let filters = {
    category: "",
    cities: new Set(),
    neighborhoods: new Set()
};

if (!listEl || !statusEl) {
    console.log("No directory elements found. Exiting.");
}
else {
    function setStatus(msg) {
        statusEl.textContent = msg;
    }

    function getQueryParam(name) {
        const url = new URL(window.location.href);
        return (url.searchParams.get(name) || "").trim();
    }

    async function loadResources() {
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

    function getDescription(r) {
        return (r?.description ?? r?.desc ?? r?.summary ?? "").toString();
    }

    function getCity(r) {
        return (r?.city ?? r?.location?.city ?? "").toString().trim();
    }

    function getNeighborhood(r) {
        return (r?.neighborhood ?? r?.location?.neighborhood ?? "").toString().trim();
    }

    function getWebsite(r) {
        return (r?.website ?? r?.url ?? r?.link ?? "").toString().trim();
    }

    function getPhone(r) {
        return (r?.phone ?? r?.tel ?? r?.telephone ?? "").toString().trim();
    }

    function escapeHtml(str) {
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function escapeAttr(str) {
        return escapeHtml(str).replaceAll("`", "&#096;");
    }

    function safeUrl(url) {
        const u = (url || "").trim();
        if (!u) return "";
        if (/^https?:\/\//i.test(u)) return u;
        if (/^www\./i.test(u)) return `https://${u}`;
        return u;
    }

    function prettyUrl(url) {
        try {
            const u = new URL(url);
            return u.hostname.replace(/^www\./, "");
        } catch {
            return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
        }
    }

    function applySort(resources) {
        const mode = (sortEl?.value || "name-asc").toLowerCase();
        const sorted = [...resources];

        sorted.sort((a, b) => {
            const nameA = getName(a).toLowerCase();
            const nameB = getName(b).toLowerCase();
            const catA = getCategory(a).toLowerCase();
            const catB = getCategory(b).toLowerCase();

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

    function render(resources) {
        listEl.innerHTML = "";

        if (!resources.length) {
            listEl.innerHTML = `<li style="opacity:.8;">No resources found.</li>`;
            return;
        }

        resources.forEach(r => {
            const li = document.createElement("li");

            const name = getName(r);
            const category = getCategory(r);
            const desc = getDescription(r);
            const city = getCity(r);
            const nb = getNeighborhood(r);
            const urlRaw = getWebsite(r);
            const url = safeUrl(urlRaw);
            const phone = getPhone(r);

            const locParts = [nb, city].filter(Boolean);
            const locationLine = locParts.length ? locParts.join(" • ") : "";

            const descSafe = escapeHtml(desc || "");
            const hasDesc = Boolean(desc && desc.trim());

            const websiteHtml = url
                ? `<a class="dir-link" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(prettyUrl(url))}</a>`
                : "";

            const phoneHtml = phone
                ? `<a class="dir-link" href="tel:${escapeAttr(phone.replace(/[^\d+]/g, ""))}">${escapeHtml(phone)}</a>`
                : "";

            const metaBits = [locationLine, phoneHtml, websiteHtml].filter(Boolean);

            li.innerHTML = `
        <div class="dir-card-title">${escapeHtml(name)}</div>
        <div class="dir-card-sub">${escapeHtml(category)}</div>
        ${hasDesc ? `<div class="dir-card-desc">${descSafe}</div>` : ``}
        ${metaBits.length ? `<div class="dir-card-meta">${metaBits.join('<span class="dir-dot">•</span>')}</div>` : ``}
      `;

            listEl.appendChild(li);
        });
    }

    function buildCounts(resources, getter) {
        const m = new Map();
        resources.forEach(r => {
            const v = (getter(r) || "").trim();
            if (!v) return;
            m.set(v, (m.get(v) || 0) + 1);
        });
        return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    }

    function buildCountsCategory(resources) {
        const m = new Map();
        resources.forEach(r => {
            const v = getCategory(r).trim();
            if (!v) return;
            m.set(v, (m.get(v) || 0) + 1);
        });
        return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    }

    function renderSidebar(resources) {
        if (!catWrap) return;

        const catCounts = buildCountsCategory(resources);
        const cityCounts = buildCounts(resources, getCity);
        const nbCounts = buildCounts(resources, getNeighborhood);

        const hasCities = cityCounts.length > 0;
        const hasNbs = nbCounts.length > 0;

        catWrap.innerHTML = `
      <div class="dir-fgroup">
        <div class="dir-fgroup-title">Category</div>
        <div class="dir-cats">
          ${catCounts
            .map(([name, count]) => {
                const active = filters.category.toLowerCase() === name.toLowerCase() ? "is-active" : "";
                return `
                <button class="dir-chip ${active}" type="button" data-filter="category" data-value="${escapeAttr(name)}">
                  <span class="dir-chip-name">${escapeHtml(name)}</span>
                  <span class="dir-chip-count">${count}</span>
                </button>
              `;
            })
            .join("")}
        </div>
      </div>

      ${hasCities ? `
        <div class="dir-fgroup">
          <div class="dir-fgroup-title">City</div>
          <div class="dir-checks">
            ${cityCounts
            .map(([name, count]) => {
                const key = name.toLowerCase();
                const checked = filters.cities.has(key) ? "checked" : "";
                return `
                  <label class="dir-check">
                    <span class="dir-check-left">
                      <input type="checkbox" data-filter="city" value="${escapeAttr(name)}" ${checked} />
                      <span>${escapeHtml(name)}</span>
                    </span>
                    <span class="dir-chip-count">${count}</span>
                  </label>
                `;
            })
            .join("")}
          </div>
        </div>
      ` : ""}

      ${hasNbs ? `
        <div class="dir-fgroup">
          <div class="dir-fgroup-title">Neighborhood</div>
          <div class="dir-checks">
            ${nbCounts
            .map(([name, count]) => {
                const key = name.toLowerCase();
                const checked = filters.neighborhoods.has(key) ? "checked" : "";
                return `
                  <label class="dir-check">
                    <span class="dir-check-left">
                      <input type="checkbox" data-filter="neighborhood" value="${escapeAttr(name)}" ${checked} />
                      <span>${escapeHtml(name)}</span>
                    </span>
                    <span class="dir-chip-count">${count}</span>
                  </label>
                `;
            })
            .join("")}
          </div>
        </div>
      ` : ""}
    `;

        catWrap.querySelectorAll('button[data-filter="category"]').forEach(btn => {
            btn.addEventListener("click", () => {
                const val = btn.getAttribute("data-value") || "";
                filters.category = (filters.category && filters.category.toLowerCase() === val.toLowerCase()) ? "" : val;
                applyFilters();
                renderSidebar(allResources);
            });
        });

        catWrap.querySelectorAll('input[type="checkbox"][data-filter="city"]').forEach(cb => {
            cb.addEventListener("change", () => {
                const v = (cb.value || "").trim().toLowerCase();
                if (!v) return;
                if (cb.checked) filters.cities.add(v);
                else filters.cities.delete(v);
                applyFilters();
            });
        });

        catWrap.querySelectorAll('input[type="checkbox"][data-filter="neighborhood"]').forEach(cb => {
            cb.addEventListener("change", () => {
                const v = (cb.value || "").trim().toLowerCase();
                if (!v) return;
                if (cb.checked) filters.neighborhoods.add(v);
                else filters.neighborhoods.delete(v);
                applyFilters();
            });
        });
    }

    function applyFilters() {
        const q = (searchEl?.value || "").trim().toLowerCase();
        const cat = (filters.category || "").trim().toLowerCase();

        const filtered = allResources.filter(r => {
            const name = getName(r).toLowerCase();
            const category = getCategory(r).toLowerCase();
            const desc = getDescription(r).toLowerCase();
            const city = getCity(r).toLowerCase();
            const nb = getNeighborhood(r).toLowerCase();

            const matchesSearch =
                !q ||
                name.includes(q) ||
                category.includes(q) ||
                desc.includes(q) ||
                city.includes(q) ||
                nb.includes(q);

            const matchesCat = !cat || category === cat;

            const matchesCity = filters.cities.size === 0 || (city && filters.cities.has(city));
            const matchesNb = filters.neighborhoods.size === 0 || (nb && filters.neighborhoods.has(nb));

            return matchesSearch && matchesCat && matchesCity && matchesNb;
        });

        const finalList = applySort(filtered);

        setStatus(`Showing ${finalList.length} of ${allResources.length}`);
        render(finalList);
    }

    function clearFilters() {
        if (searchEl) searchEl.value = "";
        filters.category = "";
        filters.cities = new Set();
        filters.neighborhoods = new Set();
        if (sortEl) sortEl.value = "name-asc";
        applyFilters();
        renderSidebar(allResources);
    }

    function setView(mode) {
        const isGrid = mode === "grid";
        listEl.classList.toggle("is-grid", isGrid);
        if (viewListBtn) viewListBtn.classList.toggle("is-active", !isGrid);
        if (viewGridBtn) viewGridBtn.classList.toggle("is-active", isGrid);
    }

    setStatus("Loading resources...");
    loadResources()
        .then(data => {
            allResources = Array.isArray(data) ? data : (Array.isArray(data.resources) ? data.resources : []);
            renderSidebar(allResources);
            setView("list");

            const navQ = getQueryParam("q");
            if (navQ && searchEl) searchEl.value = navQ;

            applyFilters();

            if (navQ && searchEl) {
                searchEl.focus({ preventScroll: true });
                searchEl.setSelectionRange(0, searchEl.value.length);

                const y = searchEl.getBoundingClientRect().top + window.scrollY - 120;
                window.scrollTo({ top: y, behavior: "smooth" });
            }

            // if (navQ) {
            //     document.querySelector(".dir-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
            // }

            // setStatus(`Loaded ${allResources.length} resources`);

            if (searchEl) searchEl.addEventListener("input", applyFilters);
            if (sortEl) sortEl.addEventListener("change", applyFilters);
            if (clearEl) clearEl.addEventListener("click", clearFilters);

            if (viewListBtn) viewListBtn.addEventListener("click", () => setView("list"));
            if (viewGridBtn) viewGridBtn.addEventListener("click", () => setView("grid"));
        })
        .catch(err => {
            console.error("FETCH ERROR:", err);
            setStatus("Failed to load resources.json (check path + JSON format).");
            listEl.innerHTML = `<li style="color:#b00020;">${err.message}</li>`;
        });
}
