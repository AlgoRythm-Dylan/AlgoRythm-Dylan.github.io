const HOURS_IN_WEEK = 168;

export function bazaarNPCFlipAnalyze(bzItem, profile){
    let flipAnalysis = new BazaarNPCFlipAnalysis();
    bzItem.analysis["NPCFlip"] = flipAnalysis;

    let budget = profile.bazaarConfig.NPCFlipConfig.budget ?? profile.bazaarConfig.budget;

    if(!bzItem.npcSellPrice){
        flipAnalysis.margin = 0;
        flipAnalysis.maxProfitPerHour = 0;
        return;
    }
    flipAnalysis.margin = Math.round(10 * Math.max(0, bzItem.npcSellPrice - bzItem.topSellOrderPrice)) / 10;
    let itemsCanAfford = Math.floor(budget / bzItem.topSellOrderPrice);
    let canBuyPerHour = Math.floor(bzItem.buyMovingWeek / HOURS_IN_WEEK);
    flipAnalysis.maxVolume = Math.min(itemsCanAfford, canBuyPerHour);
    if(profile.bazaarConfig.NPCFlipConfig.workFilter.hasMax){
        flipAnalysis.maxVolume = Math.min(flipAnalysis.maxVolume, profile.bazaarConfig.NPCFlipConfig.workFilter.max);
    }
    flipAnalysis.maxProfitPerHour = flipAnalysis.maxVolume * flipAnalysis.margin;
}

export function meetsNPCFlipFilterRequirements(bzItem, profile){
    if(!bzItem.analysis["NPCFlip"])
        throw "Item is not yet NPC flip analyzed";
    let config = profile.bazaarConfig.NPCFlipConfig;
    if(config.volumeFilter.hasMin){
        if(bzItem.buyMovingWeek < config.volumeFilter.min ||
            bzItem.sellMovingWeek < config.volumeFilter.min){
            return false;
        }
    }
    if(config.volumeFilter.hasMax){
        if(bzItem.buyMovingWeek > config.volumeFilter.max ||
            bzItem.sellMovingWeek > config.volumeFilter.max){
             return false;
         }
    }
    if(config.marginFilter.hasMin){
        if(bzItem.analysis["NPCFlip"].margin < config.marginFilter.min){
            return false;
        }
    }
    if(config.marginFilter.hasMax){
        if(bzItem.analysis["NPCFlip"].margin > config.marginFilter.max){
            return false;
        }
    }
    return true;
}

export class BazaarNPCFlipAnalysis {
    constructor(){
        this.margin = null;
        this.maxProfitPerHour = null;
        this.maxVolume = null;
        this.rank = null;
    }
}