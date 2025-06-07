const gameArea = document.querySelector("#game-area");
const patchSize = 100;
const numPatches = 10;
const patches = [];

// Patch-Erstellung initial starten
initMudPatches(numPatches);

// Popup schließen
document.querySelector("#close-popup").addEventListener("click", () => {
  document.querySelector("#animal-popup").classList.remove("visible");
});

// Hauptfunktion: Patches platzieren
function initMudPatches(count) {
  for (let i = 0; i < count; i++) {
    const coords = findValidPatchCoordinates();
    if (!coords) continue;

    patches.push(coords);
    createInteractiveElement(coords);
  }
}

// Zufällige gültige Koordinaten berechnen (ohne Überlappung)
function findValidPatchCoordinates() {
  let attempts = 0;
  while (attempts < 100) {
    const x = Math.random() * (gameArea.clientWidth - patchSize);
    const y = Math.random() * (gameArea.clientHeight - patchSize);
    if (!isOverlapping(x, y)) {
      return { x, y };
    }
    attempts++;
  }
  return null;
}

// Prüfen ob neue Koordinaten mit bestehenden überlappen
function isOverlapping(x, y) {
  return patches.some((patch) => {
    return (
      Math.abs(patch.x - x) < patchSize && Math.abs(patch.y - y) < patchSize
    );
  });
}

// Interaktives Element erstellen und ins DOM einfügen
function createInteractiveElement({ x, y }) {
  const element = document.createElement("div");
  element.classList.add("interactive-element", "mud");
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
  element.dataset.clicks = "1";

  element.addEventListener("click", async () => {
    let clicks = parseInt(element.dataset.clicks) + 1;
    element.dataset.clicks = clicks.toString();

    if (clicks === 2) {
      element.classList.remove("mud");
      element.classList.add("bone_normal");
    } else if (clicks === 3) {
      element.classList.remove("bone_normal");
      element.classList.add("bone_broken");
      const animal = await fetchRandomAnimal();
      if (animal) {
        showAnimalPopup(animal);
      }
      checkAllBroken();
    }
  });

  gameArea.appendChild(element);
}

// Tierdaten aus externer API abrufen
async function fetchRandomAnimal() {
  const url = "https://extinct-api.herokuapp.com/api/v1/animal/";
  try {
    const response = await fetch(url);
    const result = await response.json();
    return result.data[0];
  } catch (error) {
    console.error("Fehler beim Laden des Tiers:", error);
    return null;
  }
}

// Tierdaten im Popup anzeigen
function showAnimalPopup(animal) {
  const popup = document.querySelector("#animal-popup");
  popup.querySelector(".animal-image").src =
    animal.imageSrc || "assets/fallback.jpg";
  popup.querySelector(".animal-name").textContent =
    animal.commonName || animal.binomialName || "Unknown";
  popup.querySelector(".animal-last-seen").textContent = `Last Seen: ${
    animal.lastRecord || "Unknown"
  }`;
  popup.querySelector(".animal-region").textContent = `Region: ${
    animal.location || "Unknown"
  }`;
  popup.querySelector(".animal-description").textContent =
    animal.shortDesc || "No description available.";
  popup.classList.add("visible");
}

// Wenn alle Knochen ausgegraben wurden, neu laden
function checkAllBroken() {
  const allElements = document.querySelectorAll(".interactive-element");
  const allBroken = Array.from(allElements).every((el) =>
    el.classList.contains("bone_broken")
  );

  if (allBroken) {
    // kurze Pause, dann neu laden
    setTimeout(() => {
      document
        .querySelectorAll(".interactive-element")
        .forEach((el) => el.remove());

      // Clear internal tracking
      patches.length = 0;

      // Re-initialize new mud patches
      initMudPatches(numPatches);
    }, 1000); // 1 Sekunde Verzögerung
  }
}

// Popup schliessen, wenn ausserhalb geklickt wird
document.addEventListener("click", (e) => {
  const popup = document.querySelector("#animal-popup");
  const content = popup.querySelector(".popup-content");

  if (popup.classList.contains("visible") && !content.contains(e.target)) {
    popup.classList.remove("visible");
  }
});
