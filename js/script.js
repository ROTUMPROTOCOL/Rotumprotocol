// ROTUM PROTOCOL — SITE SCRIPT

// ---------- SUPABASE CONFIG ----------
// Get these from: Supabase Dashboard → Settings → API
// The anon key is PUBLIC by design — safe to ship in this file.
// NEVER put the service_role key here.
const SUPABASE_URL = "https://aavynuxipocthqwpnzrd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhdnludXhpcG9jdGhxd3BuenJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0OTU4MTAsImV4cCI6MjA5ODA3MTgxMH0.h5mBjbytNymb4FgyHBp0zQ7pPC6r9Z_IRBSvECxO7xs";

let supabaseClient = null;
if (
    window.supabase &&
    SUPABASE_URL !== "YOUR_SUPABASE_PROJECT_URL" &&
    SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY"
) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ---------- NUMBER ANIMATION ----------
function animateNumber(element, target, suffix = "") {
    let current = 0;
    const increment = target / 60 || 1;

    const interval = setInterval(() => {
        current += increment;

        if (current >= target) {
            current = target;
            clearInterval(interval);
        }

        element.innerText = Math.round(current).toLocaleString() + suffix;
    }, 20);
}

// Format a raw hash-power number (TH/s) into whatever unit reads cleanest
function formatHashPower(th) {
    if (th >= 1000) return { value: th / 1000, suffix: " PH/s" };
    return { value: th, suffix: " TH/s" };
}

// ---------- HOMEPAGE: LIVE NETWORK STATS ----------
async function loadNetworkStats() {
    const networkEl = document.getElementById("network");
    const operatorsEl = document.getElementById("operators");
    const seasonEl = document.getElementById("season");
    if (!networkEl && !operatorsEl && !seasonEl) return;

    if (!supabaseClient) {
        // Demo fallback so the page still looks alive before keys are added
        if (networkEl) animateNumber(networkEl, 142.8, " PH/s");
        if (operatorsEl) animateNumber(operatorsEl, 12847);
        if (seasonEl) animateNumber(seasonEl, 850000, " RTM");
        return;
    }

    const { data, error } = await supabaseClient
        .from("v_network_stats")
        .select("pool_current, operators, network_hash")
        .single();

    if (error || !data) {
        console.error("Failed to load network stats:", error);
        return;
    }

    if (networkEl) {
        const { value, suffix } = formatHashPower(Number(data.network_hash) || 0);
        animateNumber(networkEl, value, suffix);
    }
    if (operatorsEl) animateNumber(operatorsEl, Number(data.operators) || 0);
    if (seasonEl) animateNumber(seasonEl, Number(data.pool_current) || 0, " RTM");
}

// ---------- HOMEPAGE: LIVE NETWORK FEED ----------
function renderFeedItem(container, message) {
    const item = document.createElement("div");
    item.className = "feed-item";
    item.innerHTML = "⚡ " + message;
    container.prepend(item);

    while (container.children.length > 6) {
        container.removeChild(container.lastChild);
    }
}

async function loadNetworkFeed() {
    const container = document.getElementById("network-feed");
    if (!container) return;

    if (!supabaseClient) {
        const demo = [
            "Operator #918 reached 1 PH/s contribution",
            "Season reward pool increased",
            "New contributor joined network",
            "Season multiplier activated"
        ];
        demo.forEach(msg => renderFeedItem(container, msg));
        return;
    }

    const { data, error } = await supabaseClient
        .from("network_feed")
        .select("message, created_at")
        .order("created_at", { ascending: false })
        .limit(6);

    if (error || !data) {
        console.error("Failed to load network feed:", error);
        return;
    }

    container.innerHTML = "";
    data.forEach(row => renderFeedItem(container, row.message));

    // Poll for new feed entries every 15s
    setInterval(async () => {
        const { data: latest } = await supabaseClient
            .from("network_feed")
            .select("message, created_at")
            .order("created_at", { ascending: false })
            .limit(1);

        if (latest && latest[0]) {
            renderFeedItem(container, latest[0].message);
        }
    }, 15000);
}

// Matches the tiers described on contribution.html
function getTier(th) {
    if (th >= 1000) return "Quantum";
    if (th >= 100) return "Platinum";
    if (th >= 10) return "Gold";
    return "Silver";
}

// ---------- LEADERBOARD PAGE ----------
async function loadLeaderboard() {
    const tbody = document.getElementById("leaderboard-body");
    if (!tbody || !supabaseClient) return;

    const { data, error } = await supabaseClient
        .from("v_leaderboard")
        .select("rank, entity, hash_power, network_share, est_reward")
        .order("rank", { ascending: true })
        .limit(20);

    if (error || !data) {
        console.error("Failed to load leaderboard:", error);
        return;
    }

    tbody.innerHTML = "";
    data.forEach(row => {
        const tr = document.createElement("tr");
        if (row.rank <= 3) tr.classList.add("rank-" + row.rank);

        const { value, suffix } = formatHashPower(Number(row.hash_power) || 0);
        const tier = getTier(Number(row.hash_power) || 0);

        tr.innerHTML = `
            <td>#${row.rank}</td>
            <td>${row.entity}</td>
            <td class="mono">${value.toFixed(2)}${suffix}</td>
            <td><span class="tier-pill">${tier}</span></td>
            <td class="mono">${Number(row.network_share).toFixed(2)}%</td>
        `;
        tbody.appendChild(tr);
    });
}

window.addEventListener("load", () => {
    loadNetworkStats();
    loadNetworkFeed();
    loadLeaderboard();
});

// ---------- HERO GLOW FOLLOWS CURSOR ----------
document.addEventListener("mousemove", e => {
    const glow = document.querySelector(".glow");
    if (!glow) return;

    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
});

// ---------- NAV: HAMBURGER + ACTIVE LINK ----------
document.addEventListener("DOMContentLoaded", () => {
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const menu = document.getElementById("menu");

    if (hamburgerBtn && menu) {
        hamburgerBtn.addEventListener("click", () => {
            const isOpen = menu.classList.toggle("active");
            hamburgerBtn.classList.toggle("active", isOpen);
            hamburgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });

        menu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                menu.classList.remove("active");
                hamburgerBtn.classList.remove("active");
                hamburgerBtn.setAttribute("aria-expanded", "false");
            });
        });
    }

    // Highlight the current page in the nav
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".menu a").forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPage) {
            link.classList.add("active");
        }
    });
});