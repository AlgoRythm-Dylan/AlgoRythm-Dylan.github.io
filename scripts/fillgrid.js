/*
    Using elementWidth as a minimum, this class
    will try to fit as many as possible into the
    given space. Any additional space will be
    evenly distributed to the existing elements,
    allowing them to stretch above (for example)
    350 px, but as soon as the extra space is larger
    than 350px, another element is inserted.
*/

export default class FillGrid {
    #maxElements
    #parent
    constructor(parent){
        this.#parent = parent;
        if(parent)
            this.observeParent();
        this.elements = [];
        this.elementWidth = 350;
        this.elementHeight = 75;
        this.gridGap = 1;
        this.rows = null;
        this.columns = null;
        this.onElementsCreated = null;

        this.actualElementWidth = null;
        this.actualElementHeight = null;
        this.#maxElements = null;
        this.elementClassList = "fill-grid-cell";
        this.observer = new ResizeObserver(() => {
            this.render();
        });
    }
    observeParent(){
        this.observer.observe(this.parent);
    }
    stopObservingParent(){
        this.observer.unobserve(this.parent);
    }
    render(){
        let dimensionsChanged = this.#calculateDimensions();
        if(dimensionsChanged){
            this.parent.innerHTML = "";
            this.#createElements();
        }
        this.#positionElements();
    }
    #calculateDimensions(){
        // First, find out how many elements can fit.
        // Next, try to fit the gaps in. Keep sacrificing
        // elements until they fit in a loop. Realistically
        // should not need to loop more than once.
        let parentWidth = this.parent.offsetWidth;
        let parentHeight = this.parent.offsetHeight;
        let columns = Math.floor(parentWidth / this.elementWidth);
        let rows = Math.floor(parentHeight / this.elementHeight);
        let totalColumnSpacing = this.gridGap * Math.max(0, columns - 1);
        let totalRowSpacing = this.gridGap * Math.max(0, rows - 1);
        // Back off the # of columns
        while((columns * this.elementWidth) + totalColumnSpacing > parentWidth){
            columns--;
            totalColumnSpacing = this.gridGap * Math.max(0, columns - 1);
        }
        // Back off the # of rows
        while((rows * this.elementHeight) + totalRowSpacing > parentHeight){
            rows--;
            totalRowSpacing = this.gridGap * Math.max(0, rows - 1);
        }
        this.actualElementWidth = (parentWidth - totalColumnSpacing) / columns;
        this.actualElementHeight = (parentHeight - totalRowSpacing) / rows;
        let dimensionsChanged = columns != this.columns || rows != this.rows;
        this.columns = columns;
        this.rows = rows;
        return dimensionsChanged;
    }
    #createElements(){
        this.elements = [];
        let max = this.rows * this.columns;
        if(this.maxElements !== null){
            max = Math.min(max, this.maxElements);
        }
        for(let i = 0; i < max; i++){
            let element = document.createElement("div");
            element.className = this.elementClassList;
            this.elements.push(element);
            this.parent.appendChild(element);
        }
        if(this.onElementsCreated)
            this.onElementsCreated(this);
    }
    #positionElements(){
        if(this.elements.length == 0) return;
        let max = this.rows * this.columns;
        if(this.maxElements !== null){
            max = Math.min(max, this.maxElements);
        }
        for(let i = 0; i < max; i++){
            let row = Math.floor(i / this.columns);
            let column = i % this.columns;
            let xPos = this.actualElementWidth * column + (column * this.gridGap);
            let yPos = this.actualElementHeight * row + (row * this.gridGap);
            let element = this.elements[i];
            element.style.left = `${xPos}px`;
            element.style.top = `${yPos}px`;
            element.style.width = `${this.actualElementWidth}px`;
            element.style.height = `${this.actualElementHeight}px`;
        }
    }
    set maxElements(value){
        this.#maxElements = value;
        this.render();
    }
    get maxElements(){
        return this.#maxElements;
    }
    get parent(){
        return this.#parent;
    }
    set parent(value){
        this.#parent = value;
        this.render();
    }
}