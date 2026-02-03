(async () => {
    async function injectFooter() {
        const footerMount = document.getElementById("siteFooter");
        if (!footerMount) return;

        // are we on /pages/... ?
        const inPages = location.pathname.includes("/pages/");
        const base = inPages ? ".." : ".";

        // load the footer partial
        const res = await fetch(`${base}/partials/footer.html`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Footer include failed: ${res.status}`);

        footerMount.innerHTML = await res.text();

        // if we are inside /pages/, rewrite asset paths:
        // assets/...  -> ../assets/...
        if (inPages) {
            footerMount.querySelectorAll('[src^="assets/"], [href^="assets/"]').forEach(node => {
                const attr = node.hasAttribute("src") ? "src" : "href";
                node.setAttribute(attr, "../" + node.getAttribute(attr));
            });
        }
    }
    try {
        await injectFooter();
    } catch (e) {
        console.error(e);
    }

})();