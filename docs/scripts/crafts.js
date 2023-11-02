import { SkyblockItem } from "./hsma.js";

export class CraftItem {
    constructor(id = null, amount = null, name = null){
        this.id = id;
        this.amount = amount;
        this.name = name??SkyblockItem.nameFromId(id);
        this.npcSellPrice = null;
    }
}

export class Craft {
    constructor(){
        this.inputItems = [];
        this.resultItems = [];
        this.npcSellPrice = null;
    }
    calculateMargin(bazaarItemList){
        // TODO
    }
}

function e(baseItem, result=null, amount=null){
    let craft = new Craft();
    craft.inputItems = [new CraftItem(baseItem, amount??160)];
    craft.outputItems = [new CraftItem(result??`ENCHANTED_${baseItem}`, 1)];
    return craft;
}

function eList(list){
    return list.map(item => e(item));
}

export class CraftList {
    constructor(){
        this.skyblockItems = null;
        this.crafts = [];
    }
    create(){
        if(!this.skyblockItems)
            throw "CraftList requires member skyblockItems to not be null before create is called";
        this.crafts = [
            ...eList([
                "COBBLESTONE",
                "HAY_BLOCK",
                "SEEDS"
            ])
        ];
        return this.crafts;
    }
}