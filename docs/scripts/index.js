import { 
    HSMA,
    App,
    AppSettings
} from "./hsma.js";
import { UI, listenToNavLinks } from "./common.js";
import { PageNavigationAnimation } from "./nav.js";

addEventListener("load", async () => {
    let app = new App();
    window.app = app;
    let load = performance.now();
    app.settings = AppSettings.load();
    if(app.currentProfile.theme == "auto"){
        UI.startAutoTheme();
    }
    else {
        UI.setTheme(app.currentProfile.theme);
    }
    app.navigation.contentRoot = document.getElementById("app-page-frame");
    app.items = await HSMA.getSkyblockItems();
    if(!app.settings.disclaimerAccepted){
        document.getElementById("disclaimer-popup").style.display = "flex";
        document.getElementById("accept-disclaimer").addEventListener("click", e => {
            acceptDisclaimer();
        });
    }
    setTimeout(() => {
        if(app.settings.disclaimerAccepted){
            startup();
        }
        let splashScreen = document.getElementById("splash-screen");
        splashScreen.addEventListener("animationend", e => {
            // Firefox doesn't allow display:none on
            // end of animation in CSS so this is a fix
            splashScreen.style.display = "none";
        });
        splashScreen.className += " fly-away-gone";
    }, Math.max(0, 1000 - (performance.now() - load)));
});

function acceptDisclaimer(){
    window.app.settings.disclaimerAccepted = true;
    AppSettings.save(window.app.settings);
    let disclaimerPopup = document.getElementById("disclaimer-popup");
    disclaimerPopup.className += " fly-away-gone";
    disclaimerPopup.addEventListener("animationend", e => {
        disclaimerPopup.style.display = "none";
    });
    startup();
}

import HomePage from "./pages/home.js";
import NotFoundPage from "./pages/notfound.js";
import SettingsPage from "./pages/settings.js";
import BazaarHomePage from "./pages/bzhome.js";
import BazaarFlipTutorialPage from "./pages/bzfliptutorial.js";
import BazaarFlipExplorerPage from "./pages/bzflipexplorer.js";
import BazaarNPCFlipExplorerPage from "./pages/bznpcflipexplorer.js";

function startup(){
    app.navigation.backButton = document.getElementById("nav-back");
    app.navigation.forwardsButton = document.getElementById("nav-forwards");
    app.navigation.pageNameDisplay = document.getElementById("app-page-name");

    app.navigation.notFoundPage = NotFoundPage;
    app.navigation.registerPage("/", HomePage);
    app.navigation.registerPage("/bazaar", BazaarHomePage);
    app.navigation.registerPage("/bazaar/flip-explorer", BazaarFlipExplorerPage);
    app.navigation.registerPage("/bazaar/flip-tutorial", BazaarFlipTutorialPage);
    app.navigation.registerPage("/bazaar/npc-flip-explorer", BazaarNPCFlipExplorerPage);
    app.navigation.registerPage("/settings", SettingsPage);
    
    app.navigation.navigateToPath(new URL(location.href), { animation: PageNavigationAnimation.None });
    window.addEventListener("popstate", e => app.navigation.handlePopState(e));

    app.run();
    listenToNavLinks(app.navigation);

    hookupEvents();
}

function hookupEvents(){
    document.getElementById("navbar-bazaar-button").addEventListener("click", e => {
        app.navigation.navigateTo(new BazaarHomePage());
    });
    document.getElementById("navbar-home-button").addEventListener("click", e => {
        app.navigation.navigateTo(new HomePage());
    });
    document.getElementById("navbar-settings-button").addEventListener("click", e => {
        app.navigation.navigateTo(new SettingsPage());
    });
}