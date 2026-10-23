/* Price of Play: draft board games, live out real usage cards, race cost per play. */
"use strict";

// Deck of buyable board games: price in dollars, shelf appeal blurb.
const GAMES = [
  { name: "Grand Duchy", price: 249, meta: "heavy euro, table-hog box" },
  { name: "Cargo & Crowns", price: 119, meta: "route-building with miniatures" },
  { name: "Legacy of Elmwood", price: 89, meta: "campaign legacy box" },
  { name: "Starline Salvage", price: 70, meta: "coop rescue runs" },
  { name: "The Gilded Vote", price: 60, meta: "negotiation, backstab friendly" },
  { name: "Moth & Lantern", price: 50, meta: "quiet engine builder" },
  { name: "Draft Night Dragons", price: 40, meta: "quick fantasy filler" },
  { name: "Split the Check", price: 35, meta: "party math, loud table" },
  { name: "Two-Deck Duel", price: 25, meta: "two-player only" },
  { name: "Cloak & Token", price: 20, meta: "filler that fits a jacket pocket" },
];

// Life cards: how the table actually treats a shelf pick.
const LIVES = [
  { plays: 12, years: 3, text: "Weekly group, three-year run" },
  { plays: 8, years: 2, text: "Twice a month, two-year rotation" },
  { plays: 4, years: 5, text: "Quarterly ritual, five years strong" },
  { plays: 6, years: 1, text: "One busy season, then a new job moves away" },
  { plays: 2, years: 4, text: "Holiday visits only, four years of them" },
  { plays: 1, years: 10, text: "One memorable weekend, long shelf life after" },
];

// Event cards that bend the schedule (or kill it).
const EVENTS = [
  { mult: 1.5, text: "An expansion drops and the table re-ups." },
  { mult: 1.0, text: "No drama. The schedule holds." },
  { mult: 0.5, text: "Someone's kid swallows a token. Box gets benched." },
  { mult: 0.0, text: "Played once and shelved. The shrink wrap loses." },
  { mult: 1.25, text: "A friend group adopts it for their own nights." },
];

const BENCHES = [4, 5, 6, 7, 8, 9]; // per-round ticket-line benchmark, $/play
const ROUNDS = 6;

let round, wins, totalCost, totalPlays, log;

function deal(n) {
  const pool = GAMES.slice();
  const hand = [];
  for (let i = 0; i < n; i++) {
    hand.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return hand;
}

function cardEl(game) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML =
    "<h3></h3><div class='price'></div><div class='meta'></div>";
  div.querySelector("h3").textContent = game.name;
  div.querySelector(".price").textContent = "$" + game.price;
  div.querySelector(".meta").textContent = game.meta;
  div.addEventListener("click", () => pick(game));
  return div;
}

function pick(game) {
  const life = LIVES[Math.floor(Math.random() * LIVES.length)];
  const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  const plays = Math.max(0, Math.round(life.plays * event.mult));
  const cpp = plays > 0 ? game.price / plays : game.price;

  totalCost += game.price;
  totalPlays += plays;

  const lifeLine = `${life.text} — ${plays} plays before it retires.`;
  const mathLine = plays > 0
    ? `$${game.price} ÷ ${plays} = $${cpp.toFixed(2)} per play.`
    : `$${game.price} ÷ 0 plays = $${cpp.toFixed(2)} per play.`;

  const good = cpp <= bench();
  const verdict = plays === 0
    ? "Full price, zero plays. The shelf of shame takes it."
    : good
      ? "Under the line. This one earns its shelf spot."
      : "Over the line. The movie would have been cheaper.";

  document.getElementById("outcome").hidden = false;
  document.getElementById("life-card").textContent = lifeLine;
  document.getElementById("event-line").textContent = event.text;
  document.getElementById("math-line").textContent = mathLine;
  const v = document.getElementById("verdict");
  v.textContent = verdict;
  v.className = "verdict " + (good ? "good" : "bad");

  const li = document.createElement("li");
  li.textContent = `R${round}: ${game.name}, $${cpp.toFixed(2)}/play ${good ? "✓" : "✗"}`;
  document.getElementById("log").appendChild(li);
  if (good) wins++;

  document.querySelectorAll(".card").forEach((c) => (c.style.pointerEvents = "none"));
}

function bench() {
  return BENCHES[round - 1];
}

function startRound() {
  document.getElementById("outcome").hidden = true;
  document.getElementById("round-label").textContent = `Round ${round} of ${ROUNDS}`;
  document.getElementById("bench-label").textContent =
    `Ticket line: $${bench().toFixed(2)} per play`;
  const shelf = document.getElementById("shelf");
  shelf.innerHTML = "";
  deal(3).forEach((g) => shelf.appendChild(cardEl(g)));
}

function endGame() {
  document.getElementById("game").hidden = true;
  const avg = totalPlays > 0 ? totalCost / totalPlays : 0;
  const grade =
    wins >= 4 ? "You shop like the table plays." :
    wins >= 2 ? "Half the shelf earned its keep. The rest watches." :
    "The shelf of shame wins this one. Cheaper tickets next time.";
  document.getElementById("end-summary").innerHTML =
    `<p>${wins} of ${ROUNDS} picks beat the ticket line.</p>` +
    `<p>Average across the shelf: $${avg.toFixed(2)} per play over ` +
    `${totalPlays} sessions and $${totalCost} spent.</p><p>${grade}</p>`;
  document.getElementById("end").hidden = false;
}

document.getElementById("start").addEventListener("click", () => {
  round = 1; wins = 0; totalCost = 0; totalPlays = 0;
  log = [];
  document.getElementById("setup").hidden = true;
  document.getElementById("game").hidden = false;
  document.getElementById("log").innerHTML = "";
  startRound();
});

document.getElementById("next").addEventListener("click", () => {
  round++;
  if (round > ROUNDS) endGame(); else startRound();
});

document.getElementById("again").addEventListener("click", () => {
  document.getElementById("end").hidden = true;
  document.getElementById("setup").hidden = false;
});
