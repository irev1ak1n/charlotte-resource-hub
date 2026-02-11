const articles = {
    shopping: {
        title: "Charlotte Shopping Guide",
        tag: "SHOPPING",
        subtitle: "From local boutiques to destination shopping districts across the city.",
        image: "../assets/img/articles/shopping.jpg",
        body: `
            <p>Charlotte offers a diverse shopping scene that blends local character with major retail destinations.</p>

            <h2>Local Favorites</h2>
            <p>Neighborhoods like NoDa, Plaza Midwood, and South End are home to independent shops, vintage stores, and local makers.</p>

            <h2>Major Shopping Destinations</h2>
            <p>From SouthPark Mall to open-air shopping centers, Charlotte provides convenient access to national brands.</p>
        `
    },

    whitewater: {
        title: "Experience Winter at the Whitewater Center",
        tag: "OUTDOORS & ADVENTURE",
        subtitle: "Lights, ice skating, and outdoor fun just minutes from Uptown.",
        image: "../assets/img/articles/whitewater.jpg",
        body: `
            <p>The U.S. National Whitewater Center transforms into a winter destination each year.</p>

            <h2>Seasonal Attractions</h2>
            <p>Visitors can enjoy ice skating, illuminated trails, and holiday events throughout the season.</p>

            <h2>Plan Your Visit</h2>
            <p>Winter activities are typically available from late November through February.</p>
        `
    },

    spa: {
        title: "The Ultimate Charlotte Spa Guide",
        tag: "THINGS TO DO",
        subtitle: "Relaxation and wellness experiences across the city.",
        image: "../assets/img/articles/spa.jpg",
        body: `
            <p>Charlotte is home to a growing number of wellness and spa experiences.</p>

            <h2>Day Spas</h2>
            <p>From massage therapy to skincare treatments, many spas offer flexible options.</p>

            <h2>Wellness Retreats</h2>
            <p>Some locations provide full-day relaxation experiences focused on mental and physical health.</p>
        `
    },

    opened: {
        title: "Just Opened in Charlotte — February 2026",
        tag: "EAT & DRINK",
        subtitle: "New restaurants, cafés, and bars worth checking out.",
        image: "../assets/img/articles/opened.jpg",
        body: `
            <p>Charlotte’s food scene continues to grow with new openings each month.</p>

            <h2>New Restaurants</h2>
            <p>February brought several highly anticipated restaurant openings across the city.</p>

            <h2>Support Local</h2>
            <p>Trying new spots helps support small businesses and local entrepreneurs.</p>
        `
    }
};

const params = new URLSearchParams(window.location.search);
const id = params.get("id") || "shopping";
const article = articles[id] || articles.shopping;

const titleEl = document.getElementById("articleTitle");
const tagEl = document.getElementById("articleTag");
const subEl = document.getElementById("articleSubtitle");
const imgEl = document.getElementById("articleImage");
const contentEl = document.getElementById("articleContent");

if (!titleEl || !tagEl || !subEl || !imgEl || !contentEl) {
    console.error("Missing required article elements (check IDs in article.html).");
} else {
    titleEl.textContent = article.title;
    tagEl.textContent = article.tag;
    subEl.textContent = article.subtitle;

    const overlay = `linear-gradient(
    90deg,
    rgba(0,0,0,.75) 0%,
    rgba(0,0,0,.45) 35%,
    rgba(0,0,0,.15) 65%,
    rgba(0,0,0,.05) 100%
  )`;

    imgEl.style.backgroundImage = `${overlay}, url('${article.image}')`;
    imgEl.style.backgroundSize = "cover";
    imgEl.style.backgroundPosition = "center";

    contentEl.innerHTML = article.body;
}
