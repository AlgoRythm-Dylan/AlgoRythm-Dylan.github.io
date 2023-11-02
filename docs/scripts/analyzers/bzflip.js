const HOURS_IN_WEEK = 168;

export function bazaarFlipAnalyze(bzItem, profile){
    let flipAnalysis = new BazaarFlipAnalysis();
    bzItem.analysis["flip"] = flipAnalysis;
    // The amount of money the player has available
    let budget = profile.bazaarConfig.flipConfig.budget ?? profile.bazaarConfig.budget;

    // If this item is not active on the market, then there's no need
    // to analyze it
    if(bzItem.buySummary.length === 0 || bzItem.sellSummary.length === 0){
        flipAnalysis.margin = 0;
        flipAnalysis.maxProfitPerHour = 0;
        return;
    }

    // Margin is the amount of coins you might be able to make
    flipAnalysis.margin = bzItem.topSellOrderPrice - bzItem.topBuyOrderPrice;
    // Bazaar tax on selling. Can be reduced through upgrades
    flipAnalysis.taxDeduction = flipAnalysis.margin * profile.bazaarConfig.taxRate;
    flipAnalysis.margin -= Math.floor(flipAnalysis.taxDeduction);
    flipAnalysis.taxDeduction = Math.round(flipAnalysis.taxDeduction * 100) / 100;
    // Price ratio describes the margin as a percentage
    flipAnalysis.priceRatio = bzItem.topSellOrderPrice / bzItem.topBuyOrderPrice;
    flipAnalysis.amountCanAfford = Math.floor(budget / bzItem.topBuyOrderPrice);
    
    flipAnalysis.buyItemsPerHour = Math.floor(bzItem.buyMovingWeek / HOURS_IN_WEEK);
    flipAnalysis.sellItemsPerHour = Math.floor(bzItem.sellMovingWeek / HOURS_IN_WEEK);
    flipAnalysis.maxVolume = Math.min(flipAnalysis.buyItemsPerHour,
                                      flipAnalysis.sellItemsPerHour,
                                      flipAnalysis.amountCanAfford);
    if(profile.bazaarConfig.flipConfig.workFilter.hasMax){
        flipAnalysis.maxVolume = Math.min(flipAnalysis.maxVolume, profile.bazaarConfig.flipConfig.workFilter.max);
    }

    flipAnalysis.maxProfitPerHour = Math.round(Math.max(0, flipAnalysis.margin * flipAnalysis.maxVolume));
}

export function meetsFlipFilterRequirements(bzItem, profile){
    if(!bzItem.analysis["flip"])
        throw "Item is not yet flip analyzed";
    let config = profile.bazaarConfig.flipConfig;
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
    if(config.priceRatioFilter.hasMin){
        if(bzItem.analysis["flip"].priceRatio < config.priceRatioFilter.min){
            return false;
        }
    }
    if(config.priceRatioFilter.hasMax){
        if(bzItem.analysis["flip"].priceRatio > config.priceRatioFilter.max){
            return false;
        }
    }
    return true;
}

export class BazaarFlipAnalysis {
    constructor(){
        this.margin = null;
        this.priceRatio = null;
        this.amountCanAfford = null;
        this.maxVolume = null;
        this.taxDeduction = null;
        this.buyItemsPerHour = null;
        this.sellItemsPerHour = null;
        this.maxProfitPerHour = null;
        this.rank = null;
    }
}