export default class Paginator {
    #page
    constructor(){
        this.#page = 1;
        this.max = 1;

        this.onPageChange = null;
    }
    next(){
        if(this.#page < this.max){
            this.page++;
        }
    }
    previous(){
        if(this.#page > 1){
            this.page--;
        }
    }
    first(){
        this.page = 1;
    }
    last(){
        this.page = this.max;
    }
    get page(){
        return this.#page;
    }
    set page(value){
        let changed = value != this.#page;
        this.#page = value;
        if(changed && this.onPageChange)
            this.onPageChange(this.#page);
    }
}