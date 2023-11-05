import { Page } from "../nav.js";
import FillGrid from "../fillgrid.js";

export default class BazaarNPCFlipExplorerPage extends Page {
    constructor(){
        super();
        this.templateId = "bazaar-npc-flip-explorer";
        this.title = "Bazaar NPC Flip Explorer";
        this.name = "Bazaar NPC Flip Explorer";
        this.pathName = "/bazaar/npc-flip-explorer";
        this.grid = new FillGrid();
        this.grid.onElementsCreated = () => this.render();
        this.grid.gridGap = 5;
        this.data = [];
        this.callback = data => {
            this.data = data;
            this.render();
        }
    }
    onNavigatedTo(){
        app.on("bazaar-npc-flip-analyzed", this.callback);
        console.log(this.controls.grid.offsetWidth);
        this.grid.parent = this.controls.grid;
        this.grid.observeParent();
        if(app.analyzedLists.bazaarFlip.length > 0){
            this.callback(app.analyzedLists.bazaarNPCFlip);
        }
    }
    onNavigatedFrom(){
        app.off("bazaar-npc-flip-analyzed", this.callback);
        this.grid.stopObservingParent();
    }
    render(){
        this.grid.maxElements = this.data.length;
        if(this.data.length == 0){
            return;
        }
        let max = Math.min(this.data.length, this.grid.elements.length);
        for(let i = 0; i < max; i++){
            let item = this.data[i];
            this.grid.elements[i].innerHTML = "";
            // Create containers
            let topContainer = document.createElement("div");
            topContainer.className = "bzfe-cell-top";
            this.grid.elements[i].appendChild(topContainer);
            let bottomContainer = document.createElement("div");
            bottomContainer.className = "bzfe-cell-bottom";
            this.grid.elements[i].appendChild(bottomContainer);
            // Name label
            let label = document.createElement("h3");
            label.innerHTML = item.name;
            topContainer.appendChild(label);
            // Quick-view flip label
            let priceLabel = document.createElement("p");
            priceLabel.innerHTML = `Buy <span class="text-accent">${item.analysis["NPCFlip"].maxVolume.toLocaleString()}</span> ` +
                                   `items at <span class="text-accent">${item.topBuyOrderPrice.toLocaleString({minimumFractionDigits: 1})}</span>, ` +
                                   `sell for <span class="text-accent">${item.npcSellPrice.toLocaleString({minimumFractionDigits: 1})}</span> ` + 
                                   `for possible profit of <span class="text-accent">${item.analysis["NPCFlip"].maxProfitPerHour.toLocaleString()}</span>`;
            bottomContainer.appendChild(priceLabel);
        }
    }
}