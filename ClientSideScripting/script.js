(async function() {
  // when the page loads, set up button click events
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("gen").addEventListener("click", makeInputs);
    document.getElementById("searchName").addEventListener("click", searchByName);
  });

  // Generate input fields for the number of ingredients specified
  function makeInputs() {
    let num = document.getElementById("count").value;
    let section = document.getElementById("searchSection");
    section.innerHTML = "";

    // Alert if the number of ingredients exceeds 5
    if (num > 5) {
      alert("Hey, keep it between 1 and 5, please.");
      return;
    }

    // Create and add input fields for each ingredient
    for (let i = 0; i < num; i++) {
      let inp = document.createElement("input");
      inp.type = "text";
      inp.placeholder = `Ingredient ${i + 1}`;
      inp.addEventListener("input", fetchCocktails);
      section.appendChild(inp);
    }
  }

  // Fetches cocktails based on the ingredients entered
  async function fetchCocktails() {
    try {
      let ingredients = Array.from(document.querySelectorAll("#searchSection input"))
        .map(inp => inp.value.trim())
        .filter(val => val !== "")
        .join(",");

      // Perform the search if ingredients are entered
      if (ingredients) {
        let resp = await fetch(`https://www.thecocktaildb.com/api/json/v2/9973533/filter.php?i=${ingredients}`);
        if (!resp.ok) throw new Error(`HTTP error! Status: ${resp.status}`);
        let data = await resp.json();
        display(data.drinks);
      }
    } catch (err) {
      console.error("Oops, couldn't fetch cocktails by ingredients:", err);
    }
  }

  // Looks up cocktails by name
  async function searchByName() {
    try {
      let name = document.getElementById("name").value.trim();
      if (name) {
        let resp = await fetch(`https://www.thecocktaildb.com/api/json/v2/9973533/search.php?s=${name}`);
        if (!resp.ok) throw new Error(`HTTP error! Status: ${resp.status}`);
        let data = await resp.json();
        display(data.drinks);
      }
    } catch (err) {
      console.error("Oops, error searching cocktails by name:", err);
    }
  }

  // Displays a list of cocktails on the page
  function display(cocktails) {
    let list = document.getElementById("list");
    list.innerHTML = "";

    // Create a div for each cocktail with its name, image, and a details button
    if (cocktails) {
      cocktails.forEach(drink => {
        let div = document.createElement("div");
        div.className = "cocktail";

        let name = document.createElement("h3");
        name.textContent = drink.strDrink;

        let img = document.createElement("img");
        img.src = drink.strDrinkThumb;
        img.alt = drink.strDrink;

        let btn = document.createElement("button");
        btn.textContent = "Details";
        btn.addEventListener("click", () => fetchDetails(drink.idDrink));

        div.appendChild(name);
        div.appendChild(img);
        div.appendChild(btn);

        list.appendChild(div);
      });
    } else {
      list.innerHTML = "<p>Can't find any cocktails.</p>";
    }
  }

  // Fetches detailed info about a single cocktail using its id
  async function fetchDetails(id) {
    try {
      let resp = await fetch(`https://www.thecocktaildb.com/api/json/v2/9973533/lookup.php?i=${id}`);
      if (!resp.ok) throw new Error(`HTTP error! Status: ${resp.status}`);
      let data = await resp.json();
      showDetails(data.drinks[0]);
    } catch (err) {
      console.error("Oops, problem fetching cocktail details:", err);
    }
  }

  // Shows detailed info for a cocktail
  function showDetails(drink) {
    let details = document.getElementById("details");
    details.innerHTML = `
            <h2>${drink.strDrink}</h2>
            <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
            <p><strong>Glass:</strong> ${drink.strGlass}</p>
            <p><strong>Instructions:</strong> ${drink.strInstructions}</p>
            <h3>Ingredients</h3>
            <ul>${getIngredients(drink)}</ul>
        `;
    document.getElementById("list").innerHTML = "";
  }

  // Builds a list of ingredients for a cocktail
  function getIngredients(drink) {
    let ingredients = "";
    for (let i = 1; i <= 15; i++) {
      if (drink[`strIngredient${i}`]) {
        ingredients += `<li>${drink[`strIngredient${i}`]} - ${drink[`strMeasure${i}`]}</li>`;
      }
    }
    return ingredients;
  }
})();
