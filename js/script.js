
// ROTUM PROTOCOL LIVE STATS

const stats = {
    contribution: 2.03,
    network: 142.8,
    operators: 12847,
    seasonPool: 850000
};

function animateNumber(element, target, suffix = "") {
    let current = 0;
    const increment = target / 100;

    const interval = setInterval(() => {
        current += increment;

        if (current >= target) {
            current = target;
            clearInterval(interval);
        }

        element.innerText =
            current.toFixed(2).replace(/\.00$/, "") + suffix;

    }, 20);
}

window.addEventListener("load", () => {

    const contribution =
        document.getElementById("contribution");

    const network =
        document.getElementById("network");

    const operators =
        document.getElementById("operators");

    const season =
        document.getElementById("season");

    if (contribution)
        animateNumber(contribution,
            stats.contribution,
            " TH/s");

    if (network)
        animateNumber(network,
            stats.network,
            " PH/s");

    if (operators)
        animateNumber(operators,
            stats.operators);

    if (season)
        animateNumber(season,
            stats.seasonPool,
            " RTM");
});


// LIVE NETWORK FEED

const feed = [
    "Operator #918 reached 1 PH/s contribution",
    "Season reward pool increased",
    "Network activity spike detected",
    "Operator #291 upgraded contribution tier",
    "Epoch #284719 finalized",
    "New contributor joined network",
    "Season multiplier activated",
    "Contribution leaderboard updated"
];

function updateFeed() {

    const container =
        document.getElementById("network-feed");

    if (!container)
        return;

    const item =
        document.createElement("div");

    item.className = "feed-item";

    item.innerHTML =
        "⚡ " +
        feed[Math.floor(
            Math.random() * feed.length
        )];

    container.prepend(item);

    while (container.children.length > 6)
        container.removeChild(
            container.lastChild
        );
}

setInterval(updateFeed, 4000);


// GLOW EFFECT

document.addEventListener(
    "mousemove",
    e => {

        const glow =
            document.querySelector(".glow");

        if (!glow)
            return;

        glow.style.left =
            e.clientX - 150 + "px";

        glow.style.top =
            e.clientY - 150 + "px";
    }
);

// ==========================================
// PASTE THE SIDEBAR HAMBURGER CODE HERE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');

    // Click behavior to open and close sidebar menu
    if (hamburgerBtn && sidebar) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            sidebar.classList.toggle('active');
        });
    }

    // Close the sidebar menu if a link item inside it is clicked
    const menuLinks = document.querySelectorAll('.menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburgerBtn && sidebar) {
                hamburgerBtn.classList.remove('active');
                sidebar.classList.remove('active');
            }
        });
    });
});