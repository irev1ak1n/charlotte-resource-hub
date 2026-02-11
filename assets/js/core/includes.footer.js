(async () => {

    async function injectFooter() {

        // Where the footer will be placed
        const footerMount = document.getElementById("siteFooter");
        if (!footerMount) return; // stop if page doesn’t have a footer slot

        // Prevent loading the footer more than once
        if (footerMount.dataset.loaded === "1") return;
        footerMount.dataset.loaded = "1";

        // Check if we are inside /pages/ folder
        const inPages = location.pathname.includes("/pages/");
        const base = inPages ? ".." : ".";

        // Fetch the footer partial
        const res = await fetch(`${base}/partials/footer.html`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Footer include failed: ${res.status}`);

        // Inserts footer HtML into the page
        footerMount.innerHTML = await res.text();

        // Fix relative paths when footer is loaded from /pages/
        if (inPages) {
            footerMount
                .querySelectorAll('[src^="assets/"], [href^="assets/"]')
                .forEach(el => {
                    const attr = el.hasAttribute("src") ? "src" : "href";
                    el.setAttribute(attr, "../" + el.getAttribute(attr));
                });
        }

        // Initializes newsletter logic after footer is loaded
        if (window.initNewsletter) {
            window.initNewsletter();
        }
    }

    // Runs footer injection and catch any errors
    injectFooter().catch(console.error);

})();