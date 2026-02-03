window.initNavSearch = function () {
    /* ================= SEARCH PLACEHOLDER TYPEWRITER ================= */
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
        document.activeElement === searchInput || searchInput.value.trim().length > 0;

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
};

window.initNavScroll = function () {
    /* ================= NAVBAR SCROLL SHRINK ================= */
    const topBar = document.querySelector(".hero-top");
    if (!topBar) return;

    const onScroll = () => topBar.classList.toggle("is-scrolled", window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
};
