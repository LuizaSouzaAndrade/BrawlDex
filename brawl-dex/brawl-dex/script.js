"use strict";

const API_URL = "https://api.brawlapi.com/v1/brawlers";
const CACHE_KEY = "brawldex-v1";

const $ = (id) => document.getElementById(id);
const el = { busca: $("busca"), raridade: $("raridade"), ordem: $("ordem"), lista: $("lista"),
  status: $("status"), erro: $("erro"), tentar: $("tentar"), dialog: $("detalhe"), conteudo: $("det-conteudo") };

let brawlers = [];

// Evita injetar HTML vindo da API
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const cor = (b) => (/^#[0-9a-f]{6}$/i.test(b.rarity?.color) ? b.rarity.color : "#b9eaff");

function mostrarSkeleton() {
  el.lista.innerHTML = Array.from({ length: 12 }, () => '<li class="skel" aria-hidden="true"></li>').join("");
}

async function carregar() {
  el.erro.hidden = true;
  el.status.textContent = "Carregando brawlers…";
  mostrarSkeleton();
  try {
    const cache = sessionStorage.getItem(CACHE_KEY);
    if (cache) {
      brawlers = JSON.parse(cache);
    } else {
      const resp = await fetch(API_URL);
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const dados = await resp.json();
      brawlers = dados.list || [];
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(brawlers));
    }
    if (!brawlers.length) throw new Error("Lista vazia");
    preencherRaridades();
    renderizar();
  } catch (e) {
    console.error(e);
    el.lista.innerHTML = "";
    el.status.textContent = "";
    el.erro.hidden = false;
  }
}

function preencherRaridades() {
  const nomes = [...new Set(brawlers.map((b) => b.rarity?.name).filter(Boolean))];
  el.raridade.innerHTML = '<option value="">Todas</option>' + nomes.map((n) => `<option>${esc(n)}</option>`).join("");
}

function filtrar() {
  const termo = el.busca.value.trim().toLowerCase();
  const rar = el.raridade.value;
  let res = brawlers.filter((b) => b.name.toLowerCase().includes(termo) && (!rar || b.rarity?.name === rar));
  if (el.ordem.value === "nome") res.sort((a, b) => a.name.localeCompare(b.name));
  if (el.ordem.value === "raridade") res.sort((a, b) => (a.rarity?.id ?? 0) - (b.rarity?.id ?? 0) || a.name.localeCompare(b.name));
  if (el.ordem.value === "recentes") res.sort((a, b) => b.id - a.id);
  return res;
}

function renderizar() {
  const res = filtrar();
  el.status.textContent = res.length ? `${res.length} brawler(s) encontrado(s).` : "Nenhum brawler encontrado. Tente outro nome ou raridade.";
  el.lista.innerHTML = res.map((b) => `
    <li>
      <button class="card" type="button" data-id="${b.id}" style="--cor:${cor(b)}" aria-label="Ver detalhes de ${esc(b.name)}">
        <img src="${esc(b.imageUrl)}" alt="" width="112" height="112" loading="lazy" decoding="async">
        <h2>${esc(b.name)}</h2>
        <span class="tag">${esc(b.rarity?.name || "—")}</span>
      </button>
    </li>`).join("");
}

function habilidades(titulo, itens = []) {
  if (!itens.length) return "";
  return `<h3>${titulo}</h3><ul class="hab">` + itens.map((h) => `
    <li><img src="${esc(h.imageUrl)}" alt="" width="44" height="44" loading="lazy">
    <div><strong>${esc(h.name)}</strong>${esc(h.description)}</div></li>`).join("") + "</ul>";
}

function abrirDetalhe(id) {
  const b = brawlers.find((x) => x.id === Number(id));
  if (!b) return;
  el.conteudo.innerHTML = `
    <div class="det-topo">
      <img src="${esc(b.imageUrl)}" alt="Retrato de ${esc(b.name)}" width="120" height="120">
      <div><h2 id="det-nome">${esc(b.name)}</h2>
      <span class="tag" style="--cor:${cor(b)}">${esc(b.rarity?.name || "")}</span>
      <p>Classe: ${esc(b.class?.name || "—")}</p></div>
    </div>
    <p class="desc">${esc(b.description || "Sem descrição disponível.")}</p>
    ${habilidades("Gadgets", b.gadgets)}
    ${habilidades("Star Powers", b.starPowers)}`;
  el.dialog.showModal();
}

el.lista.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (card) abrirDetalhe(card.dataset.id);
});
el.dialog.addEventListener("click", (e) => {
  if (e.target === el.dialog || e.target.closest(".fechar")) el.dialog.close();
});
let atraso;
el.busca.addEventListener("input", () => { clearTimeout(atraso); atraso = setTimeout(renderizar, 200); });
el.raridade.addEventListener("change", renderizar);
el.ordem.addEventListener("change", renderizar);
el.tentar.addEventListener("click", carregar);

carregar();
