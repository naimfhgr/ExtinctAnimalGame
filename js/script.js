const gameArea = document.getElementById("game-area");
const areaRect = gameArea.getBoundingClientRect();
const patchSize = 100;
const patches = [];
const NUM_PATCHES = 10;

// Utility to avoid overlap
function isOverlapping(x, y) {
  return patches.some((p) => {
    return Math.abs(p.x - x) < patchSize && Math.abs(p.y - y) < patchSize;
  });
}

// Create mud patches
for (let i = 0; i < NUM_PATCHES; i++) {
  let x, y;
  let attempts = 0;
  do {
    x = Math.random() * (gameArea.clientWidth - patchSize);
    y = Math.random() * (gameArea.clientHeight - patchSize);
    attempts++;
    if (attempts > 100) break; // safety
  } while (isOverlapping(x, y));

  patches.push({ x, y });

  const element = document.createElement("div");
  element.classList.add("interactive-element", "mud");
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;

  // Track click count
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
      if (animal) displayAnimalInfo(animal);
    }
  });

  gameArea.appendChild(element);
}

// Fetch extinct animal
async function fetchRandomAnimal() {
  try {
    const response = await fetch(
      "https://extinct-api.herokuapp.com/api/v1/animal/"
    );
    const result = await response.json();
    return result.data[0];
  } catch (error) {
    console.error("Error fetching animal:", error);
    return null;
  }
}

// Show animal data in popup
function displayAnimalInfo(animal) {
  const popup = document.getElementById("animal-popup");
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

// Close popup
document.getElementById("close-popup").addEventListener("click", () => {
  document.getElementById("animal-popup").classList.remove("visible");
});
