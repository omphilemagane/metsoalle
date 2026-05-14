"use strict";

const queue = {
    "alerts": [],
    "loader": []
};

const hideContent = () => {
    if (queue["alerts"]["length"] != 0 || queue["loader"]["length"] != 0) {
        document.querySelector('div[class="header-content"]')["style"]["visibility"] = "hidden";

        document.querySelector('div[class="splash-content"]')["style"]["visibility"] = "hidden";

        document.querySelector('div[class="footer-content"]')["style"]["visibility"] = "hidden";
    }
};

const showContent = () => {
    if (queue["alerts"]["length"] == 0 && queue["loader"]["length"] == 0) {
        document.querySelector('div[class="header-content"]')["style"]["visibility"] = "";

        document.querySelector('div[class="splash-content"]')["style"]["visibility"] = "";

        document.querySelector('div[class="footer-content"]')["style"]["visibility"] = "";
    }
};

const openAlerts = (heading, message, button = "Close", callback = null) => {
    queue["alerts"].push({ heading, message, button, callback });

    if (queue["alerts"]["length"] == 1) {
        document.querySelector('h1[class="alerts-content-heading"]')["textContent"] = heading;

        document.querySelector('p[class="alerts-content-message"]')["textContent"] = message;

        document.querySelector('span[class="alerts-content-input-button-text"]')["textContent"] = button;

        document.querySelector('div[class="alerts"]')["style"]["display"] = "block";
    }

    hideContent();
};

const closeAlerts = () => {
    const { heading, message, button, callback } = queue["alerts"].shift();

    if (callback != null) {
        callback();
    }

    if (queue["alerts"]["length"] == 0) {
        document.querySelector('h1[class="alerts-content-heading"]')["textContent"] = "";

        document.querySelector('p[class="alerts-content-message"]')["textContent"] = "";

        document.querySelector('span[class="alerts-content-input-button-text"]')["textContent"] = "";

        document.querySelector('div[class="alerts"]')["style"]["display"] = "";
    } else {
        const { heading, message, button, callback } = queue["alerts"][0];

        document.querySelector('h1[class="alerts-content-heading"]')["textContent"] = heading;

        document.querySelector('p[class="alerts-content-message"]')["textContent"] = message;

        document.querySelector('span[class="alerts-content-input-button-text"]')["textContent"] = button;
    }

    showContent();
};

const openLoader = () => {
    queue["loader"].push({});

    if (queue["loader"]["length"] == 1) {
        document.querySelector('div[class="loader"]')["style"]["display"] = "block";
    }

    hideContent();
};

const closeLoader = () => {
    const { } = queue["loader"].shift();

    if (queue["loader"]["length"] == 0) {
        document.querySelector('div[class="loader"]')["style"]["display"] = "";
    }

    showContent();
};

const buttonify = (button, callback) => {
    button.addEventListener("click", (event) => {
        callback(event);
    });

    button.addEventListener("keydown", (event) => {
        if (event["key"] == "Enter") {
            callback(event);
        }
    });
};

const clearStorage = (href = null) => {
    localStorage.clear();

    sessionStorage.clear();

    if (href != null) {
        location["href"] = href;
    }
};

const toggleTheme = (theme = null) => {
    const content = Array.from(document.querySelector('body').querySelectorAll('*'));

    if (theme != null) {
        for (let i = 0; i < content["length"]; i++) {
            content[i].setAttribute("data-theme", theme);
        }
    } else {
        for (let i = 0; i < content["length"]; i++) {
            content[i].removeAttribute("data-theme");
        }
    }
};

const init = async () => {
    openLoader();

    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
        if (event["matches"] == true) {
            toggleTheme("dark");
        } else {
            toggleTheme();
        }
    });

    if (matchMedia("(prefers-color-scheme: dark)")["matches"] == true) {
        toggleTheme("dark");
    }

    await sessionInit();

    await Promise.all([
        headerInit(),
        alertsInit(),
        loaderInit(),
        splashInit(),
        footerInit(),
        document.fonts.ready
    ]);

    closeLoader();
};

const sessionInit = async () => {
    /* code here */
};

const headerInit = async () => {
    const button = document.querySelectorAll('div[class="header-content-input-button"]');

    buttonify(button[0], (event) => {
        history.back();
    });

    buttonify(button[1], (event) => {
        location["href"] = "/home";
    });

    buttonify(button[2], (event) => {
        location["href"] = "/profile";
    });
};

const alertsInit = async () => {
    const button = document.querySelectorAll('div[class="alerts-content-input-button"]');

    buttonify(button[0], (event) => {
        closeAlerts();
    });
};

const loaderInit = async () => {
    /* left blank */
};

const splashInit = async () => {
    /* code here */
};

const footerInit = async () => {
    const button = document.querySelectorAll('div[class="footer-content-input-button"]');

    buttonify(button[0], (event) => {
        location["href"] = "/home";
    });

    buttonify(button[1], (event) => {
        location["href"] = "/search";
    });

    buttonify(button[2], (event) => {
        location["href"] = "/upload";
    });

    buttonify(button[3], (event) => {
        location["href"] = "/inbox";
    });

    buttonify(button[4], (event) => {
        location["href"] = "/settings";
    });

    switch (location["pathname"].split("/")[1]) {
        case "home":
            button[0].setAttribute("data-state", "active");

            break;
        case "search":
            button[1].setAttribute("data-state", "active");

            break;
        case "upload":
            button[2].setAttribute("data-state", "active");

            break;
        case "inbox":
            button[3].setAttribute("data-state", "active");

            break;
        case "settings":
            button[4].setAttribute("data-state", "active");

            break;
        case "profile":
            button[4].setAttribute("data-state", "active");

            break;
    }
};

/* StartingPoint */
(() => {
    init().catch(console.error);
})();