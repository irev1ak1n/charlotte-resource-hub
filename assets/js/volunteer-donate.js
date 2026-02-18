(() => {
    const form = document.getElementById("giForm");
    if (!form) return;

    const success = document.getElementById("giSuccess");

    function setErr(name, msg) {
        const field = form.elements[name];
        const err = form.querySelector(`[data-err="${name}"]`);
        if (err) err.textContent = msg || "";
        if (field) field.classList.toggle("gi-invalid", !!msg);
    }

    function looksLikeEmail(v) {
        v = (v || "").trim();
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    }

    function requireText(name, label, minLen = 2) {
        const v = (form.elements[name]?.value || "").trim();
        if (!v || v.length < minLen) throw new Error(`${label} is required`);
        return v;
    }

    function requireCity(name) {
        const el = form.elements[name];
        const v = (el?.value || "").trim();
        if (!v || v.length < 2) throw new Error("City is required");

        if (!/^[a-zA-Z\s.'-]+$/.test(v)) {
            throw new Error("City cannot include numbers or symbols");
        }
        return v;
    }

    function requireState(name) {
        const el = form.elements[name];
        const v = (el?.value || "").trim();

        if (!v) throw new Error("State is required");

        if (/^[a-zA-Z]{2}$/.test(v)) {
            el.value = v.toUpperCase();
            return el.value;
        }

        const lettersOnly = v.replace(/[^a-zA-Z]/g, "");
        if (lettersOnly.length >= 2) {
            el.value = lettersOnly.slice(0, 2).toUpperCase();
            return el.value;
        }

        throw new Error("State must be 2 letters (e.g., NC)");
    }

    function requireZip(name) {
        const el = form.elements[name];
        const raw = (el?.value || "").trim();
        if (!raw) throw new Error("Zip is required");

        const cleaned = raw.replace(/\s+/g, "");

        if (!/^\d{5}(-\d{4})?$/.test(cleaned)) {
            throw new Error("Enter a valid ZIP (e.g., 28202 or 28202-1234)");
        }

        el.value = cleaned;
        return cleaned;
    }

    function validatePhoneOptional(name) {
        const el = form.elements[name];
        const v = (el?.value || "").trim();
        if (!v) return;

        if (!/^[\d\s()+-]+$/.test(v)) throw new Error("Phone can only include numbers and symbols: ( ) + -");

        const digits = v.replace(/\D/g, "");
        if (digits.length > 0 && digits.length < 7) throw new Error("Phone number looks too short");
    }

    function validateEmail(name) {
        const v = (form.elements[name]?.value || "").trim();
        if (!looksLikeEmail(v)) throw new Error("Valid email is required");
        return v;
    }

    function validateMessage(name) {
        const v = (form.elements[name]?.value || "").trim();
        if (!v || v.length < 10) throw new Error("Please add a short message");
        return v;
    }

    function validate() {
        let ok = true;

        ["firstName","lastName","email","address","city","state","zip","message","phone"].forEach(n => setErr(n, ""));

        try { requireText("firstName", "First name", 2); } catch (e) { setErr("firstName", e.message); ok = false; }
        try { requireText("lastName", "Last name", 2); } catch (e) { setErr("lastName", e.message); ok = false; }
        try { validateEmail("email"); } catch (e) { setErr("email", e.message); ok = false; }

        try { requireText("address", "Address", 5); } catch (e) { setErr("address", e.message); ok = false; }
        try { requireCity("city"); } catch (e) { setErr("city", e.message); ok = false; }
        try { requireState("state"); } catch (e) { setErr("state", e.message); ok = false; }

        try { requireZip("zip"); } catch (e) { setErr("zip", e.message); ok = false; }
        try { validateMessage("message"); } catch (e) { setErr("message", e.message); ok = false; }

        try { validatePhoneOptional("phone"); } catch (e) { setErr("phone", e.message); ok = false; }

        return ok;
    }

    ["firstName","lastName","email","address","city","state","zip","message","phone"].forEach((n) => {
        const el = form.elements[n];
        if (!el) return;

        el.addEventListener("input", () => {
            setErr(n, "");

            if (n === "zip") {
                el.value = el.value.replace(/[^\d-]/g, "");
                const parts = el.value.split("-");
                const a = (parts[0] || "").slice(0, 5).replace(/\D/g, "");
                const b = (parts[1] || "").replace(/\D/g, "").slice(0, 4);
                el.value = b ? `${a}-${b}` : a;
            }

            if (n === "phone") {
                el.value = el.value.replace(/[^\d\s()+-]/g, "");
            }

            if (n === "state") {
                el.value = el.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2);
            }

            if (n === "city") {
                el.value = el.value.replace(/[^a-zA-Z\s.'-]/g, "");
            }
        });

        el.addEventListener("blur", () => {
            if (n === "state") {
                try { requireState("state"); } catch (_) {}
            }
            if (n === "zip") {
                const v = (el.value || "").trim().replace(/\s+/g, "");
                if (/^\d{9}$/.test(v)) el.value = v.slice(0, 5) + "-" + v.slice(5);
            }
        });
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!validate()) return;

        form.querySelectorAll("input, textarea, button").forEach(el => el.disabled = true);

        if (success) success.classList.remove("hidden");

        setTimeout(() => {
            form.reset();
            ["firstName","lastName","email","address","city","state","zip","message","phone"].forEach(n => setErr(n, ""));
            form.querySelectorAll("input, textarea, button").forEach(el => el.disabled = false);
            if (success) success.classList.add("hidden");
        }, 1800);
    });
})();
