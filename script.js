/* Pokemon Team Builder using fetch() and PokeAPI */

const API_BASE = "https://pokeapi.co/api/v2/pokemon/";
const CACHE_PREFIX = "pokeCache:";
const TEAM_KEY = "pokeTeam";

const pokemonQuery = document.getElementById("pokemonQuery");
const fetchBtn = document.getElementById("fetchBtn");
const clearCacheBtn = document.getElementById("clearCacheBtn");

const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");

const pokemonPanel = document.getElementById("pokemonPanel");
const pokeName = document.getElementById("pokeName");
const pokeImg = document.getElementById("pokeImg");
const pokeAudio = document.getElementById("pokeAudio");

const move1 = document.getElementById("move1");
const move2 = document.getElementById("move2");
const move3 = document.getElementById("move3");
const move4 = document.getElementById("move4");

const addBtn = document.getElementById("addToTeamBtn");
const teamContainer = document.getElementById("teamContainer");
const clearTeamBtn = document.getElementById("clearTeamBtn");

let currentPokemon = null;

function setStatus(text){
statusEl.textContent = text;
}

function setError(text){
errorEl.textContent = text;
}

function normalize(q){
return q.trim().toLowerCase();
}

function getCache(url){
const raw = localStorage.getItem(CACHE_PREFIX + url);
if(!raw) return null;
return JSON.parse(raw);
}

function setCache(url,data){
localStorage.setItem(CACHE_PREFIX + url, JSON.stringify(data));
}

async function cachedFetch(url){

const cached = getCache(url);

if(cached){
return cached;
}

const res = await fetch(url);

if(!res.ok){
throw new Error("Request failed");
}

const data = await res.json();

setCache(url,data);

return data;

}

function populateMoves(moves){

const selects = [move1,move2,move3,move4];

selects.forEach(select=>{
select.innerHTML="";
moves.forEach(m=>{
const option = document.createElement("option");
option.value = m.move.name;
option.textContent = m.move.name;
select.appendChild(option);
});
});

}

async function loadPokemon(){

setError("");

const query = normalize(pokemonQuery.value);

if(!query){
setError("Enter a pokemon name or id");
return;
}

const url = API_BASE + query;

setStatus("Loading...");

try{

const data = await cachedFetch(url);

currentPokemon = data;

pokeName.textContent = data.name + " (ID: " + data.id + ")";

pokeImg.src = data.sprites.front_default;

if(data.cries && data.cries.latest){
pokeAudio.src = data.cries.latest;
}

populateMoves(data.moves);

pokemonPanel.style.display = "block";

setStatus("Loaded");

}
catch(err){

setError("Pokemon not found");

}

}

function loadTeam(){

const raw = localStorage.getItem(TEAM_KEY);

if(!raw) return [];

return JSON.parse(raw);

}

function saveTeam(team){

localStorage.setItem(TEAM_KEY, JSON.stringify(team));

}

function renderTeam(){

const team = loadTeam();

teamContainer.innerHTML="";

team.forEach((p,i)=>{

const div = document.createElement("div");

div.className="team-slot";

const title = document.createElement("h3");

title.textContent = p.name;

const img = document.createElement("img");

img.src = p.sprite;

const list = document.createElement("ul");

p.moves.forEach(m=>{
const li = document.createElement("li");
li.textContent = m;
list.appendChild(li);
});

div.appendChild(title);
div.appendChild(img);
div.appendChild(list);

teamContainer.appendChild(div);

});

}

function addToTeam(){

if(!currentPokemon) return;

const team = loadTeam();

if(team.length>=6) return;

const moves=[
move1.value,
move2.value,
move3.value,
move4.value
];

const entry={
name:currentPokemon.name,
sprite:currentPokemon.sprites.front_default,
moves:moves
};

team.push(entry);

saveTeam(team);

renderTeam();

}

function clearCache(){

Object.keys(localStorage).forEach(key=>{
if(key.startsWith(CACHE_PREFIX)){
localStorage.removeItem(key);
}
});

}

fetchBtn.addEventListener("click",loadPokemon);
addBtn.addEventListener("click",addToTeam);

clearCacheBtn.addEventListener("click",clearCache);

clearTeamBtn.addEventListener("click",()=>{
localStorage.removeItem(TEAM_KEY);
renderTeam();
});

renderTeam();
