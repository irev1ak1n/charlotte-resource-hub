window.initNewsletter = function () {
    const form = document.getElementById("newsletterForm");
    const email = document.getElementById("nycEmail");
    const extra = document.getElementById("newsletterExtra");
    const section = document.querySelector(".hub-newsletter");
    const btn = document.getElementById("newsletterPrimaryBtn");

    const nameEl = document.getElementById("nycName");
    const zipEl = document.getElementById("nycZip");
    const phoneEl = document.getElementById("nycPhone");

    const errEmail = document.getElementById("errEmail");
    const errName = document.getElementById("errName");
    const errCountry = document.getElementById("errCountry");
    const errZip = document.getElementById("errZip");
    const errPhone = document.getElementById("errPhone");

    const input = document.getElementById("nycCountryInput");
    const hidden = document.getElementById("nycCountryHidden");
    const list = document.getElementById("countryList");
    const box = document.getElementById("countryBox");
    const toggleBtn = box ? box.querySelector(".hub-country-toggle") : null;

    if (!form || !email || !extra || !section) return;

    let lockedOpen = false;
    let hasTriedSubmit = false;

    function looksLikeEmail(v) {
        v = (v || "").trim();
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    }

    function setExpanded(on) {
        if (lockedOpen && !on) return;
        form.classList.toggle("is-expanded", on);
        section.classList.toggle("is-expanded", on);
        extra.setAttribute("aria-hidden", String(!on));
    }

    function setErr(inputEl, errEl, msg) {
        if (!inputEl || !errEl) return;
        const hasMsg = !!msg;
        errEl.textContent = msg || "";
        inputEl.classList.toggle("is-invalid", hasMsg);
    }

    function setCountryErr(msg) {
        if (errCountry) errCountry.textContent = msg || "";
        if (box) box.classList.toggle("is-invalid", !!msg);
    }

    function requireDigitsOnly(value, fieldName) {
        const v = (value || "").trim();
        if (!v) throw new Error(`${fieldName} is required`);
        if (!/^\d+$/.test(v)) throw new Error(`${fieldName} must contain numbers only`);
    }

    function validatePhone(value) {
        const v = (value || "").trim();
        if (!v) return;
        if (!/^[\d\s()+-]+$/.test(v)) throw new Error("Phone number contains invalid characters");
        const digits = v.replace(/\D/g, "");
        if (digits.length > 0 && digits.length < 7) throw new Error("Phone number looks too short");
    }

    function validateAll() {
        let ok = true;

        if (!looksLikeEmail(email.value)) {
            setErr(email, errEmail, "Email is required");
            ok = false;
        } else {
            setErr(email, errEmail, "");
        }

        if (nameEl) {
            if (nameEl.value.trim().length < 2) {
                setErr(nameEl, errName, "Full Name is required");
                ok = false;
            } else {
                setErr(nameEl, errName, "");
            }
        }

        if (hidden) {
            if (!hidden.value || hidden.value.trim().length === 0) {
                setCountryErr("Country is required");
                ok = false;
            } else {
                setCountryErr("");
            }
        }

        if (zipEl) {
            try {
                requireDigitsOnly(zipEl.value, "Zip Code");
                setErr(zipEl, errZip, "");
            } catch (err) {
                setErr(zipEl, errZip, err.message || "Zip Code is invalid");
                ok = false;
            }
        }

        if (phoneEl) {
            try {
                validatePhone(phoneEl.value);
                if (errPhone) setErr(phoneEl, errPhone, "");
            } catch (err) {
                if (errPhone) setErr(phoneEl, errPhone, err.message || "Phone number is invalid");
                else setErr(phoneEl, errZip, err.message || "Phone number is invalid");
                ok = false;
            }
        }

        return ok;
    }

    email.addEventListener("input", () => {
        if (looksLikeEmail(email.value)) {
            lockedOpen = true;
            setExpanded(true);
        } else {
            setExpanded(false);
        }
        if (hasTriedSubmit) setErr(email, errEmail, "");
    });

    if (btn) {
        btn.addEventListener("click", () => {
            lockedOpen = true;
            setExpanded(true);
            email.focus();
        });
    }

    form.addEventListener("submit", (e) => {
        hasTriedSubmit = true;

        lockedOpen = true;
        setExpanded(true);

        e.preventDefault();

        syncCountryHiddenFromVisible();

        if (!validateAll()) return;

        const submitBtn = form.querySelector(".nyc-submit");
        const originalText = submitBtn ? submitBtn.textContent : "";
        const successBox = document.getElementById("newsletterSuccess");

        if (submitBtn && submitBtn.disabled) return;

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "SENDING...";
            }

            form.setAttribute("target", "mlFrame");
            form.submit();

            form.classList.add("hidden");
            if (successBox) successBox.classList.remove("hidden");

            const media = section.querySelector(".hub-newsletter-media");
            if (media) media.classList.add("hidden");

            form.reset();
            if (hidden) hidden.value = "";
        } catch (err) {
            extra.insertAdjacentHTML(
                "afterbegin",
                `<div class="newsletter-error" style="margin-bottom:10px;" aria-live="polite">Something went wrong. Please try again.</div>`
            );
        } finally {
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }, 1200);
        }
    });

    if (nameEl) nameEl.addEventListener("input", () => hasTriedSubmit && setErr(nameEl, errName, ""));
    if (zipEl) {
        zipEl.addEventListener("input", () => {
            zipEl.value = zipEl.value.replace(/\D/g, "");
            if (hasTriedSubmit) setErr(zipEl, errZip, "");
        });
    }
    if (phoneEl) {
        phoneEl.addEventListener("input", () => {
            phoneEl.value = phoneEl.value.replace(/[^\d\s()+-]/g, "");
            if (hasTriedSubmit && errPhone) setErr(phoneEl, errPhone, "");
        });
    }
    if (input) input.addEventListener("input", () => hasTriedSubmit && setCountryErr(""));

    if (!input || !hidden || !list || !box || !toggleBtn) return;

    const FLAG = (code) => `https://flagcdn.com/w20/${code.toLowerCase()}.png`;

    const countries = [
        ["US", "United States"], ["CA", "Canada"], ["MX", "Mexico"],
        ["BR", "Brazil"], ["AR", "Argentina"], ["CL", "Chile"], ["CO", "Colombia"],
        ["PE", "Peru"], ["VE", "Venezuela"], ["UY", "Uruguay"], ["PY", "Paraguay"],
        ["BO", "Bolivia"], ["EC", "Ecuador"],
        ["GB", "United Kingdom"], ["IE", "Ireland"], ["FR", "France"], ["DE", "Germany"],
        ["ES", "Spain"], ["PT", "Portugal"], ["IT", "Italy"], ["NL", "Netherlands"],
        ["BE", "Belgium"], ["CH", "Switzerland"], ["AT", "Austria"],
        ["PL", "Poland"], ["CZ", "Czech Republic"], ["SK", "Slovakia"],
        ["HU", "Hungary"], ["RO", "Romania"], ["BG", "Bulgaria"],
        ["UA", "Ukraine"], ["BY", "Belarus"], ["RU", "Russia"],
        ["LT", "Lithuania"], ["LV", "Latvia"], ["EE", "Estonia"],
        ["FI", "Finland"], ["SE", "Sweden"], ["NO", "Norway"], ["DK", "Denmark"],
        ["IS", "Iceland"], ["GR", "Greece"], ["RS", "Serbia"], ["HR", "Croatia"],
        ["SI", "Slovenia"], ["BA", "Bosnia and Herzegovina"],
        ["MK", "North Macedonia"], ["AL", "Albania"], ["ME", "Montenegro"],
        ["GE", "Georgia"], ["AM", "Armenia"], ["AZ", "Azerbaijan"],
        ["KZ", "Kazakhstan"], ["UZ", "Uzbekistan"], ["TM", "Turkmenistan"],
        ["KG", "Kyrgyzstan"], ["TJ", "Tajikistan"],
        ["TR", "Turkey"], ["IL", "Israel"], ["SA", "Saudi Arabia"],
        ["AE", "United Arab Emirates"], ["QA", "Qatar"], ["KW", "Kuwait"],
        ["OM", "Oman"], ["BH", "Bahrain"], ["JO", "Jordan"], ["LB", "Lebanon"],
        ["IQ", "Iraq"], ["IR", "Iran"],
        ["IN", "India"], ["PK", "Pakistan"], ["BD", "Bangladesh"],
        ["LK", "Sri Lanka"], ["NP", "Nepal"],
        ["CN", "China"], ["JP", "Japan"], ["KR", "South Korea"],
        ["VN", "Vietnam"], ["TH", "Thailand"], ["MY", "Malaysia"],
        ["SG", "Singapore"], ["ID", "Indonesia"], ["PH", "Philippines"],
        ["KH", "Cambodia"], ["LA", "Laos"], ["MM", "Myanmar"],
        ["AU", "Australia"], ["NZ", "New Zealand"], ["PG", "Papua New Guinea"],
        ["ZA", "South Africa"], ["EG", "Egypt"], ["NG", "Nigeria"],
        ["KE", "Kenya"], ["GH", "Ghana"], ["MA", "Morocco"],
        ["DZ", "Algeria"], ["TN", "Tunisia"], ["ET", "Ethiopia"],
        ["UG", "Uganda"], ["TZ", "Tanzania"]
    ];

    function normalizeCountry(v) {
        return (v || "").trim().toLowerCase();
    }

    function syncCountryHiddenFromVisible() {
        if (!input || !hidden) return;

        const typed = normalizeCountry(input.value);
        if (!typed) {
            hidden.value = "";
            return;
        }

        const match = countries.find(([code, name]) => normalizeCountry(name) === typed);

        if (match) {
            hidden.value = match[1];
            if (hasTriedSubmit) setCountryErr("");
        } else {
            hidden.value = "";
        }
    }

    function render(filter = "") {
        const q = (filter || "").toLowerCase();
        list.innerHTML = "";

        const filtered = countries.filter(([code, name]) =>
            name.toLowerCase().includes(q) || code.toLowerCase().includes(q)
        );

        filtered.forEach(([code, name]) => {
            const item = document.createElement("div");
            item.className = "nyc-countryitem";
            item.innerHTML = `<img class="hub-flag" src="${FLAG(code)}" alt=""><span>${name}</span>`;

            item.addEventListener("click", () => {
                input.value = name;
                hidden.value = name;
                if (hasTriedSubmit) setCountryErr("");
                close();
            });

            list.appendChild(item);
        });

        if (!filtered.length) {
            const empty = document.createElement("div");
            empty.className = "nyc-countryitem";
            empty.style.opacity = ".6";
            empty.textContent = "No matches";
            list.appendChild(empty);
        }
    }

    function open() {
        list.classList.add("open");
        render(input.value);
        input.setAttribute("aria-expanded", "true");
        list.setAttribute("aria-hidden", "false");
    }

    function close() {
        list.classList.remove("open");
        input.setAttribute("aria-expanded", "false");
        list.setAttribute("aria-hidden", "true");
        syncCountryHiddenFromVisible();
    }

    function toggleOpenFromBox(e) {
        if (list.contains(e.target)) return;

        const isOpen = list.classList.contains("open");
        if (isOpen) close();
        else {
            open();
            input.focus();
        }
    }

    box.addEventListener("click", toggleOpenFromBox);

    toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleOpenFromBox(e);
    });

    input.addEventListener("input", () => {
        if (list.classList.contains("open")) render(input.value);
        syncCountryHiddenFromVisible();
    });

    input.addEventListener("change", syncCountryHiddenFromVisible);
    input.addEventListener("blur", syncCountryHiddenFromVisible);

    document.addEventListener("click", (e) => {
        if (!box.contains(e.target) && !list.contains(e.target)) close();
    });

    render("");
};
