
let basket = [];

document.addEventListener("DOMContentLoaded", () => {

  fetchPopularCocktails(
    "https://aokyqthw0k.execute-api.eu-west-1.amazonaws.com/Prod/popularcocktails",
    "popularCocktails"
  );

  const alphabetButtons = document.getElementById("alphabet-buttons");
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  Array.from(alphabet).forEach((letter) => {
    const button = document.createElement("button");
    button.className = "alphabet-button";
    button.textContent = letter;
    button.onclick = () => fetchLetterCocktails(letter);
    alphabetButtons.appendChild(button);
  });

  setupBasketModal();
});


async function fetchCocktails(endpoint, targetElementId) {
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    const targetElement = document.getElementById(targetElementId);
    targetElement.innerHTML = ""; 
    data.forEach((cocktail) => {
      const li = document.createElement("li");


      const img = document.createElement("img");
      img.src = cocktail.ImageURL; 
      img.alt = `Image of ${cocktail.CocktailName}`;

  
      const span = document.createElement("span");
      span.textContent = cocktail.CocktailName;

 
      const addToBasketButton = document.createElement("button");
      addToBasketButton.className = "add-to-basket";
      addToBasketButton.textContent = "Add to Basket";
      addToBasketButton.dataset.id = cocktail.CocktailID; 
      addToBasketButton.addEventListener("click", () => addToBasket(cocktail));

      li.appendChild(img);
      li.appendChild(span);
      li.appendChild(addToBasketButton);
      targetElement.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching cocktails:", error);
  }
}

async function fetchPopularCocktails(endpoint) {
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    displayCocktails(data);
  } catch (error) {
    console.error("Error fetching popular cocktails:", error);
  }
}

function displayCocktails(cocktails) {
  const container = document.getElementById('cocktails-container');
  container.innerHTML = ''; // Clear the container before displaying cocktails

  cocktails.forEach(cocktail => {
    const cocktailDiv = document.createElement('div');
    cocktailDiv.className = 'cocktail';
    cocktailDiv.innerHTML = `
      <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}">
      <h3>${cocktail.strDrink}</h3>
      <button class="add-to-basket" data-id="${cocktail.CocktailID}">Add to Basket</button>
    `;
    container.appendChild(cocktailDiv);
  });
}

function fetchLetterCocktails(letter) {
  const endpoint = `https://aokyqthw0k.execute-api.eu-west-1.amazonaws.com/Prod/listofcocktails?firstLetter=${letter}`;
  fetchCocktails(endpoint, "popularCocktails");
}
function attachAddToBasketEventListeners(cocktails) {
  document.querySelectorAll('.add-to-basket').forEach(button => {
    button.addEventListener('click', (event) => {
      const cocktailId = event.target.dataset.id;
      const cocktail = cocktails.find(c => c.idDrink === cocktailId);
      addToBasket({
        idDrink: cocktail.idDrink,
        strDrink: cocktail.strDrink
      });
      event.stopPropagation();
    });
  });
}

function addToBasket(cocktail) {
  basket.push(cocktail);
  updateBasketDisplay();
}

function updateBasketDisplay() {
  document.getElementById('view-basket').textContent = `View Basket (${basket.length})`;
}


function setupBasketModal() {
  const basketModal = document.getElementById('basket-modal');
  const btn = document.getElementById('view-basket');
  const span = document.getElementsByClassName('close')[0];

  btn.onclick = function() {
    basketModal.style.display = "block";
    updateBasketModal();
  }

  span.onclick = function() {
    basketModal.style.display = "none";
  }

  window.onclick = function(event) {
    if (event.target == basketModal) {
      basketModal.style.display = "none";
    }
  }

  document.getElementById('checkout').addEventListener('click', checkoutBasket);
}

function updateBasketModal() {
  const basketItems = document.getElementById("basket-items");
  basketItems.innerHTML = ""; // Clear the basket view
  basket.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "basket-item";
    itemDiv.innerHTML = `
      <span>${item.strDrink}</span>
      <button onclick="removeFromBasket('${item.CocktailID}')">Remove</button>
    `;
    basketItems.appendChild(itemDiv);
  });
}

function removeFromBasket(cocktailId) {
  basket = basket.filter((item) => item.CocktailID !== cocktailId);
  updateBasketDisplay();
  updateBasketModal();
}

function checkoutBasket() {
  const tableNumber = document.getElementById("table-number").value;

  if (!tableNumber) {
    alert("Please enter a table number.");
    return;
  }

  console.log("Checking out", basket, "Table number:", tableNumber);

  fetch("https://xchwkz6wk0.execute-api.eu-west-1.amazonaws.com/prod/popular", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      TableNumber: tableNumber,
      CocktailIDs: basket.map((item) => item.idDrink),
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Order placed:", data);
      basket = []; // Clear the basket
      updateBasketDisplay();
      document.getElementById("basket-modal").style.display = "none";
      alert("Your order has been placed!");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}