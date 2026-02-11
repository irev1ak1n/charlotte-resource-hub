(() => {
    const form = document.getElementById("giForm");
    if (!form) return;

    const success = document.getElementById("giSuccess");

    function setErr(name, msg){
        const field = form.elements[name];
        const err = form.querySelector(`[data-err="${name}"]`);
        if (err) err.textContent = msg || "";

        if (field){
            field.classList.toggle("gi-invalid", !!msg);
        }
    }

    function looksLikeEmail(v){
        v = (v || "").trim();
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    }

    function validate(){
        let ok = true;

        const firstName = form.elements.firstName.value.trim();
        const lastName  = form.elements.lastName.value.trim();
        const email     = form.elements.email.value.trim();
        const address   = form.elements.address.value.trim();
        const city      = form.elements.city.value.trim();
        const state     = form.elements.state.value.trim();
        const zip       = form.elements.zip.value.trim();
        const message   = form.elements.message.value.trim();

        if (firstName.length < 2){ setErr("firstName", "First name is required"); ok = false; } else setErr("firstName","");
        if (lastName.length < 2){ setErr("lastName", "Last name is required"); ok = false; } else setErr("lastName","");
        if (!looksLikeEmail(email)){ setErr("email", "Valid email is required"); ok = false; } else setErr("email","");

        if (address.length < 5){ setErr("address", "Address is required"); ok = false; } else setErr("address","");
        if (city.length < 2){ setErr("city", "City is required"); ok = false; } else setErr("city","");

        // allow "NC" or "North Carolina" but you want 2 letters visually
        if (state.length < 2){ setErr("state", "State is required"); ok = false; } else setErr("state","");

        // simple zip check (5 digits)
        if (!/^\d{5}(-\d{4})?$/.test(zip)){ setErr("zip", "Zip is required"); ok = false; } else setErr("zip","");

        if (message.length < 10){ setErr("message", "Please add a short message"); ok = false; } else setErr("message","");

        return ok;
    }
    ["firstName","lastName","email","address","city","state","zip","message","phone"].forEach((n) => {
        const el = form.elements[n];
        if (!el) return;
        el.addEventListener("input", () => setErr(n, ""));
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!validate()) return;

        form.querySelectorAll("input, textarea, button").forEach(el => el.disabled = true);

        if (success) success.classList.remove("hidden");

        setTimeout(() => {
            form.reset();
            form.querySelectorAll("input, textarea, button").forEach(el => el.disabled = false);
            if (success) success.classList.add("hidden");
        }, 1800);
    });
})();
