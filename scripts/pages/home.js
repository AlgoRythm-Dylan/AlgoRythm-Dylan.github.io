import { Page } from "../nav.js";
import BazaarFlipExplorerPage from "./bzflipexplorer.js";

export default class HomePage extends Page {
    constructor(){
        super();
        this.templateId = "home-page";
        this.title = "Home";
        this.name = "Home";
        this.pathName = "/";
    }
    onNavigatedTo(){
        this.controls.navButton.addEventListener("click", e => {
            app.navigation.navigateTo(new BazaarFlipExplorerPage())
        });
    }
}