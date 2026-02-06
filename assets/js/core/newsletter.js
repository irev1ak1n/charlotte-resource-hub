window.initNewsletter = function () {

    const form  = document.getElementById('newsletterForm');
    const email = document.getElementById('nycEmail');
    const extra = document.getElementById('newsletterExtra');
    const section = document.querySelector('.hub-newsletter');
    const btn= document.getElementById('newsletterPrimaryBtn');

    // extra fields
    const nameEl = document.getElementById('nycName');
    const zipEl  = document.getElementById('nycZip');

    // error placeholders (add these divs in HTML)
    const errEmail   = document.getElementById('errEmail');
    const errName    = document.getElementById('errName');
    const errCountry = document.getElementById('errCountry');
    const errZip     = document.getElementById('errZip');

    // country dropdown elements
    const input     = document.getElementById("nycCountryInput");
    const hidden    = document.getElementById("nycCountryHidden");
    const list      = document.getElementById("countryList");
    const box       = document.getElementById("countryBox");
    const toggleBtn = box ? box.querySelector(".hub-country-toggle") : null;

    // Safe: if newsletter block isn't on this page, do nothing
    if (!form || !email || !extra || !section) return;

    /* ================= NEWSLETTER EXPAND (LOCKED OPEN) ================= */
    let lockedOpen = false;     // once expanded, never auto-collapse
    let hasTriedSubmit = false; // show red messages after user tries to submit

    function looksLikeEmail(v) {
        v = (v || '').trim();
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    }

    function setExpanded(on) {
        if (lockedOpen && !on) return; // don't shrink once locked
        form.classList.toggle('is-expanded', on);
        section.classList.toggle('is-expanded', on);
        extra.setAttribute('aria-hidden', String(!on));
    }

    // expand + lock when email becomes valid (won't shrink on delete)
    email.addEventListener('input', () => {
        if (looksLikeEmail(email.value)) {
            lockedOpen = true;
            setExpanded(true);
        } else {
            setExpanded(false);
        }

        // live clear email error if user is typing
        if (hasTriedSubmit) setErr(email, errEmail, "");
    });

    // expand + lock when user clicks SIGN UP
    if (btn) {
        btn.addEventListener('click', () => {
            lockedOpen = true;
            setExpanded(true);
            email.focus();
        });
    }

    /* ================= RED NYC-STYLE ERRORS ================= */
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

    function validateAll() {
        let ok = true;

        // Email
        if (!looksLikeEmail(email.value)) {
            setErr(email, errEmail, "Email is required");
            ok = false;
        } else {
            setErr(email, errEmail, "");
        }

        // Full Name
        if (nameEl) {
            if (nameEl.value.trim().length < 2) {
                setErr(nameEl, errName, "Full Name is required");
                ok = false;
            } else {
                setErr(nameEl, errName, "");
            }
        }

        // Country (hidden field is the actual submitted value)
        if (hidden) {
            if (!hidden.value || hidden.value.trim().length === 0) {
                setCountryErr("Country is required");
                ok = false;
            } else {
                setCountryErr("");
            }
        }

        // Zip
        if (zipEl) {
            if (!zipEl.value.trim()) {
                setErr(zipEl, errZip, "Zip Code is required");
                ok = false;
            } else {
                setErr(zipEl, errZip, "");
            }
        }

        return ok;
    }

    // Validate on submit (SUBSCRIBE button submits the form)
    form.addEventListener("submit", (e) => {
        hasTriedSubmit = true;

        lockedOpen = true;
        setExpanded(true);

        e.preventDefault();
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

            // Ensure target exists
            form.setAttribute("target", "mlFrame");

            // MailerLite silent submit
            form.submit();

            // Show success UI
            form.classList.add("hidden");
            if (successBox) successBox.classList.remove("hidden");

            // Clear values
            form.reset();
            if (hidden) hidden.value = "";

        } // try
        catch (err) {
            extra.insertAdjacentHTML(
                "afterbegin",
                `<div class="newsletter-error" style="margin-bottom:10px;" aria-live="polite">
        Something went wrong. Please try again.
      </div>`
            );
        } // try-catch
        finally {
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }, 1200);

        } // try-finally

    }); // form

    // Live clear errors (after first submit attempt)
    if (nameEl) nameEl.addEventListener("input", () => hasTriedSubmit && setErr(nameEl, errName, ""));
    if (zipEl)  zipEl.addEventListener("input", () => hasTriedSubmit && setErr(zipEl, errZip, ""));
    if (input)  input.addEventListener("input", () => hasTriedSubmit && setCountryErr(""));

    /* ================= COUNTRY DROPDOWN (OPEN BY CLICKING WHOLE BOX) ================= */
    if (!input || !hidden || !list || !box || !toggleBtn) return;

    const FLAG = code => `https://flagcdn.com/w20/${code.toLowerCase()}.png`;

    const countries = [
        // North America
        ["US","United States"],["CA","Canada"],["MX","Mexico"],

        // South America
        ["BR","Brazil"],["AR","Argentina"],["CL","Chile"],["CO","Colombia"],
        ["PE","Peru"],["VE","Venezuela"],["UY","Uruguay"],["PY","Paraguay"],
        ["BO","Bolivia"],["EC","Ecuador"],

        // Europe
        ["GB","United Kingdom"],["IE","Ireland"],["FR","France"],["DE","Germany"],
        ["ES","Spain"],["PT","Portugal"],["IT","Italy"],["NL","Netherlands"],
        ["BE","Belgium"],["CH","Switzerland"],["AT","Austria"],
        ["PL","Poland"],["CZ","Czech Republic"],["SK","Slovakia"],
        ["HU","Hungary"],["RO","Romania"],["BG","Bulgaria"],
        ["UA","Ukraine"],["BY","Belarus"],["RU","Russia"],
        ["LT","Lithuania"],["LV","Latvia"],["EE","Estonia"],
        ["FI","Finland"],["SE","Sweden"],["NO","Norway"],["DK","Denmark"],
        ["IS","Iceland"],["GR","Greece"],["RS","Serbia"],["HR","Croatia"],
        ["SI","Slovenia"],["BA","Bosnia and Herzegovina"],
        ["MK","North Macedonia"],["AL","Albania"],["ME","Montenegro"],

        // Caucasus & Central Asia
        ["GE","Georgia"],["AM","Armenia"],["AZ","Azerbaijan"],
        ["KZ","Kazakhstan"],["UZ","Uzbekistan"],["TM","Turkmenistan"],
        ["KG","Kyrgyzstan"],["TJ","Tajikistan"],

        // Middle East
        ["TR","Turkey"],["IL","Israel"],["SA","Saudi Arabia"],
        ["AE","United Arab Emirates"],["QA","Qatar"],["KW","Kuwait"],
        ["OM","Oman"],["BH","Bahrain"],["JO","Jordan"],["LB","Lebanon"],
        ["IQ","Iraq"],["IR","Iran"],

        // South Asia
        ["IN","India"],["PK","Pakistan"],["BD","Bangladesh"],
        ["LK","Sri Lanka"],["NP","Nepal"],

        // East & Southeast Asia
        ["CN","China"],["JP","Japan"],["KR","South Korea"],
        ["VN","Vietnam"],["TH","Thailand"],["MY","Malaysia"],
        ["SG","Singapore"],["ID","Indonesia"],["PH","Philippines"],
        ["KH","Cambodia"],["LA","Laos"],["MM","Myanmar"],

        // Oceania
        ["AU","Australia"],["NZ","New Zealand"],["PG","Papua New Guinea"],

        // Africa
        ["ZA","South Africa"],["EG","Egypt"],["NG","Nigeria"],
        ["KE","Kenya"],["GH","Ghana"],["MA","Morocco"],
        ["DZ","Algeria"],["TN","Tunisia"],["ET","Ethiopia"],
        ["UG","Uganda"],["TZ","Tanzania"]
    ];

    function render(filter = "") {
        const q = (filter || "").toLowerCase();
        list.innerHTML = "";

        const filtered = countries.filter(([code, name]) =>
            name.toLowerCase().includes(q) || code.toLowerCase().includes(q)
        );

        filtered.forEach(([code, name]) => {
            const item = document.createElement("div");
            item.className = "nyc-countryitem";
            item.innerHTML = `
        <img class="hub-flag" src="${FLAG(code)}" alt="">
        <span>${name}</span>
      `;

            item.addEventListener("click", () => {
                input.value = name;
                hidden.value = name;

                if (hasTriedSubmit) setCountryErr(""); // clear red error if any

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

    // Clicking the whole control toggles (textbox + arrow area)
    box.addEventListener("click", toggleOpenFromBox);

    // Arrow toggles too (avoid double-trigger)
    toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleOpenFromBox(e);
    });

    // Typing filters only if dropdown is open
    input.addEventListener("input", () => {
        if (list.classList.contains("open")) render(input.value);
    });

    // Clicking outside closes
    document.addEventListener("click", (e) => {
        if (!box.contains(e.target) && !list.contains(e.target)) close();
    });

    render("");

};