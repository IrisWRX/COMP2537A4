const setup = async () => {
  let firstCard = undefined;
  let secondCard = undefined;
  let openCards = 0;
  let matchedCards = 0;
  let clickCount = 0;
  const gameGrid = $("#game-grid");
  let elapsedTime = 0;
  let timer;
  let difficulty = { pairs: 3, duration: 100 };
  let pairAttempts = 0;
  let flipBackTimer;

  // Difficulty selection
  $("#easy-btn").on("click", function () {
    difficulty = { pairs: 3, duration: 100 };
  });

  $("#medium-btn").on("click", function () {
    difficulty = { pairs: 6, duration: 200 };
  });

  $("#hard-btn").on("click", function () {
    difficulty = { pairs: 12, duration: 300 };
  });

  // Reset function
  $("#reset-btn").on("click", function () {
    $("#game-grid").empty();
    $("#header").hide();
    $("#game-grid").hide();
    $("#dark-btn").hide();
    $("#light-btn").hide();
    $("#difficulty-btns").show();
    $("#start-btn").show();
    clearInterval(timer);
    elapsedTime = 0;
  });

  // Start game function
  $("#start-btn").on("click", function () {
    startGame(difficulty.pairs, difficulty.duration);
  });

  // Change background color
  $("#dark-btn").on("click", function () {
    $("#game-grid").css("background-color", "black");
    $(".card").css("background-color", "black");
  });
  $("#light-btn").on("click", function () {
    $("#game-grid").css("background-color", "white");
    $(".card").css("background-color", "white");
  });

  // Reveal all cards
  function revealAllCards(time) {
    if (flipBackTimer) {
      clearTimeout(flipBackTimer); // Cancel the flip back action if power-up is activated
      flipBackTimer = null;
      firstCard.toggleClass("flip");
      secondCard.toggleClass("flip");
      openCards = 0;
      firstCard = secondCard = undefined;
    }

    $(".card").not(".matched").addClass("flip");
    setTimeout(() => {
      $(".card").not(".matched").removeClass("flip");
    }, time);
  }

  // Hide header initially
  $("#header").hide();
  $("#game-grid").hide();
  $("#dark-btn").hide();
  $("#light-btn").hide();

  const startGame = async (numpairs, timeLimit) => {
    $("#header").show();
    $("#game-grid").show();
    $("#dark-btn").show();
    $("#light-btn").show();
    $("#start-btn").hide();

    // Check if all pairs are matched
    function checkWin() {
      if (matchedCards === numpairs) {
        alert("You win!");
        clearInterval(timer);
      }
    }

    // Start timer
    function startTimer() {
      $("#timer").html(
        `<p><strong>You got ${timeLimit} seconds. 0 seconds passed!</strong></p>`
      );
      timer = setInterval(() => {
        elapsedTime++;
        $("#timer").html(
          `<p><strong>You got ${timeLimit} seconds. ${elapsedTime} seconds passed!</strong></p>`
        );
        if (elapsedTime >= timeLimit) {
          clearInterval(timer);
          alert("Time up!");
        }
      }, 1000);
    }

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
        pairAttempts++; //

        // Define the power-up trigger conditions for each difficulty level
        const triggerCondition =
          (difficulty.pairs === 3 && pairAttempts % 4 === 0) ||
          (difficulty.pairs === 6 && pairAttempts % 10 === 0) ||
          (difficulty.pairs === 12 && pairAttempts % 17 === 0);

        // If the power-up should be triggered, execute the power-up logic here
        if (triggerCondition) {
          if (confirm("Power up!")) {
            revealAllCards(1500);
          }
        }

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

          setTimeout(checkWin, 1000);
        } else {
          flipBackTimer = setTimeout(() => {
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

    // Start the timer when the game starts
    startTimer();
  };
};

$(document).ready(setup);
