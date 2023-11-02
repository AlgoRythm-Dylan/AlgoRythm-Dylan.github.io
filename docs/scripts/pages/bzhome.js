import { Page } from "../nav.js";

export default class BazaarHomePage extends Page {
    constructor(){
        super();
        this.templateId = "bazaar-home";
        this.title = "The Bazaar";
        this.name = "The Bazaar";
        this.pathName = "/bazaar";
    }
}