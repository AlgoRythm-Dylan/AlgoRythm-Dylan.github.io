import * as BZFlip from "./analyzers/bzflip.js";
import * as BZNPCFlip from "./analyzers/bznpcflip.js";
import { Timer, EventEmitter, Range, initcap, romanNumeral } from "./common.js";
import { Navigation } from "./nav.js";

const API_URL = "https://api.hypixel.net/"

export class HSMA {
    static async getSkyblockItems(){
        let url = `${API_URL}resources/skyblock/items`;
        let response = await fetch(url);
        let data = await response.json();
        let responseItems = data.items;
        let items = [];
        for(let responseItem of responseItems){
            items.push(SkyblockItem.fromAPIData(responseItem));
        }
        return items;
    }
    static async getBazaar(){
        let url = `${API_URL}skyblock/bazaar`;
        let response = await fetch(url);
        let data = await response.json();
        let products = data.products;
        let items = [];
        for(let value of Object.values(products)){
            items.push(BazaarItem.fromAPIData(value));
        }
        return items;
    }
}

export class SkyblockItem {
    constructor(){
        this.id = null;
        this.category = null;
        this.material = null;
        this.name = null;
        this.npcSellPrice = null;
        this.tier = null;
        this.unstackable = false;
        this.museum = false;
    }
    static fromAPIData(data){
        let item = new SkyblockItem();
        item.id = data.id;
        item.category = data.category;
        item.material = data.material;
        item.name = data.name.replace(/§./g, "");
        item.npcSellPrice = data.npc_sell_price;
        item.tier = data.tier ?? "COMMON";
        item.unstackable = data.unstackable ?? false;
        item.museum = data.museum ?? false;
        return item;
    }
    static nameFromId(id){
        // Try to convert the current ID to a string name
        let printableName = id.replace(/_/g, " ");
        printableName = printableName.replace(/§./g, "");
        printableName = initcap(printableName);
        // Things like dragon essence are ESSENCE_DRAGON so they
        // need to be reversed
        if(id.startsWith("ESSENCE_")){
            printableName = printableName.split(" ").reverse().join(" ");
        }
        // Enchantments don't have corresponding items, and the
        // ID is almmost printable as-is, but need some extra love
        else if(id.startsWith("ENCHANTMENT_")){
            let level = id.substring(id.lastIndexOf("_") + 1);
            let romanNumeralStr = romanNumeral(level);
            printableName = printableName.replace("Enchantment ", "");
            printableName = printableName.replace(level, romanNumeralStr);
        }
        return printableName;
    }
}

export class BazaarItem extends SkyblockItem {
    constructor(){
        super();
        this.buyOrders = null;
        this.sellOrders = null;
        this.buyVolume = null;
        this.sellVolume = null;
        this.buyMovingWeek = null;
        this.sellMovingWeek = null;
        this.buySummary = [];
        this.sellSummary = [];
        this.analysis = {};
        this.rank = null;
    }
    loadItemData(itemList){
        let item = null;
        for(let currentItem of itemList){
            if(currentItem.id == this.id){
                item = currentItem;
                break;
            }
        }
        if(item){
            this.npcSellPrice = item.npcSellPrice;
            this.name = item.name.replace(/§./g, "");
            this.category = item.category;
            this.tier = item.tier;
            this.unstackable = item.unstackable;
            this.museum = item.museum;
            this.material = item.material ?? "COMMON";
        }
        else {
            this.name = SkyblockItem.nameFromId(this.id);
        }
    }
    get topSellOrderPrice(){
        return this.buySummary[0]?.pricePerUnit??0;
    }
    get topBuyOrderPrice(){
        return this.sellSummary[0]?.pricePerUnit??0;
    }
    static fromAPIData(data){
        let item = new BazaarItem();
        item.id = data.product_id;
        item.buyOrders = data.quick_status.buyOrders;
        item.sellOrders = data.quick_status.sellOrders;
        item.buyVolume = data.quick_status.buyVolume;
        item.sellVolume = data.quick_status.sellVolume;
        item.buyMovingWeek = data.quick_status.buyMovingWeek;
        item.sellMovingWeek = data.quick_status.sellMovingWeek;
        item.buySummary = data.buy_summary??[];
        item.sellSummary = data.sell_summary??[];
        return item;
    }
}

export class Profile {
    constructor(){
        this.id = null;
        this.name = null;
        this.bazaarConfig = null;
        this.theme = "auto";
    }
    static default(){
        let profile = new Profile();
        profile.id = crypto.randomUUID();
        profile.name = "Default";
        profile.bazaarConfig = new BazaarConfiguration();
        return profile;
    }
    static fromData(data){
        let profile = new Profile();
        profile.id = data.id;
        profile.name = data.name;
        profile.theme = data.theme;
        profile.bazaarConfig = BazaarConfiguration.fromData(data.bazaarConfig);
        return profile;
    }
}

export class BazaarFlipperConfiguration {
    constructor(){
        // Budget allocated specifically for flipping
        this.budget = null;
        this.volumeFilter = new Range(1_000_000, -1);
        this.priceRatioFilter = new Range(-1, 20);
        // work filter: the amount of work which needs to be
        // done by the user (amt. of product which needs to be
        // flipped for the profits to be realized). This is to
        // limit high-volume, small margin work (such as 5
        // coins each, but 50k flips required) (measurement per hour)
        this.workFilter = new Range(-1, 15_000);
    }
    static fromData(data){
        let config = new BazaarFlipperConfiguration();
        if(!data) return config;
        config.budget = data.budget ?? this.budget;
        config.volumeFilter = Range.fromData(data.volumeFilter) ?? this.volumeFilter;
        config.priceRatioFilter = Range.fromData(data.priceRatioFilter) ?? this.priceRatioFilter;
        config.workFilter = Range.fromData(data.workFilter) ?? this.workFilter;
        return config;
    }
}

export class BazaarNPCFlipperConfiguration {
    constructor(){
        this.budget = null;
        this.volumeFilter = new Range(750_000, -1);
        this.marginFilter = new Range(1, -1);
        this.workFilter = new Range(-1, 15_000);
    }
    static fromData(data){
        let config = new BazaarNPCFlipperConfiguration();
        if(!data) return config;
        config.budget = data.budget ?? this.budget;
        config.volumeFilter = Range.fromData(data.volumeFilter) ?? this.volumeFilter;
        config.marginFilter = Range.fromData(data.marginFilter) ?? this.marginFilter;
        return config;
    }
}

export class BazaarConfiguration {
    constructor(){
        this.taxRate = 0.0125;
        this.budget = 1_000_000;
        this.flipConfig = new BazaarFlipperConfiguration();
        this.NPCFlipConfig = new BazaarNPCFlipperConfiguration();
        this.fetchDelay = 60_000; // 60 seconds
    }
    static fromData(data){
        let config = new BazaarConfiguration();
        if(!data) return config;
        config.taxRate = data.taxRate ?? this.taxRate;
        config.budget = data.budget ?? this.budget;
        config.flipConfig = BazaarFlipperConfiguration.fromData(data.flipConfig) ?? this.flipConfig;
        config.NPCFlipConfig = BazaarNPCFlipperConfiguration.fromData(data.NPCFlipConfig) ?? this.NPCFlipConfig;
        return config;
    }
}

export class AppSettings {
    constructor(){
        this.selectedProfile = null;
        this.profiles = [];
        this.disclaimerAccepted = false;
    }
    static load(){
        let settings = new AppSettings();
        let storedValue = localStorage.getItem("appSettings");
        if(!storedValue){
            let defaultProfile = Profile.default();
            settings.profiles.push(defaultProfile);
            settings.selectedProfile = defaultProfile.id;
            // Had to create a new settings object, so just go ahead and save it
            AppSettings.save(settings);
        }
        else{
            let data = JSON.parse(storedValue);
            settings.selectedProfile = data.selectedProfile;
            for(let dataProfile of data.profiles){
                settings.profiles.push(Profile.fromData(dataProfile));
            }
            settings.disclaimerAccepted = data.disclaimerAccepted;
        }
        return settings;
    }
    static save(settings){
        localStorage.setItem("appSettings", JSON.stringify(settings));
    }
}

export class App extends EventEmitter {
    constructor(){
        super();
        this.settings = null;
        this.items = null;
        this.navigation = new Navigation();
        this.bazaarFetcher = new BazaarFetcher();
        this.analyzedLists = {
            bazaarFlip: [],
            bazaarNPCFlip: []
        };
        this.bazaarFetcher.on("bazaar-fetched", data => {
            this.analyzedLists.bazaarFlip = [];
            this.analyzedLists.bazaarNPCFlip = [];
            let profile = this.currentProfile;
            // Analyze and filter items
            for(let item of data){
                item.loadItemData(this.items);
                BZFlip.bazaarFlipAnalyze(item, profile);
                BZNPCFlip.bazaarNPCFlipAnalyze(item, profile);
                if(BZFlip.meetsFlipFilterRequirements(item, profile)){
                    this.analyzedLists.bazaarFlip.push(item);
                }
                if(BZNPCFlip.meetsNPCFlipFilterRequirements(item, profile)){
                    this.analyzedLists.bazaarNPCFlip.push(item);
                }
            }
            // Sort
            this.analyzedLists.bazaarFlip.sort(
                (a, b) => b.analysis["flip"].maxProfitPerHour - a.analysis["flip"].maxProfitPerHour);
            this.analyzedLists.bazaarNPCFlip.sort(
                (a, b) => b.analysis["NPCFlip"].maxProfitPerHour - a.analysis["NPCFlip"].maxProfitPerHour);
            // Rank
            for(let i = 0; i < this.analyzedLists.bazaarFlip.length; i++){
                let item = this.analyzedLists.bazaarFlip[i];
                item.analysis["flip"].rank = i + 1;
            }
            for(let i = 0; i < this.analyzedLists.bazaarNPCFlip.length; i++){
                let item = this.analyzedLists.bazaarNPCFlip[i];
                item.analysis["NPCFlip"].rank = i + 1;
            }
            this.emit("bazaar-fetched", data);
            this.emit("bazaar-flip-analyzed", this.analyzedLists.bazaarFlip);
            this.emit("bazaar-npc-flip-analyzed", this.analyzedLists.bazaarNPCFlip);
        });
    }
    run(){
        this.bazaarFetcher.timer.timeout = this.currentProfile.bazaarConfig.fetchDelay;
        this.bazaarFetcher.fetch();
        this.bazaarFetcher.timer.start();
    }
    get currentProfile(){
        for(let profile of this.settings.profiles){
            if(profile.id === this.settings.selectedProfile){
                return profile;
            }
        }
        return this.settings.profiles[0];
    }
    save(){
        AppSettings.save(this.settings);
    }
}

export class BazaarFetcher extends EventEmitter {
    constructor(delay=60_000){
        super();
        this.lastFetch = null;
        this.lastFetchTimestamp = null;
        this.timer = new Timer(() => this.fetch(), delay);
    }
    async fetch(){
        this.lastFetch = await HSMA.getBazaar();
        this.lastFetchTimestamp = new Date();
        this.emit("bazaar-fetched", this.lastFetch);
    }
}