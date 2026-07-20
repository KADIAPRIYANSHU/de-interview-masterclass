// Data Engineering Prep SPA Router & LMS Engine
let activeTech = "snowflake";
let currentLessonId = "1.1";

// State Managers (Stored in LocalStorage)
let bookmarks = JSON.parse(localStorage.getItem("de_bookmarks") || "[]");
let completed = JSON.parse(localStorage.getItem("de_completed") || "[]");
let recentlyViewed = JSON.parse(localStorage.getItem("de_recently_viewed") || "[]");

// DOM Elements
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menu-toggle");
const techTabs = document.querySelectorAll(".tech-tab");
const sidebarMainTitle = document.getElementById("sidebar-main-title");
const logoTitleMobile = document.getElementById("logo-title-mobile");

// Search & Filter DOM Elements
const searchInput = document.getElementById("search-input");
const bookmarksOnlyToggle = document.getElementById("bookmarks-only-toggle");
const progressPercent = document.getElementById("progress-percent");
const progressFill = document.getElementById("progress-fill");
const recentlyViewedList = document.getElementById("recently-viewed-list");

// Meta Indicators
const breadcrumbStage = document.getElementById("breadcrumb-stage");
const breadcrumbLesson = document.getElementById("breadcrumb-lesson");
const lessonDuration = document.getElementById("lesson-duration");
const lessonDifficulty = document.getElementById("lesson-difficulty");

// Content Areas & Actions
const lessonTitle = document.getElementById("lesson-title");
const lessonSubtitle = document.getElementById("lesson-subtitle");
const theoryText = document.getElementById("theory-text");
const interviewQnaList = document.getElementById("interview-qna-list");

// LMS Action Controls
const bookmarkToggleBtn = document.getElementById("bookmark-toggle-btn");
const bookmarkStarIcon = document.getElementById("bookmark-star-icon");
const completeToggleBtn = document.getElementById("complete-toggle-btn");
const completeCheckIcon = document.getElementById("complete-check-icon");
const downloadCodeBtn = document.getElementById("download-code-btn");
const notesTextarea = document.getElementById("notes-textarea");

// Theme Configurations
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const themeIcon = document.getElementById("theme-icon");
const themeText = document.getElementById("theme-text");

// Initialize application
function init() {
    setupEventListeners();
    initTheme();
    updateProgress();
    renderRecentlyViewed();
    
    // Default load Snowflake
    switchTechnology("snowflake");
}

// Initialize theme state from local storage
function initTheme() {
    if (localStorage.getItem("snowflake_light_theme") === "true") {
        document.body.classList.add("light-theme");
        themeIcon.textContent = "☀️";
        themeText.textContent = "Light Mode";
    }
}

// Get the active lesson source object globally
function getActiveSource() {
    if (activeTech === "snowflake") return window.snowflakeLessons || {};
    if (activeTech === "adf") return window.adfLessons || {};
    if (activeTech === "dbt") return window.dbtLessons || {};
    if (activeTech === "sql") return window.sqlLessons || {};
    if (activeTech === "python") return window.pythonLessons || {};
    if (activeTech === "fundamentals") return window.fundamentalsLessons || {};
    if (activeTech === "devops_obs") return window.devopsObsLessons || {};
    if (activeTech === "aide") return window.aiDeLessons || {};
    if (activeTech === "scenarios") return window.scenariosLessons || {};
    return {};
}

// Calculate and update syllabus completion progress bar
function updateProgress() {
    // Count total modules across all 8 datasets
    let totalModules = 0;
    const sources = [
        window.snowflakeLessons, window.adfLessons, window.dbtLessons,
        window.sqlLessons, window.pythonLessons, window.fundamentalsLessons,
        window.devopsObsLessons, window.aiDeLessons, window.scenariosLessons
    ];
    sources.forEach(src => {
        if (src) totalModules += Object.keys(src).length;
    });

    if (totalModules === 0) return;

    const completedCount = completed.length;
    const percentage = Math.round((completedCount / totalModules) * 100);

    progressPercent.textContent = `${percentage}%`;
    progressFill.style.width = `${percentage}%`;
}

// Bind all page events
function setupEventListeners() {
    // 1-Click Tech Switcher tabs
    techTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const selectedTech = tab.getAttribute("data-tech");
            switchTechnology(selectedTech);
        });
    });

    // Mobile navigation drawer toggle
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

    // Light/Dark Theme toggle
    themeToggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("light-theme");
        const isLight = document.body.classList.contains("light-theme");
        localStorage.setItem("snowflake_light_theme", isLight);
        themeIcon.textContent = isLight ? "☀️" : "🌙";
        themeText.textContent = isLight ? "Light Mode" : "Dark Mode";
    });

    // Search and Bookmarks Filters
    searchInput.addEventListener("input", renderSidebar);
    bookmarksOnlyToggle.addEventListener("change", renderSidebar);

    // Bookmark Toggle action
    bookmarkToggleBtn.addEventListener("click", () => {
        const key = `${activeTech}_${currentLessonId}`;
        const index = bookmarks.indexOf(key);
        if (index > -1) {
            bookmarks.splice(index, 1);
            bookmarkToggleBtn.classList.remove("active");
            bookmarkStarIcon.textContent = "☆";
        } else {
            bookmarks.push(key);
            bookmarkToggleBtn.classList.add("active");
            bookmarkStarIcon.textContent = "★";
        }
        localStorage.setItem("de_bookmarks", JSON.stringify(bookmarks));
        renderSidebar();
    });

    // Completion Toggle action
    completeToggleBtn.addEventListener("click", () => {
        const key = `${activeTech}_${currentLessonId}`;
        const index = completed.indexOf(key);
        if (index > -1) {
            completed.splice(index, 1);
            completeToggleBtn.classList.remove("active");
            completeCheckIcon.textContent = "⬜";
        } else {
            completed.push(key);
            completeToggleBtn.classList.add("active");
            completeCheckIcon.textContent = "✅";
        }
        localStorage.setItem("de_completed", JSON.stringify(completed));
        updateProgress();
        renderSidebar();
    });

    // Auto-save notes on typing input
    notesTextarea.addEventListener("input", () => {
        const key = `notes_${activeTech}_${currentLessonId}`;
        localStorage.setItem(key, notesTextarea.value);
    });

    // Code Examples Downloader
    downloadCodeBtn.addEventListener("click", downloadCodeExamples);
}

// Switch between Snowflake, ADF, dbt, SQL, Python, etc.
function switchTechnology(tech) {
    activeTech = tech;
    
    // Update tabs active states
    techTabs.forEach(tab => {
        if (tab.getAttribute("data-tech") === tech) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });

    // Update branding text & headers
    let brandingTitle = "DE Prep";
    let logoChar = "❄️";
    if (tech === "snowflake") { brandingTitle = "Snowflake Prep"; logoChar = "❄️"; }
    else if (tech === "adf") { brandingTitle = "ADF Prep"; logoChar = "☁️"; }
    else if (tech === "dbt") { brandingTitle = "dbt Prep"; logoChar = "📊"; }
    else if (tech === "sql") { brandingTitle = "SQL Masterclass"; logoChar = "🔑"; }
    else if (tech === "python") { brandingTitle = "Python Prep"; logoChar = "🐍"; }
    else if (tech === "fundamentals") { brandingTitle = "DE Fundamentals"; logoChar = "📚"; }
    else if (tech === "devops_obs") { brandingTitle = "DevOps & Obs"; logoChar = "⚙️"; }
    else if (tech === "aide") { brandingTitle = "AI in DE"; logoChar = "🤖"; }
    else if (tech === "scenarios") { brandingTitle = "Scenarios"; logoChar = "⏱️"; }
    
    sidebarMainTitle.textContent = brandingTitle;
    logoTitleMobile.textContent = brandingTitle;
    document.querySelector(".sidebar-logo").textContent = logoChar;

    // Reset search input on switching technologies
    searchInput.value = "";

    // Load first lesson of selected tech
    currentLessonId = "1.1";
    renderSidebar();
    loadLesson("1.1");
}

// Render dynamic, filtered sidebar categories
function renderSidebar() {
    const sidebarNav = document.getElementById("sidebar-nav");
    sidebarNav.innerHTML = "";
    
    const source = getActiveSource();
    const query = searchInput.value.toLowerCase().trim();
    const bookmarksOnly = bookmarksOnlyToggle.checked;

    // Group active curriculum lessons by Stage header
    const stages = {};
    const sortedKeys = Object.keys(source).sort((a, b) => {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const numA = aParts[i] || 0;
            const numB = bParts[i] || 0;
            if (numA !== numB) return numA - numB;
        }
        return 0;
    });

    sortedKeys.forEach(key => {
        const lesson = source[key];
        const matchKey = `${activeTech}_${lesson.id}`;

        // Apply Bookmarks filter
        if (bookmarksOnly && !bookmarks.includes(matchKey)) return;

        // Apply Search filter
        if (query) {
            const matchesSearch = 
                lesson.title.toLowerCase().includes(query) || 
                lesson.id.includes(query) || 
                (lesson.subtitle && lesson.subtitle.toLowerCase().includes(query)) ||
                (lesson.theory && lesson.theory.toLowerCase().includes(query));
            if (!matchesSearch) return;
        }

        if (!stages[lesson.stage]) {
            stages[lesson.stage] = [];
        }
        stages[lesson.stage].push(lesson);
    });

    const groupedKeys = Object.keys(stages).sort();
    if (groupedKeys.length === 0) {
        sidebarNav.innerHTML = `<div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">No matching modules found.</div>`;
        return;
    }

    // Build categories and item elements
    groupedKeys.forEach(stageName => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "module-group";

        const headerDiv = document.createElement("div");
        headerDiv.className = "module-header";
        headerDiv.textContent = stageName;
        groupDiv.appendChild(headerDiv);

        const listUl = document.createElement("ul");
        listUl.className = "lesson-list";

        stages[stageName].forEach(lesson => {
            const itemLi = document.createElement("li");
            itemLi.className = "lesson-item";
            if (lesson.id === currentLessonId) {
                itemLi.classList.add("active");
            }
            itemLi.setAttribute("data-lesson-id", lesson.id);

            const matchKey = `${activeTech}_${lesson.id}`;
            const isBookmarked = bookmarks.includes(matchKey);
            const isCompleted = completed.includes(matchKey);

            // Add indicators next to the link
            itemLi.innerHTML = `
                <div class="sidebar-link">
                    <span>${lesson.id} ${lesson.title}</span>
                    <div class="sidebar-item-indicators">
                        ${isBookmarked ? '<span class="indicator-star">★</span>' : ""}
                        ${isCompleted ? '<span class="indicator-check">✓</span>' : ""}
                    </div>
                </div>
            `;

            itemLi.addEventListener("click", () => {
                loadLesson(lesson.id);
                // Close mobile drawer on item click
                if (window.innerWidth <= 992) {
                    sidebar.classList.remove("open");
                }
            });

            listUl.appendChild(itemLi);
        });

        groupDiv.appendChild(listUl);
        sidebarNav.appendChild(groupDiv);
    });
}

// Load active lesson contents
function loadLesson(lessonId) {
    currentLessonId = lessonId;
    
    const source = getActiveSource();
    const lesson = source[lessonId];
    if (!lesson) {
        console.warn(`Lesson ${lessonId} not found under tech: ${activeTech}`);
        return;
    }

    // Refresh active state class on sidebar lists
    const items = document.querySelectorAll(".lesson-item");
    items.forEach(item => {
        if (item.getAttribute("data-lesson-id") === lessonId) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // Populate dynamic headers
    breadcrumbStage.textContent = lesson.stage ? lesson.stage.split(":")[0] : "Stage";
    breadcrumbLesson.textContent = `Topic ${lesson.id}`;
    lessonDuration.textContent = lesson.duration || "🕒 10 min read";
    lessonDifficulty.textContent = lesson.difficulty || "Intermediate";

    // Populate titles
    lessonTitle.textContent = lesson.title;
    lessonSubtitle.textContent = lesson.subtitle;

    // Inject core theory content
    let coreContentHtml = lesson.theory || "";
    if (lesson.hasTable && lesson.tableData) {
        coreContentHtml += `<h3>Comparison Breakdown</h3>`;
        coreContentHtml += generateTableHTML(lesson.tableData);
    }
    theoryText.innerHTML = coreContentHtml;

    // Save/Track Recently Viewed Queue
    addToRecentlyViewed(lesson.title);

    // Sync Action Buttons active states
    const matchKey = `${activeTech}_${lessonId}`;
    if (bookmarks.includes(matchKey)) {
        bookmarkToggleBtn.classList.add("active");
        bookmarkStarIcon.textContent = "★";
    } else {
        bookmarkToggleBtn.classList.remove("active");
        bookmarkStarIcon.textContent = "☆";
    }

    if (completed.includes(matchKey)) {
        completeToggleBtn.classList.add("active");
        completeCheckIcon.textContent = "✅";
    } else {
        completeToggleBtn.classList.remove("active");
        completeCheckIcon.textContent = "⬜";
    }

    // Load active lesson study notes
    const notesKey = `notes_${activeTech}_${lessonId}`;
    notesTextarea.value = localStorage.getItem(notesKey) || "";

    // Parse and add dynamic Copy buttons to code snippets
    attachCopyCodeButtons();

    // Toggle code downloader button based on code blocks availability
    const codeBlocks = theoryText.querySelectorAll("pre code");
    if (codeBlocks.length > 0) {
        downloadCodeBtn.style.display = "flex";
    } else {
        downloadCodeBtn.style.display = "none";
    }

    // Populate collapsible Q&A accordion list
    interviewQnaList.innerHTML = "";
    if (lesson.interviewQuestions && lesson.interviewQuestions.length > 0) {
        lesson.interviewQuestions.forEach((qna, index) => {
            const qnaItem = document.createElement("div");
            qnaItem.className = "qna-item";

            const button = document.createElement("button");
            button.className = "qna-question-btn";
            button.setAttribute("aria-expanded", "false");
            button.innerHTML = `<span><strong>Q${index + 1}:</strong> ${qna.question}</span>`;

            const panel = document.createElement("div");
            panel.className = "qna-answer-panel";
            panel.innerHTML = qna.answer;

            // Accordion click trigger logic
            button.addEventListener("click", () => {
                const expanded = button.getAttribute("aria-expanded") === "true";
                button.setAttribute("aria-expanded", !expanded);
                panel.classList.toggle("open");
            });

            qnaItem.appendChild(button);
            qnaItem.appendChild(panel);
            interviewQnaList.appendChild(qnaItem);
        });
    } else {
        interviewQnaList.innerHTML = `<p style="color: var(--text-muted);">No interview preparation questions available for this module.</p>`;
    }
}

// Push current lesson parameters to recently viewed queue
function addToRecentlyViewed(title) {
    // Remove if already exists
    recentlyViewed = recentlyViewed.filter(item => !(item.tech === activeTech && item.id === currentLessonId));
    
    // Add to front of list
    recentlyViewed.unshift({
        tech: activeTech,
        id: currentLessonId,
        title: title
    });

    // Keep only last 3 items
    if (recentlyViewed.length > 3) {
        recentlyViewed = recentlyViewed.slice(0, 3);
    }

    localStorage.setItem("de_recently_viewed", JSON.stringify(recentlyViewed));
    renderRecentlyViewed();
}

// Render dynamic list of recently viewed modules
function renderRecentlyViewed() {
    recentlyViewedList.innerHTML = "";
    if (recentlyViewed.length === 0) {
        recentlyViewedList.innerHTML = `<div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">No topics viewed yet.</div>`;
        return;
    }

    recentlyViewed.forEach(item => {
        const itemLink = document.createElement("div");
        itemLink.className = "recently-viewed-item";
        itemLink.textContent = `[${item.tech.toUpperCase()}] ${item.id} ${item.title}`;
        itemLink.addEventListener("click", () => {
            if (activeTech !== item.tech) {
                switchTechnology(item.tech);
            }
            loadLesson(item.id);
        });
        recentlyViewedList.appendChild(itemLink);
    });
}

// Generate simple HTML tables from JS dataset objects
function generateTableHTML(tableData) {
    if (!tableData || !tableData.headers || !tableData.rows) return "";

    let html = `<table class="custom-table"><thead><tr>`;
    tableData.headers.forEach(header => {
        html += `<th>${header}</th>`;
    });
    html += `</tr></thead><tbody>`;

    tableData.rows.forEach(row => {
        html += `<tr>`;
        row.forEach(cell => {
            if (cell.includes("YES") || cell.includes("Yes")) {
                html += `<td><span class="tag tag-success">YES</span></td>`;
            } else if (cell.includes("NO") || cell.includes("No")) {
                html += `<td><span class="tag tag-primary">NO</span></td>`;
            } else {
                html += `<td>${cell}</td>`;
            }
        });
        html += `</tr>`;
    });

    html += `</tbody></table>`;
    return html;
}

// Inject copy buttons inside all pre elements dynamically
function attachCopyCodeButtons() {
    const preBlocks = theoryText.querySelectorAll("pre");
    preBlocks.forEach(pre => {
        // Prevent duplicate buttons creation
        if (pre.querySelector(".copy-code-btn")) return;

        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-code-btn";
        copyBtn.textContent = "Copy";

        copyBtn.addEventListener("click", () => {
            const codeText = pre.querySelector("code").innerText;
            navigator.clipboard.writeText(codeText).then(() => {
                copyBtn.textContent = "Copied!";
                copyBtn.style.borderColor = "var(--accent-emerald)";
                setTimeout(() => {
                    copyBtn.textContent = "Copy";
                    copyBtn.style.borderColor = "";
                }, 2000);
            });
        });

        pre.appendChild(copyBtn);
    });
}

// Extract code fragments from the page and download them as file attachments
function downloadCodeExamples() {
    const codeBlocks = theoryText.querySelectorAll("pre code");
    if (codeBlocks.length === 0) return;

    let fullCodeContent = "";
    codeBlocks.forEach((code, index) => {
        fullCodeContent += `-- Example Block ${index + 1}\n`;
        fullCodeContent += code.innerText;
        fullCodeContent += "\n\n";
    });

    const fileExtension = activeTech === "python" ? "py" : "sql";
    const mimeType = activeTech === "python" ? "text/x-python" : "text/x-sql";

    const blob = new Blob([fullCodeContent], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `code_examples_${activeTech}_${currentLessonId}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Start application
window.addEventListener("DOMContentLoaded", init);
