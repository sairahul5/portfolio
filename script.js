/* =====================================================
   API
===================================================== */

const API_URL =
    "https://script.google.com/macros/s/AKfycbyBkyiYQpVbwI6O0lVDDJpSbo3ORTVYsJmWTfrHXzJd9FjS--iJaWKv3jUflHfFCXA/exec";


/* =====================================================
   DOM
===================================================== */

const $ = (id) =>
    document.getElementById(id);


const PROFILE_REFRESH_INTERVAL =
    30000;


/* =====================================================
   CLEAN VALUE
===================================================== */

function cleanValue(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    if (
        typeof value === "object"
    ) {
        return "";
    }

    return String(value).trim();
}


/* =====================================================
   GET FIELD
===================================================== */

function getField(object, fields) {

    if (
        !object ||
        typeof object !== "object"
    ) {
        return "";
    }


    for (const field of fields) {

        if (
            object[field] !== undefined &&
            object[field] !== null
        ) {

            const value =
                cleanValue(object[field]);

            if (value !== "") {
                return value;
            }

        }

    }


    /*
       Case-insensitive fallback
    */

    const keys =
        Object.keys(object);


    for (const field of fields) {

        const found =
            keys.find(
                key =>
                    key.toLowerCase() ===
                    field.toLowerCase()
            );


        if (found) {

            const value =
                cleanValue(
                    object[found]
                );

            if (value !== "") {
                return value;
            }

        }

    }


    return "";
}


/* =====================================================
   FETCH SHEET
===================================================== */

async function fetchSheet(sheetName) {

    const url =
        `${API_URL}?sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;


    console.log(
        `Loading ${sheetName}:`,
        url
    );


    const response =
        await fetch(
            url,
            {
                method: "GET",
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            `${sheetName} API failed: HTTP ${response.status}`
        );

    }


    const data =
        await response.json();


    console.log(
        `${sheetName} API response:`,
        data
    );


    if (
        data &&
        data.success === false
    ) {

        throw new Error(
            data.error ||
            `${sheetName} API returned an error`
        );

    }


    return data;
}


/* =====================================================
   IMAGE URL
===================================================== */

function getImageUrl(value) {

    let url =
        cleanValue(value);


    if (!url) {
        return "";
    }


    /*
       =IMAGE("https://...")
    */

    const imageFormula =
        url.match(
            /^=IMAGE\(\s*"([^"]+)"/i
        );


    if (
        imageFormula &&
        imageFormula[1]
    ) {

        url =
            imageFormula[1];

    }


    /*
       Google Drive file URL

       https://drive.google.com/file/d/FILE_ID/view
    */

    const driveFile =
        url.match(
            /drive\.google\.com\/file\/d\/([^/]+)/
        );


    if (driveFile) {

        const fileId =
            driveFile[1];


        return (
            "https://drive.google.com/thumbnail" +
            "?id=" +
            encodeURIComponent(fileId) +
            "&sz=w1200"
        );

    }


    /*
       Google Drive open URL

       https://drive.google.com/open?id=FILE_ID
    */

    const driveOpen =
        url.match(
            /[?&]id=([^&]+)/
        );


    if (
        url.includes("drive.google.com") &&
        driveOpen
    ) {

        return (
            "https://drive.google.com/thumbnail" +
            "?id=" +
            encodeURIComponent(
                driveOpen[1]
            ) +
            "&sz=w1200"
        );

    }


    /*
       Googleusercontent image
       Normal HTTPS image
    */

    return url;
}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   ATTRIBUTE ESCAPE
===================================================== */

function escapeAttribute(value) {

    return escapeHTML(value);
}


/* =====================================================
   SKILL ICONS
===================================================== */

const skillIconSlugs = {
    git: "git/git-original",
    github: "github/github-original",
    java: "java/java-original",
    python: "python/python-original",
    javascript: "javascript/javascript-original",
    js: "javascript/javascript-original",
    react: "react/react-original",
    html: "html5/html5-original",
    html5: "html5/html5-original",
    css: "css3/css3-original",
    css3: "css3/css3-original",
    "node.js": "nodejs/nodejs-original",
    node: "nodejs/nodejs-original",
    nodejs: "nodejs/nodejs-original",
    typescript: "typescript/typescript-original",
    ts: "typescript/typescript-original",
    angular: "angular/angular-original",
    vue: "vuejs/vuejs-original",
    mongodb: "mongodb/mongodb-original",
    mysql: "mysql/mysql-original",
    postgresql: "postgresql/postgresql-original",
    docker: "docker/docker-original",
    figma: "figma/figma-original",
    linux: "linux/linux-original",
    npm: "npm/npm-original-wordmark",
    express: "express/express-original",
    sass: "sass/sass-original"
};


function getSkillIconUrl(value) {

    const skillName =
        cleanValue(value)
            .toLowerCase();


    const slug =
        skillIconSlugs[skillName];


    if (!slug) {
        return "";
    }


    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}.svg`;
}


function renderSkillIcon(value, skillName) {

    const iconValue =
        cleanValue(value) ||
        cleanValue(skillName)
            .substring(0, 2)
            .toUpperCase();


    const imageUrl =
        getImageUrl(iconValue);


    const skillIconUrl =
        getSkillIconUrl(iconValue);


    const fallbackValue =
        getSkillIconUrl(skillName)
            ? cleanValue(skillName)
            : iconValue.startsWith("http")
                ? cleanValue(skillName)
                : iconValue;


    const resolvedUrl =
        /^https?:\/\//i.test(imageUrl)
            ? imageUrl
            : skillIconUrl;


    if (!resolvedUrl) {
        return escapeHTML(iconValue);
    }


    return `
        <img
            class="skill-icon-image"
            src="${escapeAttribute(resolvedUrl)}"
            alt="${escapeAttribute(skillName || iconValue)}"
            data-fallback="${escapeAttribute(fallbackValue)}"
        />
    `;
}


function activateSkillIconFallbacks(container) {

    container
        .querySelectorAll(".skill-icon-image")
        .forEach(image => {

            image.addEventListener(
                "error",
                () => {

                    const fallback =
                        image.dataset.fallback ||
                        "";


                    image.replaceWith(
                        document.createTextNode(fallback)
                    );

                },
                {
                    once: true
                }
            );

        });
}


/* =====================================================
   SET TEXT
===================================================== */

function setText(id, value) {

    const element =
        $(id);


    if (element) {

        element.textContent =
            value;

        /* Hide loading state if it exists */
        const loadingElement =
            $(`${id}-loading`);

        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        /* Show the actual content */
        element.style.display = 'block';

    }

}


/* =====================================================
   LOAD PROFILE
===================================================== */

function formatProfileLabel(key) {

    return String(key)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(
            /\b\w/g,
            character => character.toUpperCase()
        );
}


function renderProfileInfo(profile) {

    const container =
        $("profile-info");


    if (!container) {
        return;
    }


    const excludedKeys =
        new Set([
            "description",
            "bio"
        ]);


    const rows =
        Object.entries(profile)
            .filter(
                ([key, value]) =>
                    !excludedKeys.has(
                        key.toLowerCase()
                    ) &&
                    cleanValue(value) !== ""
            )
            .map(
                ([key, value]) => `
                    <div class="info-row">
                        <span class="info-label">
                            ${escapeHTML(
                                formatProfileLabel(key)
                            )}
                        </span>
                        <span class="info-value">
                            ${escapeHTML(
                                cleanValue(value)
                            )}
                        </span>
                    </div>
                `
            )
            .join("");


    container.innerHTML =
        rows ||
        `
            <div class="error-message">
                No profile details available.
            </div>
        `;
}

async function loadProfile() {

    try {

        const data =
            await fetchSheet(
                "Profile"
            );


        /*
           IMPORTANT

           Profile API returns:

           {
             Name: "...",
             Role: "...",
             Description: "...",
             Location: "...",
             Focus: "...",
             Status: "..."
           }

           It is NOT an array.
        */

        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data)
        ) {

            throw new Error(
                "Profile API returned invalid data."
            );

        }


        const profile =
            data;


        const name =
            getField(
                profile,
                [
                    "Name",
                    "name"
                ]
            );


        const role =
            getField(
                profile,
                [
                    "Role",
                    "role"
                ]
            );


        const description =
            getField(
                profile,
                [
                    "Description",
                    "description",
                    "Bio",
                    "bio"
                ]
            );


        const status =
            getField(
                profile,
                [
                    "Status",
                    "status"
                ]
            );


        /*
           DEFAULTS ONLY IF API IS EMPTY
        */

        const finalName =
            name || "LYNEX_";


        const finalRole =
            role || "";


        const finalDescription =
            description || "";


        /*
           NAV
        */

        setText(
            "nav-name",
            finalName
        );


        /*
           HERO
        */

        setText(
            "hero-name",
            finalName
        );


        setText(
            "hero-role",
            finalRole
        );


        setText(
            "hero-description",
            finalDescription
        );


        /*
           HERO STATUS
        */

        const heroStatus =
            $("hero-status");


        if (heroStatus) {

            heroStatus.hidden =
                !status;


            heroStatus.innerHTML =
                status
                    ? `
                        <span class="status-dot"></span>
                        ${escapeHTML(
                            status.toUpperCase()
                        )}
                    `
                    : "";

        }


        /*
           PROFILE
        */

        setText(
            "profile-description",
            finalDescription
        );


        renderProfileInfo(profile);


        /*
           FOOTER
        */

        setText(
            "footer-name",
            finalName
        );


        /*
           PAGE TITLE
        */

        document.title =
            "RAHUL_";


        console.log(
            "PROFILE LOADED:",
            profile
        );

    }

    catch (error) {

        console.error(
            "Profile error:",
            error
        );


        setText(
            "hero-name",
            "LYNEX_"
        );


        setText(
            "nav-name",
            "LYNEX_"
        );


    }

}


/* =====================================================
   LOAD SKILLS
===================================================== */

async function loadSkills() {

    const container =
        $("skills-container");


    if (!container) {
        return;
    }


    try {

        const data =
            await fetchSheet(
                "Skills"
            );


        if (
            !Array.isArray(data)
        ) {

            throw new Error(
                "Skills API did not return an array."
            );

        }


        if (
            data.length === 0
        ) {

            container.innerHTML =
                `
                <div class="error-message">
                    No skills available.
                </div>
                `;

            return;

        }


        container.innerHTML =
            data
                .map(
                    (skill, index) => {

                        const name =
                            getField(
                                skill,
                                [
                                    "Name",
                                    "Skill Name",
                                    "Skill",
                                    "Title",
                                    "name"
                                ]
                            );


                        const description =
                            getField(
                                skill,
                                [
                                    "Description",
                                    "description"
                                ]
                            );


                        const icon =
                            getField(
                                skill,
                                [
                                    "Icon",
                                    "icon"
                                ]
                            ) ||
                            name
                                .substring(
                                    0,
                                    2
                                )
                                .toUpperCase();


                        const tagsValue =
                            getField(
                                skill,
                                [
                                    "Tags",
                                    "tags",
                                    "Technologies",
                                    "Technology",
                                    "technologies"
                                ]
                            );


                        const tags =
                            tagsValue
                                ? tagsValue
                                    .split(",")
                                    .map(
                                        tag =>
                                            tag.trim()
                                    )
                                    .filter(
                                        Boolean
                                    )
                                : [];


                        return `
                        <article class="skill-card reveal">

                            <div class="skill-top">

                                <span class="skill-number">
                                    ${String(
                                        index + 1
                                    ).padStart(
                                        2,
                                        "0"
                                    )}
                                </span>

                                <div class="skill-icon">
                                    ${renderSkillIcon(
                                        icon,
                                        name
                                    )}
                                </div>

                            </div>


                            <h3>
                                ${escapeHTML(
                                    name ||
                                    "Skill"
                                )}
                            </h3>


                            <p>
                                ${escapeHTML(
                                    description
                                )}
                            </p>


                            ${
                                tags.length
                                    ? `
                                    <div class="tags">

                                        ${tags
                                            .map(
                                                tag =>
                                                    `
                                                    <span class="tag">
                                                        ${escapeHTML(
                                                            tag
                                                        )}
                                                    </span>
                                                    `
                                            )
                                            .join("")}

                                    </div>
                                    `
                                    : ""
                            }

                        </article>
                        `;

                    }
                )
                .join("");


        activateSkillIconFallbacks(container);


        activateRevealAnimations();


        console.log(
            "SKILLS LOADED:",
            data
        );

    }

    catch (error) {

        console.error(
            "Skills error:",
            error
        );


        container.innerHTML =
            `
            <div class="error-message">
                Unable to load skills.
            </div>
            `;

    }

}


/* =====================================================
   LOAD PROJECTS
===================================================== */

async function loadProjects() {

    const container =
        $("projects-container");


    if (!container) {
        return;
    }


    try {

        const data =
            await fetchSheet(
                "Projects"
            );


        if (
            !Array.isArray(data)
        ) {

            throw new Error(
                "Projects API did not return an array."
            );

        }


        if (
            data.length === 0
        ) {

            container.innerHTML =
                `
                <div class="error-message">
                    No projects available.
                </div>
                `;

            return;

        }


        container.innerHTML =
            data
                .map(
                    (project, index) => {

                        const name =
                            getField(
                                project,
                                [
                                    "Project Name",
                                    "Project",
                                    "Name",
                                    "Title",
                                    "project_name",
                                    "name"
                                ]
                            ) ||
                            "Untitled Project";


                        const description =
                            getField(
                                project,
                                [
                                    "Description",
                                    "description"
                                ]
                            );


                        const technologies =
                            getField(
                                project,
                                [
                                    "Technologies",
                                    "Technology",
                                    "technologies",
                                    "Tech",
                                    "tech"
                                ]
                            );


                        const link =
                            getField(
                                project,
                                [
                                    "Link",
                                    "URL",
                                    "Url",
                                    "url"
                                ]
                            );


                        const imageValue =
                            getField(
                                project,
                                [
                                    "Image",
                                    "image",
                                    "Image URL",
                                    "Image Url",
                                    "Project Image",
                                    "image_url",
                                    "Preview"
                                ]
                            );


                        const imageUrl =
                            getImageUrl(
                                imageValue
                            );


                        console.log(
                            "PROJECT:",
                            {
                                name,
                                imageValue,
                                imageUrl
                            }
                        );


                        const imageHTML =
                            imageUrl
                                ? `
                                <img
                                    src="${escapeAttribute(
                                        imageUrl
                                    )}"
                                    alt="${escapeAttribute(
                                        name
                                    )}"
                                    loading="lazy"
                                    onerror="
                                        this.style.display='none';
                                        this.nextElementSibling.style.display='flex';
                                    "
                                >

                                <div
                                    class="image-placeholder"
                                    style="display:none;"
                                >
                                    Image unavailable
                                </div>
                                `
                                : `
                                <div class="image-placeholder">
                                    Image unavailable
                                </div>
                                `;


                        const linkHTML =
                            link
                                ? `
                                <a
                                    href="${escapeAttribute(
                                        link
                                    )}"
                                    class="project-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span>View</span>
                                    <span>↗</span>
                                </a>
                                `
                                : "";


                        return `
                        <article class="project reveal">

                            <div class="project-number">
                                ${String(
                                    index + 1
                                ).padStart(
                                    2,
                                    "0"
                                )}
                            </div>


                            <div class="project-image">

                                ${imageHTML}

                            </div>


                            <div class="project-content">

                                <h3>
                                    ${escapeHTML(
                                        name
                                    )}
                                </h3>


                                <p class="project-description">
                                    ${escapeHTML(
                                        description
                                    )}
                                </p>


                                ${
                                    technologies
                                        ? `
                                        <div class="project-tech">
                                            ${escapeHTML(
                                                technologies
                                            )}
                                        </div>
                                        `
                                        : ""
                                }

                            </div>


                            ${linkHTML}

                        </article>
                        `;

                    }
                )
                .join("");


        activateRevealAnimations();


        console.log(
            "PROJECTS LOADED:",
            data
        );

    }

    catch (error) {

        console.error(
            "Projects error:",
            error
        );


        container.innerHTML =
            `
            <div class="error-message">
                Unable to load projects.
            </div>
            `;

    }

}


/* =====================================================
   CONTACT FORM
===================================================== */

function setupContactForm() {

    const form =
        $("contact-form");


    const button =
        $("submit-button");


    const status =
        $("form-status");


    if (
        !form ||
        !button ||
        !status
    ) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                $("contact-name")
                    .value
                    .trim();


            const email =
                $("contact-email")
                    .value
                    .trim();


            const message =
                $("contact-message")
                    .value
                    .trim();


            if (
                !name ||
                !email ||
                !message
            ) {

                status.textContent =
                    "Please fill in all fields.";

                status.className =
                    "form-status form-error";

                return;

            }


            button.disabled =
                true;


            button.innerHTML =
                `
                <span>Sending...</span>
                <span>→</span>
                `;


            status.textContent =
                "";


            try {

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "text/plain;charset=utf-8"
                            },

                            body:
                                JSON.stringify({
                                    name,
                                    email,
                                    message
                                })
                        }
                    );


                const result =
                    await response.json();


                if (
                    result &&
                    result.success === false
                ) {

                    throw new Error(
                        result.error ||
                        "Message could not be sent."
                    );

                }


                status.textContent =
                    "Message sent successfully.";

                status.className =
                    "form-status form-success";


                form.reset();

            }

            catch (error) {

                console.error(
                    "Contact error:",
                    error
                );


                status.textContent =
                    "Unable to send message. Please try again.";

                status.className =
                    "form-status form-error";

            }


            button.disabled =
                false;


            button.innerHTML =
                `
                <span>Send Message</span>
                <span>↗</span>
                `;

        }
    );

}


/* =====================================================
   NAVBAR
===================================================== */

function setupNavbar() {

    const navbar =
        $("navbar");


    if (!navbar) {
        return;
    }


    function updateNavbar() {

        if (
            window.scrollY > 10
        ) {

            navbar.classList.add(
                "scrolled"
            );

        }
        else {

            navbar.classList.remove(
                "scrolled"
            );

        }

    }


    window.addEventListener(
        "scroll",
        updateNavbar,
        {
            passive: true
        }
    );


    updateNavbar();

}


/* =====================================================
   THEME
===================================================== */

function setupTheme() {

    const toggle =
        $("theme-toggle");

    if (!toggle) {
        return;
    }

    const root =
        document.documentElement;

    const input =
        toggle.querySelector(".input");

    const modeLabel =
        $("theme-mode");

    const savedTheme =
        localStorage.getItem("portfolio-theme");

    const initialTheme =
        savedTheme ||
        "light";

    function applyTheme(theme) {

        root.dataset.theme =
            theme;

        const isDark =
            theme === "dark";

        input.checked =
            isDark;

        toggle.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );

        toggle.setAttribute(
            "title",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );

        input.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );

        if (modeLabel) {
            modeLabel.textContent =
                isDark ? "Dark" : "Light";
        }

    }

    applyTheme(initialTheme);

    input.addEventListener(
        "change",
        () => {
            const nextTheme =
                input.checked ? "dark" : "light";

            localStorage.setItem(
                "portfolio-theme",
                nextTheme
            );

            applyTheme(nextTheme);
        }
    );

}


/* =====================================================
   SMOOTH ANCHORS
===================================================== */

function setupSmoothAnchors() {

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const targetId =
                        link.getAttribute("href");


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    const navbar =
                        $("navbar");


                    const offset =
                        navbar
                            ? navbar.offsetHeight + 16
                            : 16;


                    const targetPosition =
                        target.getBoundingClientRect().top +
                        window.scrollY -
                        offset;


                    window.scrollTo({
                        top: Math.max(
                            0,
                            targetPosition
                        ),
                        behavior: "smooth"
                    });


                    history.replaceState(
                        null,
                        "",
                        targetId
                    );

                }
            );

        });
}


/* =====================================================
   REVEAL ANIMATION
===================================================== */

function activateRevealAnimations() {

    const elements =
        document.querySelectorAll(
            ".reveal"
        );


    if (
        !("IntersectionObserver" in window)
    ) {

        elements.forEach(
            element =>
                element.classList.add(
                    "visible"
                )
        );

        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.08
            }
        );


    elements.forEach(
        (element, index) => {

            element.style.transitionDelay =
                `${Math.min(index * 60, 360)}ms`;

            observer.observe(
                element
            );

        }
    );

}


/* =====================================================
   FOOTER
===================================================== */

function setupFooter() {

    setText(
        "footer-year",
        new Date().getFullYear()
    );

}


/* =====================================================
   LOAD EVERYTHING
===================================================== */

async function loadPortfolio() {

    /*
       Load independently.

       If one sheet fails,
       the others still load.
    */

    await Promise.allSettled([
        loadProfile(),
        loadSkills(),
        loadProjects()
    ]);

}


/* =====================================================
   LIVE PROFILE UPDATES
===================================================== */

function setupLiveProfileUpdates() {

    window.setInterval(
        () => {

            if (!document.hidden) {
                loadProfile();
            }

        },
        PROFILE_REFRESH_INTERVAL
    );
}


/* =====================================================
   START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupNavbar();

        setupTheme();

        setupSmoothAnchors();

        setupContactForm();

        setupFooter();

        loadPortfolio();

        setupLiveProfileUpdates();

    }
);