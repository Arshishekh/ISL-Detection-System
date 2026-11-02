/* =====================================================
   SIGNBRIDGE — MAIN JAVASCRIPT
   Frontend interactions for the landing page
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // -------------------------------------------------
    // 1. GET HTML ELEMENTS
    // -------------------------------------------------

    const signInTab = document.getElementById("signInTab");
    const createAccountTab = document.getElementById("createAccountTab");

    const authTitle = document.getElementById("authTitle");
    const authSubtitle = document.getElementById("authSubtitle");

    const authForm = document.getElementById("authForm");
    const nameField = document.getElementById("nameField");
    const fullNameInput = document.getElementById("fullName");

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const passwordToggle = document.getElementById("passwordToggle");

    const rememberRow = document.getElementById("rememberRow");
    const forgotPassword = document.getElementById("forgotPassword");

    const submitButtonText = document.getElementById("submitButtonText");

    const formMessage = document.getElementById("formMessage");

    const authSwitchText = document.getElementById("authSwitchText");
    const switchAuthMode = document.getElementById("switchAuthMode");

    const googleButton = document.getElementById("googleButton");

    const mobileMenuButton = document.getElementById("mobileMenuButton");
    const mainNav = document.querySelector(".main-nav");

    const navLinks = document.querySelectorAll(".nav-link");


    // -------------------------------------------------
    // 2. AUTHENTICATION MODE
    // -------------------------------------------------

    let authMode = "signin";


    function showMessage(message, type = "info") {

        formMessage.textContent = message;

        formMessage.className = "form-message " + type;

    }


    function clearMessage() {

        formMessage.textContent = "";
        formMessage.className = "form-message";

    }


    function setAuthMode(mode) {

        authMode = mode;

        const isSignIn = mode === "signin";

        // Update selected tabs.

        signInTab.classList.toggle("active", isSignIn);
        createAccountTab.classList.toggle("active", !isSignIn);

        signInTab.setAttribute(
            "aria-selected",
            String(isSignIn)
        );

        createAccountTab.setAttribute(
            "aria-selected",
            String(!isSignIn)
        );


        // Show the name field only during registration.

        nameField.hidden = isSignIn;

        fullNameInput.required = !isSignIn;


        // Update the heading.

        authTitle.textContent = isSignIn
            ? "Welcome back!"
            : "Create your account";


        authSubtitle.textContent = isSignIn
            ? "Sign in to continue to SignBridge."
            : "Start your SignBridge journey.";


        // Update password autocomplete behaviour.

        passwordInput.autocomplete = isSignIn
            ? "current-password"
            : "new-password";


        // Update the remember-me and forgot-password controls.

        rememberRow.hidden = !isSignIn;
        forgotPassword.hidden = !isSignIn;


        // Update the submit button.

        submitButtonText.textContent = isSignIn
            ? "Sign In"
            : "Create Account";


        // Update the link below the form.

        authSwitchText.firstChild.textContent = isSignIn
            ? "Don't have an account? "
            : "Already have an account? ";

        switchAuthMode.textContent = isSignIn
            ? "Create one"
            : "Sign in";


        // Reset password visibility and old messages.

        passwordInput.type = "password";

        passwordToggle.setAttribute(
            "aria-label",
            "Show password"
        );

        clearMessage();

    }


    signInTab.addEventListener("click", () => {
        setAuthMode("signin");
    });


    createAccountTab.addEventListener("click", () => {
        setAuthMode("signup");
    });


    switchAuthMode.addEventListener("click", () => {

        const nextMode = authMode === "signin"
            ? "signup"
            : "signin";

        setAuthMode(nextMode);

    });


    // -------------------------------------------------
    // 3. SHOW OR HIDE PASSWORD
    // -------------------------------------------------

    passwordToggle.addEventListener("click", () => {

        const passwordIsHidden =
            passwordInput.type === "password";

        passwordInput.type = passwordIsHidden
            ? "text"
            : "password";

        passwordToggle.setAttribute(
            "aria-label",
            passwordIsHidden
                ? "Hide password"
                : "Show password"
        );

    });

// -------------------------------------------------
// 4. FORM SUBMISSION
// -------------------------------------------------

authForm.addEventListener("submit", (event) => {

    event.preventDefault();
    clearMessage();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !emailInput.validity.valid) {
        showMessage("Please enter a valid email address.", "error");
        emailInput.focus();
        return;
    }

    if (password.length < 6) {
        showMessage("Password must contain at least 6 characters.", "error");
        passwordInput.focus();
        return;
    }

    try {

        // Read the demo account saved in this browser.
        const savedAccount = JSON.parse(
            localStorage.getItem("signbridge-demo-account") || "null"
        );

        let userName = "";

        if (authMode === "signup") {

            const fullName = fullNameInput.value.trim();

            if (fullName.length < 2) {
                showMessage("Please enter your full name.", "error");
                fullNameInput.focus();
                return;
            }

            if (savedAccount && savedAccount.email === email) {
                showMessage(
                    "This email already has a demo account. Please sign in.",
                    "error"
                );
                return;
            }

            // Save the demo user's name and email.
            // Never save the password in frontend storage.
            localStorage.setItem(
                "signbridge-demo-account",
                JSON.stringify({
                    name: fullName,
                    email: email
                })
            );

            userName = fullName;

        } else {

            if (!savedAccount || savedAccount.email !== email) {
                showMessage(
                    "No demo account found with this email. Please create an account first.",
                    "error"
                );
                return;
            }

            userName = savedAccount.name;

        }
        localStorage.setItem("signbridge-display-name", userName);

        // Keep the current login for this browser tab session.
        sessionStorage.setItem(
            "signbridge-current-user",
            JSON.stringify({
                name: userName,
                email: email
            })
        );

        // Open the dashboard.
        window.location.href = "dashboard.html";

    } catch (error) {

        showMessage(
            "Something went wrong. Please try again.",
            "error"
        );

        console.error("SignBridge demo authentication error:", error);

    }

});

    // -------------------------------------------------
    // 5. FORGOT PASSWORD
    // -------------------------------------------------

    forgotPassword.addEventListener("click", () => {

        clearMessage();

        const email = emailInput.value.trim();

        if (!email) {

            showMessage(
                "Enter your email address above first. Password recovery will be available after backend integration.",
                "info"
            );

            emailInput.focus();

            return;

        }


        if (!emailInput.validity.valid) {

            showMessage(
                "Please enter a valid email address first.",
                "error"
            );

            emailInput.focus();

            return;

        }


        showMessage(
            "Email format looks valid. Actual password recovery requires a connected authentication service.",
            "info"
        );

    });


    // -------------------------------------------------
    // 6. GOOGLE SIGN-IN PLACEHOLDER
    // -------------------------------------------------

    googleButton.addEventListener("click", () => {

        showMessage(
            "Google sign-in has not been connected yet. We'll add authentication when the backend is ready.",
            "info"
        );

    });


    // -------------------------------------------------
    // 7. MOBILE NAVIGATION
    // -------------------------------------------------

    mobileMenuButton.addEventListener("click", () => {

        const menuIsOpen =
            mobileMenuButton.getAttribute("aria-expanded") === "true";

        mobileMenuButton.setAttribute(
            "aria-expanded",
            String(!menuIsOpen)
        );

        mainNav.classList.toggle("open", !menuIsOpen);

        mobileMenuButton.setAttribute(
            "aria-label",
            menuIsOpen
                ? "Open navigation"
                : "Close navigation"
        );

    });


    // Close the mobile menu when a navigation link is clicked.

    navLinks.forEach((link) => {

        link.addEventListener("click", () => {

            mainNav.classList.remove("open");

            mobileMenuButton.setAttribute(
                "aria-expanded",
                "false"
            );

            mobileMenuButton.setAttribute(
                "aria-label",
                "Open navigation"
            );

        });

    });


    // -------------------------------------------------
    // 8. NAVIGATION ACTIVE STATES
    // -------------------------------------------------

    navLinks.forEach((link) => {

        link.addEventListener("click", () => {

            navLinks.forEach((item) => {
                item.classList.remove("active");
            });

            link.classList.add("active");

        });

    });


    // -------------------------------------------------
    // 9. AUTOMATIC COPYRIGHT YEAR
    // -------------------------------------------------

    const currentYear = document.getElementById("currentYear");

    currentYear.textContent = new Date().getFullYear();


    // -------------------------------------------------
    // 10. INITIALIZE THE PAGE
    // -------------------------------------------------

    setAuthMode("signin");

    console.log("SignBridge landing page initialized successfully.");

});