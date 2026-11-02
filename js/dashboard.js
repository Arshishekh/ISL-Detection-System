/* =========================================================
   SIGNBRIDGE DASHBOARD
   Vanilla JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------------------------------
    // 1. ELEMENT REFERENCES
    // -----------------------------------------------------

    const sidebar = document.getElementById("sidebar");
    const mobileMenuButton = document.getElementById("mobileMenuButton");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    const sidebarLinks = document.querySelectorAll(".sidebar-link");

    const profileButton = document.getElementById("profileButton");
    const profileDropdown = document.getElementById("profileDropdown");
    const editProfileButton = document.getElementById("editProfileButton");

    const profileDialog = document.getElementById("profileDialog");
    const closeProfileDialog = document.getElementById("closeProfileDialog");
    const profileForm = document.getElementById("profileForm");
    const displayNameInput = document.getElementById("displayNameInput");

    const profileName = document.getElementById("profileName");
    const profileAvatar = document.getElementById("profileAvatar");
    const welcomeName = document.getElementById("welcomeName");

    const settingsLink = document.getElementById("settingsLink");
    const settingsDialog = document.getElementById("settingsDialog");
    const settingsForm = document.getElementById("settingsForm");
    const closeSettingsDialog = document.getElementById("closeSettingsDialog");

    const speechEnabled = document.getElementById("speechEnabled");
    const reduceMotion = document.getElementById("reduceMotion");

    const speechText = document.getElementById("speechText");
    const speechRate = document.getElementById("speechRate");
    const speakButton = document.getElementById("speakButton");
    const stopSpeechButton = document.getElementById("stopSpeechButton");
    const speechStatus = document.getElementById("speechStatus");

    const activityList = document.getElementById("activityList");
    const clearActivityButton = document.getElementById("clearActivityButton");

    const notificationButton = document.getElementById("notificationButton");

    const dashboardToast = document.getElementById("dashboardToast");
    const toastMessage = document.getElementById("toastMessage");

    const currentYear = document.getElementById("dashboardYear");


    // -----------------------------------------------------
    // 2. LOCAL STORAGE HELPERS
    // -----------------------------------------------------

    // Local storage keeps preferences in this browser.
    // It is NOT a replacement for a backend or user account.

    function readLocal(key, fallback) {

        try {

            const savedValue = localStorage.getItem(key);

            return savedValue === null
                ? fallback
                : JSON.parse(savedValue);

        } catch (error) {

            console.warn("Could not read local preference:", error);

            return fallback;

        }

    }


    function writeLocal(key, value) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            return true;

        } catch (error) {

            console.warn("Could not save local preference:", error);

            return false;

        }

    }


    // -----------------------------------------------------
    // 3. TOAST NOTIFICATIONS
    // -----------------------------------------------------

    let toastTimer;


    function showToast(message) {

        toastMessage.textContent = message;

        dashboardToast.classList.add("visible");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {

            dashboardToast.classList.remove("visible");

        }, 3500);

    }


    // -----------------------------------------------------
    // 4. DISPLAY NAME
    // -----------------------------------------------------

    function updateDisplayName(name) {

        const cleanName = name.trim() || "Friend";

        profileName.textContent = cleanName;
        welcomeName.textContent = cleanName;

        profileAvatar.textContent =
            cleanName.charAt(0).toUpperCase();

        document.title = "Dashboard | SignBridge";

    }


    const savedName = readLocal("signbridge-display-name", "Arshi");

    updateDisplayName(savedName);


    // -----------------------------------------------------
    // 5. PROFILE DROPDOWN
    // -----------------------------------------------------

    profileButton.addEventListener("click", () => {

        const currentlyOpen =
            profileButton.getAttribute("aria-expanded") === "true";

        profileButton.setAttribute(
            "aria-expanded",
            String(!currentlyOpen)
        );

        profileDropdown.hidden = currentlyOpen;

    });


    // Close the dropdown when clicking outside.

    document.addEventListener("click", (event) => {

        if (
            !profileButton.contains(event.target) &&
            !profileDropdown.contains(event.target)
        ) {

            profileDropdown.hidden = true;

            profileButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });


    // -----------------------------------------------------
    // 6. EDIT DISPLAY NAME
    // -----------------------------------------------------

    editProfileButton.addEventListener("click", () => {

        profileDropdown.hidden = true;

        profileButton.setAttribute(
            "aria-expanded",
            "false"
        );

        displayNameInput.value = profileName.textContent;

        profileDialog.showModal();

        displayNameInput.focus();

    });


    closeProfileDialog.addEventListener("click", () => {

        profileDialog.close();

    });


    profileForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const newName = displayNameInput.value.trim();

        if (newName.length < 2) {

            showToast("Please enter a name with at least 2 characters.");

            displayNameInput.focus();

            return;

        }


        const saved = writeLocal(
            "signbridge-display-name",
            newName
        );

        if (!saved) {

            showToast("Could not save your name in this browser.");

            return;

        }


        updateDisplayName(newName);

        profileDialog.close();

        showToast("Your display name has been updated.");

    });


    // -----------------------------------------------------
    // 7. SETTINGS
    // -----------------------------------------------------

    function loadSettings() {

        speechEnabled.checked = readLocal(
            "signbridge-speech-enabled",
            true
        );

        reduceMotion.checked = readLocal(
            "signbridge-reduce-motion",
            false
        );

        applyMotionPreference();

    }


    function applyMotionPreference() {

        document.documentElement.style.scrollBehavior =
            reduceMotion.checked ? "auto" : "smooth";

        document.body.classList.toggle(
            "reduce-motion",
            reduceMotion.checked
        );

    }


    settingsLink.addEventListener("click", (event) => {

        event.preventDefault();

        profileDropdown.hidden = true;

        profileButton.setAttribute(
            "aria-expanded",
            "false"
        );

        loadSettings();

        settingsDialog.showModal();

        closeSidebar();

    });


    closeSettingsDialog.addEventListener("click", () => {

        settingsDialog.close();

    });


    settingsForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const savedSpeech = writeLocal(
            "signbridge-speech-enabled",
            speechEnabled.checked
        );

        const savedMotion = writeLocal(
            "signbridge-reduce-motion",
            reduceMotion.checked
        );


        if (!savedSpeech || !savedMotion) {

            showToast("Some settings could not be saved.");

            return;

        }


        applyMotionPreference();

        settingsDialog.close();

        showToast("Your settings have been saved.");

    });


    loadSettings();


    // -----------------------------------------------------
    // 8. MOBILE SIDEBAR
    // -----------------------------------------------------

    function openSidebar() {

        sidebar.classList.add("open");

        sidebarOverlay.classList.add("visible");

        mobileMenuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        mobileMenuButton.setAttribute(
            "aria-label",
            "Close navigation"
        );

    }


    function closeSidebar() {

        sidebar.classList.remove("open");

        sidebarOverlay.classList.remove("visible");

        mobileMenuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        mobileMenuButton.setAttribute(
            "aria-label",
            "Open navigation"
        );

    }


    mobileMenuButton.addEventListener("click", () => {

        const isOpen = sidebar.classList.contains("open");

        if (isOpen) {

            closeSidebar();

        } else {

            openSidebar();

        }

    });


    sidebarOverlay.addEventListener("click", closeSidebar);


    // -----------------------------------------------------
    // 9. DASHBOARD NAVIGATION
    // -----------------------------------------------------

    function updateActiveNavigation() {

        const currentHash = window.location.hash || "#welcome";

        let matchingLink = null;

        sidebarLinks.forEach((link) => {

            link.classList.remove("active");

            if (link.getAttribute("href") === currentHash) {

                matchingLink = link;

            }

        });


        if (matchingLink) {

            matchingLink.classList.add("active");

        } else {

            const dashboardLink = document.querySelector(
                '.sidebar-link[href="#welcome"]'
            );

            dashboardLink.classList.add("active");

        }

    }


    sidebarLinks.forEach((link) => {

        const destination = link.getAttribute("href");

        // Settings opens a dialog rather than navigating.

        if (destination === "#settings") {
            return;
        }

        link.addEventListener("click", () => {

            if (destination.startsWith("#")) {

                closeSidebar();

                sidebarLinks.forEach((item) => {
                    item.classList.remove("active");
                });

                link.classList.add("active");

            }

        });

    });


    window.addEventListener("hashchange", updateActiveNavigation);

    updateActiveNavigation();


    // -----------------------------------------------------
    // 10. FEATURE BUTTONS
    // -----------------------------------------------------

    const featureButtons = document.querySelectorAll(
        "[data-feature]"
    );


    featureButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const feature = button.dataset.feature;

            if (feature === "speech") {

                document.getElementById("quick-speech").scrollIntoView({
                    behavior: reduceMotion.checked ? "auto" : "smooth",
                    block: "center"
                });

                speechText.focus();

                return;

            }


            if (feature === "detection") {

                showToast(
                    "The camera recognition module is our next development step. No sign is being recognized yet."
                );

                return;

            }


            if (feature === "text") {

                showToast(
                    "The Text Studio will be connected to the recognition output in a later step."
                );

                return;

            }


            if (feature === "learning") {

    document.getElementById("learning-library").scrollIntoView({
        behavior: reduceMotion.checked ? "auto" : "smooth",
        block: "start"
    });

    return;

}

        });

    });
    
    // -----------------------------------------------------
    // 10A. LEARNING HUB SEARCH AND FILTERS
    // -----------------------------------------------------

    const learningSearch = document.getElementById("learningSearch");
    const learningFilters = document.getElementById("learningFilters");
    const learningGrid = document.getElementById("learningVideoGrid");
    const learningEmpty = document.getElementById("learningEmpty");

    let selectedLearningCategory = "all";

    function filterLearningVideos() {

        const searchTerm = learningSearch.value
            .trim()
            .toLowerCase();

        const cards = learningGrid.querySelectorAll(".learning-video-card");

        let visibleCount = 0;

        cards.forEach((card) => {

            const word = card.dataset.word;
            const category = card.dataset.category;

            const matchesSearch = word.includes(searchTerm);

            const matchesCategory =
                selectedLearningCategory === "all" ||
                category === selectedLearningCategory;

            const shouldShow = matchesSearch && matchesCategory;

            card.hidden = !shouldShow;

            if (!shouldShow) {
                const video = card.querySelector("video");
                video.pause();
            }

            if (shouldShow) {
                visibleCount++;
            }

        });

        learningEmpty.hidden = visibleCount !== 0;

    }


    learningSearch.addEventListener("input", filterLearningVideos);


    learningFilters.addEventListener("click", (event) => {

        const button = event.target.closest(".learning-filter");

        if (!button) return;

        selectedLearningCategory = button.dataset.category;

        learningFilters.querySelectorAll(".learning-filter").forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        filterLearningVideos();

    });


    // Only one learning video plays at a time.

    learningGrid.addEventListener("play", (event) => {

        if (event.target.tagName !== "VIDEO") return;

        learningGrid.querySelectorAll("video").forEach((video) => {

            if (video !== event.target) {
                video.pause();
            }

        });

        addActivity(
            "Learning Hub",
            "Practising the sign: " +
            event.target.closest(".learning-video-card").querySelector("h3").textContent
        );

    }, true);

    // -----------------------------------------------------
    // 11. RECENT ACTIVITY
    // -----------------------------------------------------

    function getActivities() {

        const activities = readLocal(
            "signbridge-activities",
            []
        );

        return Array.isArray(activities)
            ? activities
            : [];

    }


    function addActivity(title, description) {

        const activities = getActivities();

        activities.unshift({

            id: Date.now(),

            title: title,

            description: description,

            timestamp: new Date().toISOString()

        });


        // Keep the most recent 20 items.

        const trimmedActivities = activities.slice(0, 20);

        writeLocal(
            "signbridge-activities",
            trimmedActivities
        );

        renderActivities();

    }


    function formatActivityTime(timestamp) {

        const date = new Date(timestamp);

        if (Number.isNaN(date.getTime())) {

            return "Recently";

        }

        const difference = Date.now() - date.getTime();

        const minutes = Math.floor(difference / 60000);

        if (minutes < 1) {

            return "Just now";

        }

        if (minutes < 60) {

            return `${minutes} min ago`;

        }

        const hours = Math.floor(minutes / 60);

        if (hours < 24) {

            return `${hours} hr ago`;

        }

        return date.toLocaleDateString();

    }


    function getActivityIcon(title) {

        const lowerTitle = title.toLowerCase();

        if (lowerTitle.includes("speech")) {

            return "fa-volume-high";

        }

        if (lowerTitle.includes("profile")) {

            return "fa-user-pen";

        }

        if (lowerTitle.includes("text")) {

            return "fa-align-left";

        }

        return "fa-clock";

    }


    function renderActivities() {

        const activities = getActivities();

        activityList.replaceChildren();


        if (activities.length === 0) {

            const emptyState = document.createElement("div");

            emptyState.className = "empty-activity";


            const icon = document.createElement("span");

            icon.className = "empty-activity-icon";

            const clockIcon = document.createElement("i");

            clockIcon.className = "fa-regular fa-clock";

            icon.appendChild(clockIcon);


            const title = document.createElement("p");

            title.textContent = "No activity yet.";


            const description = document.createElement("span");

            description.textContent =
                "Your interactions will appear here.";


            emptyState.append(icon, title, description);

            activityList.appendChild(emptyState);

            return;

        }


        activities.forEach((activity) => {

            const row = document.createElement("div");

            row.className = "activity-entry";


            const iconContainer = document.createElement("span");

            iconContainer.className = "activity-entry-icon";


            const icon = document.createElement("i");

            icon.className =
                "fa-solid " + getActivityIcon(activity.title);

            iconContainer.appendChild(icon);


            const copy = document.createElement("div");

            copy.className = "activity-entry-copy";


            const title = document.createElement("strong");

            title.textContent = activity.title;


            const description = document.createElement("small");

            description.textContent = activity.description;


            copy.append(title, description);


            const time = document.createElement("span");

            time.className = "activity-entry-time";

            time.textContent = formatActivityTime(
                activity.timestamp
            );


            row.append(iconContainer, copy, time);

            activityList.appendChild(row);

        });

    }


    clearActivityButton.addEventListener("click", () => {

        const activities = getActivities();

        if (activities.length === 0) {

            showToast("There is no activity to clear.");

            return;

        }


        const confirmed = window.confirm(
            "Clear all locally saved SignBridge activity?"
        );

        if (!confirmed) {

            return;

        }


        const saved = writeLocal(
            "signbridge-activities",
            []
        );

        if (!saved) {

            showToast("Could not clear activity.");

            return;

        }


        renderActivities();

        showToast("Recent activity has been cleared.");

    });


    renderActivities();


    // -----------------------------------------------------
    // 12. TEXT-TO-SPEECH
    // -----------------------------------------------------

    let speechIsPlaying = false;


    function updateSpeechStatus(message, type = "") {

        speechStatus.textContent = message;

        speechStatus.className = "speech-status";

        if (type) {

            speechStatus.classList.add(type);

        }

    }


    function updateSpeechControls(isPlaying) {

        speechIsPlaying = isPlaying;

        speakButton.disabled = isPlaying;

        stopSpeechButton.hidden = !isPlaying;

    }


    function stopSpeaking() {

        if ("speechSynthesis" in window) {

            window.speechSynthesis.cancel();

        }

        updateSpeechControls(false);

    }


    speakButton.addEventListener("click", () => {

        const message = speechText.value.trim();


        if (!message) {

            updateSpeechStatus(
                "Type a message before pressing Speak.",
                "error"
            );

            speechText.focus();

            return;

        }


        if (!speechEnabled.checked) {

            updateSpeechStatus(
                "Speech is disabled in Settings.",
                "error"
            );

            return;

        }


        if (!("speechSynthesis" in window)) {

            updateSpeechStatus(
                "Your browser does not support speech synthesis.",
                "error"
            );

            return;

        }


        stopSpeaking();


        const utterance = new SpeechSynthesisUtterance(message);

        utterance.rate = Number(speechRate.value);


        utterance.onstart = () => {

            updateSpeechControls(true);

            updateSpeechStatus("Speaking your message...", "success");

        };


        utterance.onend = () => {

            updateSpeechControls(false);

            updateSpeechStatus("Finished speaking.", "success");

        };


        utterance.onerror = (event) => {

            updateSpeechControls(false);

            if (event.error === "canceled" || event.error === "interrupted") {
                return;
            }

            updateSpeechStatus(
                "Speech could not be completed. Please try again.",
                "error"
            );

        };


        updateSpeechStatus("Preparing speech...");


        try {

            window.speechSynthesis.speak(utterance);

            addActivity(
                "Speech Output",
                message.length > 65
                    ? message.slice(0, 65) + "..."
                    : message
            );

        } catch (error) {

            updateSpeechControls(false);

            updateSpeechStatus(
                "Unable to start speech in this browser.",
                "error"
            );

        }

    });


    stopSpeechButton.addEventListener("click", () => {

        stopSpeaking();

        updateSpeechStatus("Speech stopped.");

    });


    // -----------------------------------------------------
    // 13. NOTIFICATIONS
    // -----------------------------------------------------

    notificationButton.addEventListener("click", () => {

        showToast(
            "You're all caught up. More notifications will appear when additional features are connected."
        );

    });


    // -----------------------------------------------------
    // 14. FOOTER YEAR
    // -----------------------------------------------------

    currentYear.textContent = new Date().getFullYear();


    // -----------------------------------------------------
    // 15. DIALOG ACCESSIBILITY
    // -----------------------------------------------------

    [profileDialog, settingsDialog].forEach((dialog) => {

        dialog.addEventListener("click", (event) => {

            // Close a dialog if the user clicks its backdrop.

            if (event.target === dialog) {

                dialog.close();

            }

        });

    });


    // -----------------------------------------------------
    // 16. INITIALIZE
    // -----------------------------------------------------

    console.log(
        "SignBridge dashboard loaded successfully."
    );

});