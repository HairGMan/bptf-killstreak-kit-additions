// ==UserScript==
// @name         Backpack.tf Killstreak Kit Additions
// @namespace    https://github.com/HairGMan
// @version      0.2
// @description  Adds stuff for easier browsing for killstreak items
// @author       HairGMan
// @match        https://backpack.tf/stats/*
// @iconURL      https://backpack.tf/images/440/Killstreak_Icon_Professional.png
// @homepageURL  https://github.com/HairGMan/bptf-killstreak-kit-additions
// @supportURL   https://github.com/HairGMan/bptf-killstreak-kit-additions/issues
// @downloadURL  https://github.com/HairGMan/bptf-killstreak-kit-additions/raw/master/bptf-killstreak-kit-addon-mainsrc.user.js
// @updateURL    https://github.com/HairGMan/bptf-killstreak-kit-additions/raw/master/bptf-killstreak-kit-addon-mainsrc.user.js
// @license      GNU GPL-3.0
// @grant        none
// ==/UserScript==

function trimSpaces(string){
    return string.replace(/^\s+/g, '').replace(/\s+$/g, '').replace(/\s+/g,"%20");
}

function appendKSToPath(tier,path,currentTier){
    const ksTierDict = {
            1 : "Killstreak%20",
            2 : "Specialized%20Killstreak%20",
            3 : "Professional%20Killstreak%20",
        }
    let splitPath = path.split("/");
    splitPath[3] = splitPath[3].replace(ksTierDict[currentTier],"");
    if(tier > 0){
        splitPath[3] = ksTierDict[tier].concat("",splitPath[3]);
    }
    let tieredPath = splitPath.join("/");
    return tieredPath;
}

class itemData{
    constructor(headerItem){
        this.name = headerItem.dataset.base_name;
        this.defindex = headerItem.dataset.defindex;
        this.killstreak_tier = headerItem.dataset.ks_tier ? headerItem.dataset.ks_tier : 0;
        this.aussie = headerItem.dataset.australium ? headerItem.dataset.australium : 0;
        this.slot = headerItem.dataset.slot ? headerItem.dataset.slot : "none";
        this.idreplacedict = {
            10 : 199,	// Shotgun
	    18 : 205,	// Rocket Launcher
	    23 : 209,	// Pistol
            13 : 200,	// Scattergun
            294 : 160,	// Lugermorph
            833 : 812,	// Flying Guillotine
            1071 : 264,	// Golden Frying Pan
            21 : 208,	// Flame Thrower
            30474 : 208,	// Nostromo Napalmer
            834 : 813,	// Neon Annihilator
            20 : 207,	// Stickybomb Launcher
            1 : 191,	// Bottle
            266 : 132,	// Headtaker
            15 : 202,	// Minigun
            832 : 811,	// Huo-Long Heater
            5 : 195,	// Fists
            169 : 197,	// Golden Wrench
            17 : 204,	// Syringe Gun
            29 : 211,	// Medi Gun
            8 : 198,	// Bonesaw
            14 : 201,	// Sniper Rifle
            16 : 203,	// SMG
            24 : 210,	// Revolver
            4 : 194,	// Knife
        }
        this.nameiddict = {
            "Shotgun" : 199,
	    "Rocket Launcher" : 205,
	    "Pistol": 209,
            "Scattergun" : 200,
            "Force-A-Nature" : 45,
            "Holy Mackerel" : 221,
            "Bat" : 190,
            "Rocket Launcher" : 205,
            "Black Box" : 228,
            "Shotgun" : 199,
            "Flame Thrower" : 208,
            "Backburner" : 40,
            "Flare Gun" : 39,
            "Axtinguisher" : 38,
            "Grenade Launcher" : 206,
            "Stickybomb Launcher" : 207,
            "Chargin' Targe" : 131,
            "Eyelander" : 132,
            "Minigun" : 202,
            "Gloves of Running Urgently" : 239,
            "Frontier Justice" : 141,
            "Crusader's Crossbow" : 305,
            "Medi Gun" : 211,
            "Bonesaw" : 198,
            "Ubersaw" : 37,
            "Sniper Rifle" : 201,
            "Huntsman" : 56,
            "SMG" : 203,
            "Revolver" : 210,
            "Ambassador" : 61,
            "Knife" : 194,
        }
    }

    getItemName(){
        let itemName = this.name;
        if(this.aussie == 1){
            itemName = "Australium".concat(" ", itemName);
        }
        return itemName;
    }

    getItemId(){
        let itemId;
        let itemName = this.name.match(/((?<=((Blood)|(Gold)|(Silver)|(Rust)|(Carbonado)|(Diamond)) Botkiller ).+(?= Mk.II?))|((?<=Festive ).+)/g); // Regex courtesy of Moder112
        if(itemName){
            this.defindex = this.nameiddict[itemName[0]];
            itemId = this.defindex;
            }
        else{
            let defindexInt = parseInt(this.defindex);
            if(this.idreplacedict.hasOwnProperty(defindexInt)){
                itemId = this.idreplacedict[defindexInt].toString();
            }
            else{
                itemId = this.defindex;
            }
        }
        return itemId;
    }

    getItemSlot(){
        let itemSlot;
        switch(this.slot){
            case "primary": case "secondary": case "melee": case "pda":
                itemSlot = 1;
                break;
            case "misc":
                itemSlot = 0;
                break;
            case "none":
                if(this.name == "Kit"){
                    itemSlot = -1;
                }
                else if(this.name == "Fabricator"){
                    itemSlot = -2;
                }
                else{
                    itemSlot = 0;
                }
                break;
        }
        return itemSlot;
    }

    getKillstreakTier(){
        return this.killstreak_tier;
    }
};

(function() {
    'use strict';
    const currentItem = new itemData(document.querySelector(".item"));
    let itemId = currentItem.getItemId();
    let killstreakTier = currentItem.getKillstreakTier();
    let currentPath = window.location.pathname;

    $(".stats-header-controls").append(`
     <br>
     <div class="btn-group btn-group-sm stats-killstreak-list" style="margin: 0 0 12px"></div>
     `);

    switch(currentItem.getItemSlot()){

        case 0:
            break;

        case -1: {

            let weaponName = trimSpaces(document.querySelector(".stats-breadcrumbs").children[1].innerHTML);
            let weaponDefIndex = window.location.pathname.match(/\d+$/g);

            $(".stats-killstreak-list").append(`
          <a class="btn btn-variety q-440-text-4" href="https://backpack.tf/stats/Unique/Killstreak%20Kit/Tradable/Non-Craftable/1-${weaponDefIndex}"> Basic </a>
     <a class="btn btn-variety q-440-text-7" href="https://backpack.tf/stats/Unique/Killstreak%20Kit/Tradable/Non-Craftable/2-${weaponDefIndex}"> Specialized </a>
     <a class="btn btn-variety q-440-text-11" href="https://backpack.tf/stats/Unique/Killstreak%20Kit/Tradable/Non-Craftable/3-${weaponDefIndex}"> Professional </a>
     `);
            document.querySelector(".stats-killstreak-list").children[killstreakTier-1].classList.add("active");
            if(killstreakTier > 1){
                $(".stats-header-controls").append(`
     <a class="btn btn-default" href="https://backpack.tf/stats/Unique/Fabricator/Tradable/Craftable/${6520 + 3 * (killstreakTier - 1)}-6-${weaponDefIndex}" style="margin: 0px 0px 12px;">
     <i class="fa fa-bar-chart"></i>
     Fabricator Stats
     </div>
     `);
            }

            $(".stats-header-controls").append(`
     <br>
     <div class="temp-weaponlist-div" style="margin: 0 0 12px">Loading applicable weapons...</div>
     `);
            $(".temp-weaponlist-div").load(`https://backpack.tf/overview/${weaponName} .overview-quality-list`,function(){
                for(let button of this.firstChild.children){
                    button.href = appendKSToPath(killstreakTier, button.getAttribute("href"), 0);
                }
                this.firstChild.classList.remove("overview-quality-list");
                this.firstChild.classList.remove("expanded");
                $(this.firstChild).append(`<a class="btn btn-variety" id="btn-expand-list">
                                          <i class="fa fa-ellipsis-h"></i>
                                          </a>`);
                this.outerHTML = this.innerHTML;
                $("#page-content").append(`<script>
    $('#btn-expand-list').click(function () {
        var $parent = $(this).parent();

        if ($parent.hasClass('expanded')) {
            $parent.removeClass('expanded');
        } else {
            $parent.addClass('expanded');
        }
    });
</script>`);
            });
            break;
        }

        case -2: {
            let weaponDefIndex = window.location.pathname.match(/\d+$/g);

            $(".stats-killstreak-list").append(`
     <a class="btn btn-variety q-440-text-7" href="https://backpack.tf/stats/Unique/Fabricator/Tradable/Craftable/6523-6-${weaponDefIndex}"> Specialized </a>
     <a class="btn btn-variety q-440-text-11" href="https://backpack.tf/stats/Unique/Fabricator/Tradable/Craftable/6526-6-${weaponDefIndex}"> Professional </a>
     `);
            document.querySelector(".stats-killstreak-list").children[killstreakTier-2].classList.add("active");
            $(".stats-header-controls").append(`
     <a class="btn btn-default" href="https://backpack.tf/stats/Unique/Killstreak%20Kit/Tradable/Non-Craftable/${killstreakTier}-${weaponDefIndex}" style="margin: 0px 0px 12px;">
     <i class="fa fa-bar-chart"></i>
     Kit Stats
     </div>
     `);
         break;
        }

        case 1: {

            $(".stats-killstreak-list").append(`
     <a class="btn btn-variety q-440-text-1" href="https://backpack.tf${appendKSToPath(0, currentPath, killstreakTier)}"> No Kit </a>
     <a class="btn btn-variety q-440-text-4" href="https://backpack.tf${appendKSToPath(1, currentPath, killstreakTier)}"> Basic </a>
     <a class="btn btn-variety q-440-text-7" href="https://backpack.tf${appendKSToPath(2, currentPath, killstreakTier)}"> Specialized </a>
     <a class="btn btn-variety q-440-text-11" href="https://backpack.tf${appendKSToPath(3, currentPath, killstreakTier)}"> Professional </a>
     `);
            document.querySelector(".stats-killstreak-list").children[killstreakTier].classList.add("active");
            if(killstreakTier > 0){
                $(".stats-header-controls").append(`
     <a class="btn btn-default" href="https://backpack.tf/stats/Unique/Killstreak%20Kit/Tradable/Non-Craftable/${killstreakTier}-${itemId}" style="margin: 0px 0px 12px;">
     <i class="fa fa-bar-chart"></i>
     Kit Stats
     </div>
     `);
            }
        }
    }
})();
