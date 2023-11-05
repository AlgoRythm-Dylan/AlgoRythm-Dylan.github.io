import { Page } from "../nav.js";

export default class NotFoundPage extends Page {
    constructor(){
        super();
        this.templateId = "notfound";
        this.title = "Page Not Found";
        this.name = "Page Not Found";
    }
}