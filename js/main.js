"use strict";
// variables for local storage
const prefix = "kra1488-";
const visionKey = prefix + "vision";
const nationKey = prefix + "nation";
const weaponKey = prefix + "weapon";
const rarityKey = prefix + "rarity";
const numberKey = prefix + "number";
const storedVision = localStorage.getItem(visionKey);
const storedNation = localStorage.getItem(nationKey);
const storedWeapon = localStorage.getItem(weaponKey);
const storedRarity = localStorage.getItem(rarityKey);
const storedNumber = localStorage.getItem(numberKey);

// different dropdown menus
let visionMenu;
let nationMenu;
let weaponMenu;
let rarityMenu;
let sortButtons;

// set default
let vision = "any";
let nation = "any";
let weapon = "any";
let rarity = "any";
let selectedSort = "AtoZ";

// set api url
const SERVICE_URL = "https://genshin.jmp.blue/characters/";

// array of characters
const allCharas = Array(56).fill(null);

window.onload = (e) => {
    // load charas into array
    loadCharas(SERVICE_URL);

    sortButtons = document.querySelectorAll("input[name='sortBtn']");
    document.querySelector("#search").onclick = printChara;
    document.querySelector("#reset").onclick = resetFilter;

    visionMenu = document.querySelector("#vision");
    nationMenu = document.querySelector("#nation");
    weaponMenu = document.querySelector("#weapon");
    rarityMenu = document.querySelector("#rarity");

    // take stored values if any
    if (storedVision) {
        visionMenu.querySelector(`option[value="${storedVision}"]`).selected = true;
        vision = storedVision;
    }
    if (storedNation) {
        nationMenu.querySelector(`option[value="${storedNation}"]`).selected = true;
        nation = storedNation;
    }
    if (storedWeapon) {
        weaponMenu.querySelector(`option[value="${storedWeapon}"]`).selected = true;
        weapon = storedWeapon;
    }
    if (storedRarity) {
        rarityMenu.querySelector(`option[value="${storedRarity}"]`).selected = true;
        rarity = storedRarity;
    }

    // set storage valus on changes
    visionMenu.addEventListener("change", () => {
        vision = visionMenu.value;
        localStorage.setItem(visionKey, vision);
    })
    nationMenu.addEventListener("change", () => {
        nation = nationMenu.value;
        localStorage.setItem(nationKey, nation);
    })
    weaponMenu.addEventListener("change", () => {
        weapon = weaponMenu.value;
        localStorage.setItem(weaponKey, weapon);
    })
    rarityMenu.addEventListener("change", () => {
        rarity = rarityMenu.value;
        localStorage.setItem(rarityKey, rarity);
    })
}

// load characters
function loadCharas(url) {
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoaded;
    xhr.onerror = dataError;
    xhr.open("GET", url);
    xhr.send();
}

let dataLoaded = (e) => {
    // make e.target the xhr object
    let xhr = e.target;

    // log JSON file
    console.log(xhr.responseText);

    // Make the text a parsable JavasScript object
    let obj = JSON.parse(xhr.responseText);

    // If there are no results, let the user know
    if (!obj || obj.length == 0) {
        document.querySelector("#content").innerHTML = "<p><i>No results!</p>";
        return;
    }

    // If there is an array of results, loop through them
    let results = obj;

    // load data for each character
    for (let element of results) {
        let xhrChara = new XMLHttpRequest();
        xhrChara.onload = () => { parseCharaData(xhrChara, results.indexOf(element), element); };

        let term = element;
        term = term.trim();
        term = encodeURIComponent(term);
        let newURL = SERVICE_URL + element;

        xhrChara.onerror = dataError;
        xhrChara.open("GET", newURL);
        xhrChara.send();
    }
}

let dataError = (e) => {
    console.log("error occurred");
}

// create data for each character and put into array
function parseCharaData(xhrChara, index, element) {
    let charaData = JSON.parse(xhrChara.responseText);

    let chara = {
        name: charaData.name,
        title: charaData.title,
        vision: charaData.vision,
        weapon: charaData.weapon,
        nation: charaData.nation,
        rarity: charaData.rarity,
        description: charaData.description,
        portrait: SERVICE_URL + element + "/card"
    }

    allCharas.splice(index, 1, chara);
}

// prrint results
function printChara() {
    // check radio buttons
    for (const sortBtn of sortButtons) {
        if (sortBtn.checked) {
            selectedSort = sortBtn.value;
            break;
        }
    }

    document.querySelector("#status").innerHTML = "Searching...";

    // if statement for alphabetical or reverse
    if (selectedSort == "AtoZ") {
        buildResults(allCharas);
    }
    else if (selectedSort == "ZtoA") {
        // create new array for reversed characters
        let reverseCharas = allCharas.slice().reverse();
        buildResults(reverseCharas);
    }
}

// function to build results
function buildResults(array) {
    let bigString = "<div class=allResults-grid>";
    let line = "";
    let totalCount = 0;

    for (let character of array) {
        // continue if do not match filters
        if ((vision != (character.vision).toLowerCase() && vision != "any") ||
            (nation != (character.nation).toLowerCase() && nation != "any") ||
            (rarity != character.rarity && rarity != "any") ||
            (weapon != (character.weapon).toLowerCase() && weapon != "any")) {
            continue;
        }

        line = "<div class='info-grid'>";
        line += `<div id='card'><img src='${character.portrait}' alt='Card for ${(character.name)}'/></div>`;
        line += `<div id='info'><div id='name'>${character.name}</div>`;

        // if title is null
        if (!character.title) {
            line += "";
        }
        else {
            line += `<div id='title'><em>"${character.title}"</em></div><br>`;
        }

        line += `<b>Vision:</b> ${character.vision}<br>`;
        line += `<b>Weapon:</b> ${character.weapon}<br>`;
        line += `<b>Nation:</b> ${character.nation}<br>`;
        line += `<b>Rarity:</b> ${character.rarity}<br>`;

        // if desc is null
        if (character.description == "") {
            line += "";
        }
        else {
            line += `<br><div id='desc'>${character.description}</div><br>`;
        }

        line += "</div></div>";

        bigString += line;
        totalCount++; // increment count to display
    }

    bigString += "</div>";

    // if no characters match filters
    if (totalCount == 0) {
        document.querySelector("#status").innerHTML = "";
        document.querySelector("#content").innerHTML = "<b>No characters found!</b>";
    }
    else {
        document.querySelector("#status").innerHTML = "<b>Success!</b>";
        document.querySelector("#content").innerHTML = `--<i>Showing ${totalCount.toString()} results</i>--` + bigString;
    }
}

// reset values
function resetFilter() {
    visionMenu.querySelector(`option[value="any"]`).selected = true;
    vision = "any";
    nationMenu.querySelector(`option[value="any"]`).selected = true;
    nation = "any";
    weaponMenu.querySelector(`option[value="any"]`).selected = true;
    weapon = "any";
    rarityMenu.querySelector(`option[value="any"]`).selected = true;
    rarity = "any";
    localStorage.clear();
}