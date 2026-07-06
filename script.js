const siteConfig = {
    name: "Lya",
    // Aqui é pra colar a data seu otário, to anotando essas porra pra eu n esquecer Exemplo: "2026-01-01T00:00:00"
    startDate: "",
    backgroundAudio: "assets/audio/cant-help-falling-in-love.mp3",
    spotifyUrl: "https://open.spotify.com/track/44AyOl4qVkzS48vBsbNXaC?si=5Gf5GDYFRhO5nFoidR58Bw"
};

const musicPlaylist = [
    {
        title: "Can't Help Falling in Love",
        artist: "Elvis Presley",
        url: "https://open.spotify.com/track/44AyOl4qVkzS48vBsbNXaC?si=5Gf5GDYFRhO5nFoidR58Bw",
        embed: "https://open.spotify.com/embed/track/44AyOl4qVkzS48vBsbNXaC?utm_source=generator",
        audio: siteConfig.backgroundAudio,
        fragment: "Pegue minha mão, pegue minha vida também",
        badge: "trilha principal"
    },
    {
        title: "Iris",
        artist: "The Goo Goo Dolls",
        url: "https://open.spotify.com/track/6Qyc6fS4DsZjB2mRW9DsQs?si=mU_psYyYTKyGA8--_BnEOw",
        embed: "https://open.spotify.com/embed/track/6Qyc6fS4DsZjB2mRW9DsQs?utm_source=generator",
        audio: "assets/audio/iris.mp3",
        fragment: "Eu só quero que você saiba quem eu sou",
        badge: "intensa"
    },
    {
        title: "Perfect",
        artist: "Ed Sheeran",
        url: "https://open.spotify.com/track/0tgVpDi06FyKpA1z0VMD4v?si=9O09hZerQqmzBt91V2Bpjw",
        embed: "https://open.spotify.com/embed/track/0tgVpDi06FyKpA1z0VMD4v?utm_source=generator",
        audio: "assets/audio/perfect.mp3",
        fragment: "Eu encontrei um amor para mim",
        badge: "fofa"
    }
];

const timelineEvents = [
    // { date: "00.00.0000", title: "Titulo", description: "Texto do momento" },
];

const letterParagraphs = [
    // "conteudo da bomba da carta aqui seu otário",
];

const app = document.getElementById("app");
const intro = document.getElementById("intro");
const ambientLayer = document.getElementById("ambientLayer");
const enterButton = document.getElementById("enterButton");
const stage = document.querySelector(".stage");
const navItems = document.querySelectorAll(".nav-item");
const panels = document.querySelectorAll("[data-view-panel]");
const clock = document.getElementById("clock");
const musicDisplay = document.getElementById("musicDisplay");
const musicTitle = document.getElementById("musicTitle");
const musicArtist = document.getElementById("musicArtist");
const spotifyLink = document.getElementById("spotifyLink");
const spotifyFrame = document.getElementById("spotifyFrame");
const backgroundAudio = document.getElementById("backgroundAudio");
const sitePlayer = document.querySelector(".site-player");
const musicPlayButton = document.getElementById("musicPlayButton");
const musicStatus = document.getElementById("musicStatus");
const trackStrip = document.getElementById("trackStrip");
const timeline = document.getElementById("timeline");
const letterModal = document.getElementById("letterModal");
const letterBody = document.getElementById("letterBody");
const openLetterButton = document.getElementById("openLetter");

let musicIndex = 0;
let musicTimer;
let currentAudioSource = "";
let audioCheckId = 0;
let shouldKeepAudioPlaying = false;
const audioAvailability = new Map();
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
let bloomIndex = 0;

function checkAudioSource(source) {
    if (audioAvailability.has(source)) return audioAvailability.get(source);

    const check = fetch(source, { method: "HEAD", cache: "no-store" })
        .then((response) => response.ok)
        .catch(() => false);

    audioAvailability.set(source, check);
    return check;
}

function updatePlayButton() {
    if (!musicPlayButton || !backgroundAudio) return;

    const isPlaying = !backgroundAudio.paused && !backgroundAudio.ended;
    const icon = musicPlayButton.querySelector("i");
    const label = musicPlayButton.querySelector("span");

    musicPlayButton.setAttribute("aria-pressed", String(isPlaying));
    if (icon) icon.className = `ph ${isPlaying ? "ph-pause" : "ph-play"}`;
    if (label) label.textContent = isPlaying ? "Pausar" : "Tocar";
    if (musicStatus) musicStatus.textContent = isPlaying ? "tocando no fundo" : "trilha de fundo";
}

function setAudioTrack(track) {
    if (!backgroundAudio || !musicPlayButton) return;
    audioCheckId += 1;
    const checkId = audioCheckId;
    sitePlayer?.classList.add("is-hidden");

    if (!track?.audio) {
        backgroundAudio.pause();
        backgroundAudio.removeAttribute("src");
        currentAudioSource = "";
        musicPlayButton.disabled = true;
        updatePlayButton();
        if (musicStatus) musicStatus.textContent = "player Spotify abaixo";
        return;
    }

    const nextSource = new URL(track.audio, window.location.href).href;
    if (currentAudioSource === nextSource && !musicPlayButton.disabled) {
        musicPlayButton.disabled = false;
        updatePlayButton();
        return;
    }

    backgroundAudio.pause();
    backgroundAudio.removeAttribute("src");
    currentAudioSource = "";
    musicPlayButton.disabled = true;
    if (musicStatus) musicStatus.textContent = "checando trilha";

    checkAudioSource(nextSource).then((isAvailable) => {
        if (checkId !== audioCheckId) return;

        if (!isAvailable) {
            musicPlayButton.disabled = true;
            if (musicStatus) musicStatus.textContent = "player Spotify abaixo";
            return;
        }

        currentAudioSource = nextSource;
        musicPlayButton.disabled = false;
        sitePlayer?.classList.remove("is-hidden");
        updatePlayButton();

        if (shouldKeepAudioPlaying) {
            playBackgroundAudio();
        }
    });
}

async function playBackgroundAudio() {
    if (!backgroundAudio || !currentAudioSource) {
        if (musicStatus) musicStatus.textContent = "player Spotify abaixo";
        return;
    }

    let playFailed = false;

    try {
        if (backgroundAudio.src !== currentAudioSource) {
            backgroundAudio.src = currentAudioSource;
            backgroundAudio.load();
        }
        await backgroundAudio.play();
        shouldKeepAudioPlaying = true;
    } catch {
        playFailed = true;
        shouldKeepAudioPlaying = false;
    }

    updatePlayButton();
    if (playFailed && musicStatus) {
        musicStatus.textContent = "adicione o MP3 local";
    }
}

function pauseBackgroundAudio() {
    if (!backgroundAudio) return;
    backgroundAudio.pause();
    shouldKeepAudioPlaying = false;
    updatePlayButton();
}

function toggleBackgroundAudio() {
    if (!backgroundAudio || backgroundAudio.paused) {
        playBackgroundAudio();
        return;
    }

    pauseBackgroundAudio();
}

function unlockSite() {
    intro.classList.add("is-hidden");
    app.classList.remove("is-locked");
    setAudioTrack(musicPlaylist[0]);
    shouldKeepAudioPlaying = true;
    playBackgroundAudio();
}

function setActiveView(viewName) {
    app.dataset.view = viewName;

    navItems.forEach((item) => {
        const isActive = item.dataset.view === viewName;
        item.classList.toggle("active", isActive);
        item.toggleAttribute("aria-current", isActive);
    });

    panels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === viewName);
    });

    stage?.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });

    if (viewName === "playlist") {
        startMusicLoop();
    } else if (musicTimer) {
        clearInterval(musicTimer);
    }
}

function renderMusic() {
    if (!musicDisplay) return;

    if (!musicPlaylist.length) {
        musicDisplay.textContent = "";
        musicDisplay.classList.add("is-empty");
        return;
    }

    const current = musicPlaylist[musicIndex % musicPlaylist.length];
    if (musicTitle) musicTitle.textContent = current.title;
    if (musicArtist) musicArtist.textContent = current.artist;
    if (spotifyLink) {
        spotifyLink.href = current.url;
        spotifyLink.setAttribute("aria-label", `Ouvir ${current.title} no Spotify`);
    }
    if (spotifyFrame) {
        spotifyFrame.src = current.embed;
        spotifyFrame.title = `Player do Spotify - ${current.title}`;
    }

    setAudioTrack(current);

    musicDisplay.classList.remove("is-empty");
    musicDisplay.innerHTML = "";

    const fragment = document.createElement("span");
    fragment.className = "lyric-fragment";
    fragment.textContent = current.fragment;

    musicDisplay.append(fragment);
    updateTrackButtons();

    if (shouldKeepAudioPlaying) {
        playBackgroundAudio();
    }
}

function startMusicLoop() {
    if (musicTimer) clearInterval(musicTimer);
    renderMusic();
}

function renderTrackStrip() {
    if (!trackStrip) return;
    trackStrip.innerHTML = "";

    musicPlaylist.forEach((track, index) => {
        const button = document.createElement("button");
        button.className = "track-card";
        button.type = "button";
        button.dataset.index = String(index);
        button.innerHTML = `
            <span class="track-badge">${track.badge}</span>
            <strong>${track.title}</strong>
            <small>${track.artist}</small>
        `;
        button.addEventListener("click", () => {
            musicIndex = index;
            renderMusic();
        });
        trackStrip.appendChild(button);
    });

    updateTrackButtons();
}

function updateTrackButtons() {
    if (!trackStrip) return;
    trackStrip.querySelectorAll(".track-card").forEach((button) => {
        button.classList.toggle("active", Number(button.dataset.index) === musicIndex);
    });
}

function renderTimeline() {
    if (!timeline) return;
    timeline.innerHTML = "";

    if (!timelineEvents.length) {
        for (let i = 0; i < 3; i += 1) {
            const placeholder = document.createElement("div");
            placeholder.className = "timeline-placeholder";
            placeholder.setAttribute("aria-hidden", "true");
            placeholder.innerHTML = "<span></span><span></span><span></span>";
            timeline.appendChild(placeholder);
        }
        return;
    }

    timelineEvents.forEach((event) => {
        const article = document.createElement("article");
        article.className = "timeline-event";
        article.innerHTML = `
            <time>${event.date}</time>
            <h3>${event.title}</h3>
            <p>${event.description}</p>
        `;
        timeline.appendChild(article);
    });
}

function renderLetter() {
    if (!letterBody) return;
    letterBody.innerHTML = "";

    if (!letterParagraphs.length) {
        letterBody.classList.add("is-empty");
        letterBody.innerHTML = "<span></span><span></span><span></span>";
        return;
    }

    letterBody.classList.remove("is-empty");
    letterParagraphs.forEach((paragraph) => {
        const p = document.createElement("p");
        p.textContent = paragraph;
        letterBody.appendChild(p);
    });
}

function openLetter() {
    renderLetter();
    letterModal.classList.add("is-open");
    letterModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeLetter() {
    letterModal.classList.remove("is-open");
    letterModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

function initAmbientLayer() {
    if (!ambientLayer || reducedMotion) return;

    const marks = [
        { symbol: "♪", x: "18%", y: "16%", size: "1.7rem", alpha: 0.32, rotate: "-8deg", duration: "7s", delay: "0ms" },
        { symbol: "♡", x: "78%", y: "18%", size: "1.45rem", alpha: 0.26, rotate: "12deg", duration: "8s", delay: "420ms" },
        { symbol: "✦", x: "63%", y: "32%", size: "1.15rem", alpha: 0.28, rotate: "3deg", duration: "6.5s", delay: "900ms" },
        { symbol: "♪", x: "86%", y: "47%", size: "1.85rem", alpha: 0.22, rotate: "-18deg", duration: "8.5s", delay: "1200ms" },
        { symbol: "✧", x: "11%", y: "68%", size: "1.25rem", alpha: 0.24, rotate: "16deg", duration: "7.5s", delay: "650ms" },
        { symbol: "♡", x: "52%", y: "82%", size: "1.35rem", alpha: 0.2, rotate: "-6deg", duration: "9s", delay: "1500ms" }
    ];

    ambientLayer.innerHTML = "";
    marks.forEach((mark) => {
        const span = document.createElement("span");
        span.className = "ambient-mark";
        span.textContent = mark.symbol;
        span.style.setProperty("--x", mark.x);
        span.style.setProperty("--y", mark.y);
        span.style.setProperty("--size", mark.size);
        span.style.setProperty("--alpha", String(mark.alpha));
        span.style.setProperty("--rotate", mark.rotate);
        span.style.setProperty("--duration", mark.duration);
        span.style.setProperty("--delay", mark.delay);
        ambientLayer.appendChild(span);
    });
}

function spawnBloom(x, y) {
    if (reducedMotion) return;

    const symbols = ["♡", "✦", "♪", "✧"];
    const bloom = document.createElement("span");
    bloom.className = "touch-bloom";
    bloom.textContent = symbols[bloomIndex % symbols.length];
    bloomIndex += 1;
    bloom.style.setProperty("--bloom-x", `${x}px`);
    bloom.style.setProperty("--bloom-y", `${y}px`);
    bloom.style.setProperty("--drift-x", `${bloomIndex % 2 === 0 ? 14 : -14}px`);
    document.body.appendChild(bloom);
    window.setTimeout(() => bloom.remove(), 900);
}

function initTactileInteractions() {
    const reactiveItems = document.querySelectorAll(`
        .hero,
        .music-scene,
        .interest-item,
        .track-card,
        .polaroid,
        .letter-card
    `);

    document.addEventListener("pointerdown", (event) => {
        const target = event.target.closest("button, a, .interest-item, .polaroid, .hero");
        if (!target) return;
        spawnBloom(event.clientX, event.clientY);
    });

    document.querySelectorAll(".interest-item").forEach((item) => {
        item.addEventListener("click", () => {
            item.classList.add("is-loved");
            window.setTimeout(() => item.classList.remove("is-loved"), 720);
        });
    });

    document.querySelectorAll(".polaroid").forEach((item) => {
        item.addEventListener("click", () => {
            item.classList.add("is-peeked");
            window.setTimeout(() => item.classList.remove("is-peeked"), 900);
        });
    });

    if (!canHover || reducedMotion) return;

    reactiveItems.forEach((item) => {
        item.addEventListener("pointermove", (event) => {
            const rect = item.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;
            const tiltX = (x - 0.5) * 5.5;
            const tiltY = (0.5 - y) * 4.5;

            item.classList.add("is-tilting");
            item.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
            item.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
            item.style.setProperty("--shine-x", `${(x * 100).toFixed(1)}%`);
            item.style.setProperty("--shine-y", `${(y * 100).toFixed(1)}%`);
        });

        item.addEventListener("pointerleave", () => {
            item.classList.remove("is-tilting");
            item.style.setProperty("--tilt-x", "0deg");
            item.style.setProperty("--tilt-y", "0deg");
            item.style.removeProperty("--shine-x");
            item.style.removeProperty("--shine-y");
        });
    });
}

function updateClock() {
    if (!clock) return;

    if (!siteConfig.startDate) {
        clock.textContent = "00d 00h 00m";
        return;
    }

    const start = new Date(siteConfig.startDate);
    const now = new Date();

    if (Number.isNaN(start.getTime()) || start > now) {
        clock.textContent = "00d 00h 00m";
        return;
    }

    const diff = now - start;
    const days = Math.floor(diff / 86400000);
    const hours = String(Math.floor((diff / 3600000) % 24)).padStart(2, "0");
    const minutes = String(Math.floor((diff / 60000) % 60)).padStart(2, "0");

    clock.textContent = `${days}d ${hours}h ${minutes}m`;
}

function initRevealAnimations() {
    const elements = document.querySelectorAll(`
        .hero,
        .section-head,
        .interest-item,
        .music-scene,
        .track-card,
        .polaroid,
        .timeline-event,
        .timeline-placeholder,
        .letter-card
    `);

    elements.forEach((element, index) => {
        element.classList.add("reveal-on-view");
        element.style.setProperty("--reveal-delay", `${Math.min((index % 6) * 45, 180)}ms`);
    });

    if (reducedMotion || !("IntersectionObserver" in window)) {
        elements.forEach((element) => element.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, {
        root: stage,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12
    });

    elements.forEach((element) => observer.observe(element));
}

enterButton.addEventListener("click", unlockSite);

musicPlayButton?.addEventListener("click", toggleBackgroundAudio);
backgroundAudio?.addEventListener("play", updatePlayButton);
backgroundAudio?.addEventListener("pause", updatePlayButton);
backgroundAudio?.addEventListener("error", () => {
    pauseBackgroundAudio();
    if (musicStatus) musicStatus.textContent = "adicione o MP3 local";
});

navItems.forEach((item) => {
    item.addEventListener("click", () => setActiveView(item.dataset.view));
});

openLetterButton.addEventListener("click", openLetter);

document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeLetter);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLetter();
});

renderTrackStrip();
renderMusic();
renderTimeline();
renderLetter();
initAmbientLayer();
initRevealAnimations();
initTactileInteractions();
updateClock();
setInterval(updateClock, 60000);
