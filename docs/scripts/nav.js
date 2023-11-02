var historyId = 0;

export class NavigationHistory {
    constructor(page, options){
        this.page = page;
        this.options = options;
    }
}

export class Navigation {
    #backButton
    #forwardsButton
    #pageMapping
    constructor(){
        this.#backButton = null;
        this.#forwardsButton = null;
        this.#pageMapping = {};
        this.contentRoot = null;
        this.notFoundPage = null;
        this.pageNameDisplay = null;
        this.stack = [];
        this.forwardsStack = [];
        this.lastHistoryState = historyId;
    }
    registerPage(path, type){
        this.#pageMapping[path] = type;
    }
    navigateToPath(url, options={}){
        let animation = options.animation ?? PageNavigationAnimation.Forwards;
        if(url instanceof URL){
            url = url.pathname;
        }
        if(url.length != 1 && url.endsWith("/"))
            url = url.slice(0, -1);
        url = url.toLowerCase();
        let page = this.#pageMapping[url];
        if(!page) {
            if(!this.notFoundPage)
                throw "Could not find page and no notFoundPage set";
            else
                page = this.notFoundPage;
        }
        this.navigateTo(new page(), { animation });
    }
    navigateTo(page, options={}){
        let animation = options.animation ?? PageNavigationAnimation.Forwards;
        this.#buildPage(page);    
        this.contentRoot.appendChild(page.content);
        this.stack.push(new NavigationHistory(page, options));
        this.#updateWebpageComponents();
        this.#animatePage(page, animation);
        page.onNavigatedTo();
        if(this.stack.length > 1){
            if(animation == PageNavigationAnimation.None){
                this.#removeLastPageFromDOM();
            }
            else{
                let onEnd = () => {
                    this.#removeLastPageFromDOM();
                    page.content.removeEventListener("transitionend", onEnd);
                }
                page.content.addEventListener("transitionend", onEnd);
            }
        }
        this.forwardsStack = [];
        history.pushState(historyId++, page.title ?? "HSMA", page.pathName);
        this.lastHistoryState = historyId;
    }
    back(options={}){
        if(!this.canGoBack) return;
        let animation = options.animation ?? PageNavigationAnimation.Back;
        let lastEntry = this.stack[this.stack.length - 2];
        let lastPage = lastEntry.page;
        let currentEntry = this.stack.splice(this.stack.length - 1, 1)[0];
        let currentPage = currentEntry.page;
        this.#buildPage(lastPage);
        this.contentRoot.prepend(lastPage.content);
        this.#animatePage(lastPage, PageNavigationAnimation.None);
        this.#animatePage(currentPage, animation);
        lastPage.onNavigatedTo();
        this.forwardsStack.push(currentEntry);
        this.#updateWebpageComponents();
        if(animation == PageNavigationAnimation.None){
            currentPage.content.remove();
            currentPage.onNavigatedFrom();
        }
        else{
            let onEnd = () => {
                currentPage.content.remove();
                currentPage.onNavigatedFrom();
                currentPage.content.removeEventListener("transitionend", onEnd);
            }
            currentPage.content.addEventListener("transitionend", onEnd);
        }
    }
    forwards(options={}){
        if(!this.canGoForwards) return;
        let animation = options.animation ?? PageNavigationAnimation.Forwards;
        let nextEntry = this.forwardsStack.splice(this.forwardsStack.length - 1, 1)[0];
        let nextPage = nextEntry.page;
        this.#buildPage(nextPage);
        this.contentRoot.appendChild(nextPage.content);
        this.#animatePage(nextPage, animation);
        nextPage.onNavigatedTo();
        this.stack.push(nextEntry);
        this.#updateWebpageComponents();
        if(animation == PageNavigationAnimation.None){
            this.#removeLastPageFromDOM();
        }
        else{
            let onEnd = () => {
                this.#removeLastPageFromDOM();
                nextPage.content.removeEventListener("transitionend", onEnd);
            }
            nextPage.content.addEventListener("transitionend", onEnd);
        }
    }
    handlePopState(event){
        if(event.state > this.lastHistoryState){
            this.forwards();
        }
        else{
            this.back();
        }
        this.lastHistoryState = event.state;
    }
    #buildPage(page){
        let template = document.getElementById(page.templateId);
        if(!template){
            throw `Could not find page ${page.templateId}`;
        }
        let content = template.content.cloneNode(true);
        let container = document.createElement("div");
        container.className = "page-container";
        let controls = content.querySelectorAll("[data-name]");
        for(let control of controls){
            page.controls[control.getAttribute("data-name")] = control;
        }
        container.appendChild(content);
        page.content = container;
    }
    #animatePage(page, animation){
        // Set the beginning state of the animation
        if(animation == PageNavigationAnimation.Forwards){
            page.content.style.left = "20%";
            page.content.style.transform = "scale(0.9)";
        }
        else if(animation == PageNavigationAnimation.Back){
            page.content.style.left = "0%";
            page.content.style.transform = "scale(1)";
        }
        else if(animation == PageNavigationAnimation.None){
            page.content.style.opacity = "1";
        }
        // Inflate the element
        page.content.offsetWidth;
        // Set to the finished state of the animation
        if(animation == PageNavigationAnimation.Forwards){
            page.content.style.opacity = "1";
            page.content.style.left = "0px";
            page.content.style.transform = "scale(1)";
        }
        if(animation == PageNavigationAnimation.Back){
            page.content.style.opacity = "0";
            page.content.style.left = "20%";
            page.content.style.transform = "scale(0.9)";
        }
    }
    #removeLastPageFromDOM(){
        let lastPage = this.stack[this.stack.length - 2].page;
        if(lastPage.content){
            lastPage.content.remove();
            lastPage.onNavigatedFrom();
        }
    }
    #updateWebpageComponents(){
        if(this.stack.length == 0) return;
        let page = this.stack[this.stack.length - 1].page;
        if(page.title){
            document.title = `HSMA | ${page.title}`;
        }
        else {
            document.title = "Hypixel Skyblock Market Analyzer";
        }
        if(page.name && this.pageNameDisplay){
            this.pageNameDisplay.innerHTML = page.name;
        }
        else{
            this.pageNameDisplay.innerHTML = "";
        }
        if(this.stack.length > 1 && this.#backButton){
            this.#backButton.className = this.#backButton.className.replace(" nav-button-disabled", " nav-button-enabled");
        }
        else {
            if(this.#backButton && this.stack.length < 2){
                this.#backButton.className = this.#backButton.className.replace(" nav-button-enabled", " nav-button-disabled");
            }
        }
        if(this.forwardsStack.length > 0 && this.#forwardsButton){
            this.#forwardsButton.className = this.#forwardsButton.className.replace(" nav-button-disabled", " nav-button-enabled");
        }
        else {
            if(this.#forwardsButton && this.forwardsStack.length < 1){
                this.#forwardsButton.className = this.#forwardsButton.className.replace(" nav-button-enabled", " nav-button-disabled");
            }
        }
    }
    set backButton(value){
        this.#backButton = value;
        this.#backButton.addEventListener("click", e => {
            if(this.canGoBack){
                history.back();
            }
        });
    }
    get backButton(){
        return this.#backButton;
    }
    set forwardsButton(value){
        this.#forwardsButton = value;
        this.#forwardsButton.addEventListener("click", e => {
            if(this.canGoForwards){
                history.forward();
            }
        });
    }
    get forwardsButton(){
        return this.#forwardsButton;
    }    
    get currentPage(){
        if(this.stack.length > 0){
            return this.stack[this.stack.length - 1]
        }
        return null;
    }
    get canGoBack(){
        return this.stack.length > 1;
    }
    get canGoForwards(){
        return this.forwardsStack.length > 0;
    }
}

export const PageNavigationAnimation = {
    Default: 0,
    None: 1,
    Forwards: 2,
    Back: 3,
    NewPage: 4
}

export class Page {
    constructor(){
        this.name = null;
        this.pathName = null;
        this.title = null;
        this.templateId = null;
        this.content = null;
        this.controls = {};
        this.params = {};
    }
    // Virtual methods
    onNavigatedTo(){ }
    onNavigatedFrom(){ }
}