// ==UserScript==
// @name         Backpack.tf Killstreak Kit Additions
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds stuff for easier browsing for killstreak items
// @author       HairGMan
// @match        https://backpack.tf/stats/*
// @iconURL      https://backpack.tf/images/440/Killstreak_Icon_Professional.png
// @homepageURL  https://github.com/HairGMan/bptf-killstreak-kit-additions
// @supportURL   https://github.com/HairGMan/bptf-killstreak-kit-additions/issues
// @downloadURL  https://github.com/HairGMan/bptf-killstreak-kit-additions/raw/master/bptf-killstreak-kit-addon-mainsrc.js
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
            13 : 200,
            799 : 200,
            808 : 200,
            888 : 200,
            897 : 200,
            906 : 200,
            915 : 200,
            964 : 200,
            973 : 200,
            1078 : 45,
            294 : 160,
            833 : 812,
            660 : 190,
            999 : 221,
            658 : 205,
            800 : 205,
            809 : 205,
            889 : 205,
            898 : 205,
            907 : 205,
            916 : 205,
            965 : 205,
            974 : 205,
            1085 : 228,
            1141 : 199,
            1071 : 264,
            21 : 208,
            659 : 208,
            798 : 208,
            807 : 208,
            887 : 208,
            896 : 208,
            905 : 208,
            914 : 208,
            963 : 208,
            972 : 208,
            1146 : 40,
            30474 : 208,
            1081 : 39,
            1141 : 199,
            834 : 813,
            1000 : 38,
            1007 : 206,
            20 : 207,
            661 : 207,
            797 : 207,
            806 : 207,
            886 : 207,
            895 : 207,
            904 : 207,
            913 : 207,
            962 : 207,
            971 : 207,
            1144 : 131,
            1 : 191,
            266 : 132,
            1082 : 132,
            15 : 202,
            654 : 202,
            793 : 202,
            802 : 202,
            832 : 811,
            882 : 202,
            891 : 202,
            900 : 202,
            909 : 202,
            958 : 202,
            967 : 202,
            5 : 195,
            1004 : 141,
            1086 : 140,
            30668 : 140,
            169 : 197,
            662 : 197,
            795 : 197,
            804 : 197,
            884 : 197,
            893 : 197,
            902 : 197,
            911 : 197,
            960 : 197,
            969 : 197,
            17 : 204,
            1079 : 305,
            29 : 211,
            663 : 211,
            796 : 211,
            805 : 211,
            885 : 211,
            894 : 211,
            903 : 211,
            912 : 211,
            961 : 211,
            970 : 211,
            8 : 198,
            1003 : 37,
            1143 : 198,
            14 : 201,
            664 : 201,
            792 : 201,
            801 : 201,
            881 : 201,
            890 : 201,
            899 : 201,
            908 : 201,
            957 : 201,
            966 : 201,
            1005 : 56,
            16 : 203,
            1149 : 203,
            24 : 210,
            1006 : 61,
            1142 : 210,
            4 : 194,
            665 : 194,
            794 : 194,
            803 : 194,
            883 : 194,
            892 : 194,
            901 : 194,
            910 : 194,
            959 : 194,
            968 : 194
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
        let defindexInt = parseInt(this.defindex);
        if(this.idreplacedict.hasOwnProperty(defindexInt)){
            itemId = this.idreplacedict[defindexInt].toString();
        }
        else{
            itemId = this.defindex;
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