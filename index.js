const setup = async () => {
  let firstCard = undefined;
  let secondCard = undefined;
  let openCards = 0;
  let matchedCards = 0;
  let clickCount = 0;
  const numpairs = 3;
  const gameGrid = $("#game-grid");

  // Helper function to get random index
  function getRandomIndex() {
    return Math.floor(Math.random() * (numpairs * 2));
  }

  // Fetch Pokémon data
  const response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?limit=810"
  );
  const data = response.data;
  let randomPokemonUrls = [];
  for (let k = 0; k < numpairs; k++) {
    const randomPokemon =
      data.results[Math.floor(Math.random() * data.results.length)];
    const randomPokemonResponse = await axios.get(randomPokemon.url);
    const randomPokemonData = randomPokemonResponse.data;
    const randomPokemonImageUrl =
      randomPokemonData.sprites.other["official-artwork"].front_default;
    randomPokemonUrls.push(randomPokemonImageUrl);
  }

  // Create card elements dynamically
  for (let i = 0; i < numpairs * 2; i++) {
    let card = $("<div>").addClass("card");
    let frontFace = $("<img>").addClass("front_face");
    let backFace = $("<img>").addClass("back_face").attr("src", "back.webp");
    card.append(frontFace, backFace);
    gameGrid.append(card);
  }

  const usedIndices = [];
  for (let j = 0; j < numpairs; j++) {
    let randomIndex1 = getRandomIndex();
    while (usedIndices.includes(randomIndex1)) {
      randomIndex1 = getRandomIndex();
    }
    usedIndices.push(randomIndex1);

    let randomIndex2 = getRandomIndex();
    while (
      usedIndices.includes(randomIndex2) ||
      randomIndex2 === randomIndex1
    ) {
      randomIndex2 = getRandomIndex();
    }
    usedIndices.push(randomIndex2);

    // Add Pokémon images to cards
    gameGrid.children()[randomIndex1].children[0].src = randomPokemonUrls[j];
    gameGrid.children()[randomIndex2].children[0].src = randomPokemonUrls[j];
  }

  // Add event listener to cards
  $(".card").on("click", function () {
    if (
      $(this).hasClass("flip") ||
      $(this).hasClass("matched") ||
      openCards >= 2
    ) {
      return;
    }

    $(this).toggleClass("flip");
    openCards++;
    clickCount++;
    $("#clickCount").text(clickCount);

    if (!firstCard) firstCard = $(this);
    else {
      secondCard = $(this);

      if (
        firstCard.find(".front_face")[0].src ==
        secondCard.find(".front_face")[0].src
      ) {
        // Match
        firstCard.addClass("matched");
        secondCard.addClass("matched");
        matchedCards++;
        $("#pairsMatched").text(matchedCards);
        $("#pairsLeft").text(numpairs - matchedCards);
        openCards = 0;
        firstCard = secondCard = undefined;

        setTimeout(() => {
          if (matchedCards === numpairs) {
            alert("You win!");
          }
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          firstCard.toggleClass("flip");
          secondCard.toggleClass("flip");
          openCards = 0;
          firstCard = secondCard = undefined;
        }, 1000);
      }
    }
  });

  $("#totalPairs").text(numpairs);
  $("#pairsLeft").text(numpairs);
};

$(document).ready(setup);
