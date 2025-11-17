const gridContainer = document.querySelector(".grid-container");
const matchMessage = document.querySelector(".match-message");
const matchSound = document.getElementById("byak-sound");
const celebrationOverlay = document.querySelector(".celebration-overlay");
const celebrationAudio = document.getElementById("celebration-audio");
const scoreDisplay = document.querySelector(".score");
const MATCH_SHOUT = "BYAKLOKOWAGA !";
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let score = 0;
let matchesFound = 0;
let totalPairs = 0;

if (celebrationOverlay) {
  celebrationOverlay.addEventListener("click", hideCelebrationOverlay);
}

if (scoreDisplay) {
  scoreDisplay.textContent = score;
}

fetch("./data/cards.json")
  .then((res) => res.json())
  .then((data) => {
    cards = [...data, ...data];
    totalPairs = data.length;
    matchesFound = 0;
    score = 0;
    if (scoreDisplay) {
      scoreDisplay.textContent = score;
    }
    shuffleCards();
    generateCards();
  });

function shuffleCards() {
  let currentIndex = cards.length,
    randomIndex,
    temporaryValue;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}

function generateCards() {
  gridContainer.innerHTML = "";
  for (let card of cards) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-name", card.name);
    cardElement.innerHTML = `
      <div class="front">
        <img class="front-image" src=${card.image} />
      </div>
      <div class="back"></div>
    `;
    gridContainer.appendChild(cardElement);
    cardElement.addEventListener("click", flipCard);
  }
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  score++;
  if (scoreDisplay) {
    scoreDisplay.textContent = score;
  }
  lockBoard = true;

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;

  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  showMatchMessage();
  matchesFound++;
  if (matchesFound === totalPairs) {
    showCelebrationOverlay();
  }
  resetBoard();
}

function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
  }, 1000);
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function showMatchMessage() {
  if (!matchMessage) return;

  matchMessage.textContent = MATCH_SHOUT;
  matchMessage.classList.remove("show");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      matchMessage.classList.add("show");
    });
  });

  if (matchSound) {
    matchSound.currentTime = 0;
    matchSound.play();
  }
}

function restart() {
  resetBoard();
  shuffleCards();
  score = 0;
  matchesFound = 0;
  if (scoreDisplay) {
    scoreDisplay.textContent = score;
  }
  hideCelebrationOverlay();
  gridContainer.innerHTML = "";
  generateCards();
}

function showCelebrationOverlay() {
  if (celebrationOverlay) {
    celebrationOverlay.classList.add("show");
    celebrationOverlay.setAttribute("aria-hidden", "false");
  }
  if (celebrationAudio) {
    celebrationAudio.currentTime = 0;
    celebrationAudio.play().catch(() => {});
  }
}

function hideCelebrationOverlay() {
  if (celebrationOverlay) {
    celebrationOverlay.classList.remove("show");
    celebrationOverlay.setAttribute("aria-hidden", "true");
  }
  if (celebrationAudio) {
    celebrationAudio.pause();
    celebrationAudio.currentTime = 0;
  }
}
