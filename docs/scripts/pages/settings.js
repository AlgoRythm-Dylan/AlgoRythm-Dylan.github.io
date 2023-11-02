import { Page } from "../nav.js";
import { UI } from "../common.js";

export default class SettingsPage extends Page {
    constructor(){
        super();
        this.templateId = "app-settings";
        this.title = "Settings";
        this.name = "Settings";
        this.pathName = "/settings";
    }
    onNavigatedTo(){
        this.controls.themeDropDown.value = app.currentProfile.theme;
        this.controls.themeDropDown.addEventListener("change", e => {
            let theme = this.controls.themeDropDown.value;
            app.currentProfile.theme = theme;
            app.save();
            if(theme == "auto"){
                UI.startAutoTheme();
            }
            else {
                UI.stopAutoTheme();
                UI.setTheme(theme);
            }
        });
    }
}