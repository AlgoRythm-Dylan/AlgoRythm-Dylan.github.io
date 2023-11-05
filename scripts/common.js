const USER_DARK_THEME_QUERY = "(prefers-color-scheme: dark)";
var autoThemeMediaMatcher = null;

export class UI {
    static setTheme(name){
        document.body.setAttribute("theme", name??"light");
    }
    static startAutoTheme(){
        UI.setTheme(window.matchMedia(USER_DARK_THEME_QUERY).matches ? "dark" : "light");
        autoThemeMediaMatcher = window.matchMedia(USER_DARK_THEME_QUERY);
        autoThemeMediaMatcher.addEventListener("change", UI.handleSystemThemeChange);
    }
    static handleThemeChange(e){
        UI.setTheme(e.matches ? "dark" : "light");
    }
    static stopAutoTheme(){
        if(autoThemeMediaMatcher !== null){
            autoThemeMediaMatcher.removeEventListener("change", UI.handleSystemThemeChange);
        }
    }
}

export const TimerState = {
    Running: 0,
    Stopped: 1,
    Paused: 2,
    Resumed: 3
};

export class Timer {
    #timer
    #lastExecution
    #resumeTime
    constructor(ontick = null, timeout = 1000){
        this.onTick = ontick;
        this.timeout = timeout;
        this.#timer = null;
        this.#lastExecution = null;
        this.#resumeTime = null;
        this.state = TimerState.Stopped;
    }
    #setup(){
        if(this.onTick){
            this.state = TimerState.Running;
            this.#timer = setInterval(() => this.#execute(), this.timeout);
        }
        else{
            this.state = TimerState.Stopped;
        }
    }
    #execute(){
        this.#lastExecution = performance.now();
        try {
            this.onTick();
        }
        catch(ex){
            this.stop();
            console.error("Error in timer, timer has stopped");
            console.error(ex);
        }
    }
    stop(){
        if(this.state === TimerState.Running)
            clearInterval(this.#timer);
        else if(this.state === TimerState.Resumed)
            clearTimeout(this.#timer);
        this.state = TimerState.Stopped;
    }
    pause(){
        this.#resumeTime = this.timeToNextExecution;
        this.stop();
        this.state = TimerState.Paused;
    }
    resume(){
        this.state = TimerState.Resumed;
        this.#timer = setTimeout(() => {
            this.#execute();
            this.#setup();
        }, this.#resumeTime);
    }
    start(){
        if(this.state === TimerState.Paused){
            this.resume();
        }
        else{
            this.#setup();
        }
    }
    get timeToNextExecution(){
        if(this.#lastExecution === null){
            return this.timeout;
        }
        else{
            return Math.max(0, this.timeout + this.#lastExecution - performance.now());
        }
    }
}

export class Range {
    constructor(min = 0, max = 0){
        this.min = min;
        this.max = max;
    }
    get hasMin(){
        return this.min != -1 && this.min != null;
    }
    get hasMax(){
        return this.max != -1 && this.max != null;
    }
    static fromData(data){
        if(!data)
            return null;
        return new Range(data.min, data.max);
    }
}

export class EventEmitter {
    #events
    constructor(){
        this.#events = {};
    }
    on(eventName, callback){
        let subscribers = this.#events[eventName];
        if(subscribers){
            subscribers.push(callback);
        }
        else{
            this.#events[eventName] = [callback];
        }
    }
    off(eventName, callback){
        let subscribers = this.#events[eventName];
        if(subscribers){
            subscribers.splice(subscribers.indexOf(callback), 1);
        }
    }
    emit(eventName, data){
        let subscribers = this.#events[eventName];
        if(subscribers){
            for(let subscriber of subscribers){
                subscriber(data);
            }
        }
    }
}

export function initcap(str){
    return str.split(" ")
              .map(word => `${word.substring(0, 1).toUpperCase()}${word.substring(1).toLowerCase()}`)
              .join(" ");
}

// Not worrying about roman numerals above X so
// this lazy implementation works fine
export function romanNumeral(str){
    return {
        "1": "I",
        "2": "II",
        "3": "III",
        "4": "IV",
        "5": "V",
        "6": "VI",
        "7": "VII",
        "8": "VIII",
        "9": "IX",
        "10": "X"
    }[str] ?? str;
}

export function cloneTemplate(templateId){
    let template = document.getElementById(templateId);
    if(!template){
        throw `Could not find template ${templateId}`;
    }
    return template.content.cloneNode(true);
}

export function listenToNavLinks(nav){
    addEventListener("click", e => {
        if(e.target.tagName.toLowerCase() === "a" && e.target.getAttribute("nav-link") === "true"){
            e.preventDefault();
            e.stopPropagation();
            nav.navigateToPath(new URL(e.target.href));
        }
    });
}