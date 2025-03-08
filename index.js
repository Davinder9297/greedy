document.addEventListener("DOMContentLoaded", function () {
    let startButton = document.getElementById("startButton");
    let closePopupBtn = document.getElementById("closePopup");

    if (!startButton) {
        console.error("Error: startButton not found in DOM.");
        return;
    }

    startButton.onclick = startSpin;

    if (closePopupBtn) {
        closePopupBtn.addEventListener("click", closePopup);
    } else {
        console.error("Error: closePopup button not found in DOM.");
    }
});

let isSpinning = false;

function startSpin() {
    if (isSpinning) return;
    isSpinning = true;

    let spinSound = document.getElementById("spinSound");
    let coinSound = document.getElementById("coinSound");
    let timerDisplay = document.getElementById("timer");
    let fruits = document.querySelectorAll(".fruit");
    let popup = document.getElementById("winPopup");
    let popupMessage = document.getElementById("popupMessage");
    let startButton = document.getElementById("startButton");
    let winCounter = document.getElementById("winCounter");
    if (!timerDisplay) {
        console.error("Error: timerDisplay (id='timer') is missing in the HTML.");
        return;
    }

    if ( !popup || !popupMessage || !spinSound || !coinSound || !startButton) {
        console.error("Error: One or more elements not found in DOM.");
        console.log({ timerDisplay, popup, popupMessage, spinSound, coinSound, startButton });
        isSpinning = false;
        return;
    }

    startButton.disabled = true;

    let timeLeft = Math.floor(Math.random() * 6)+3; // Random 5-10 seconds
    let selectedIndex = 0;
    popup.style.display = "none";

    spinSound.pause();
    spinSound.currentTime = 0;
    spinSound.play().catch(err => console.error("Audio play error:", err));

    fruits.forEach(fruit => fruit.classList.add("inactive"));

    let highlightInterval = setInterval(() => {
        fruits.forEach(fruit => fruit.classList.add("inactive"));
        fruits[selectedIndex].classList.remove("inactive");
        selectedIndex = (selectedIndex + 1) % fruits.length;
    }, 150);

    let countdown = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft + "s";

        if (timeLeft <= 0) {
            clearInterval(countdown);
            clearInterval(highlightInterval);

            spinSound.pause();
            spinSound.currentTime = 0;

            coinSound.pause();
            coinSound.currentTime = 0;
            coinSound.play().catch(err => console.error("Audio play error:", err));

            let selectedFruitIndex = Math.floor(Math.random() * fruits.length);
            let selectedFruit = fruits[selectedFruitIndex];

            fruits.forEach(fruit => fruit.classList.add("inactive"));
            selectedFruit.classList.remove("inactive");

            let multiplier = parseInt(selectedFruit.innerText.match(/\d+/)?.[0] || "1"); // Prevent NaN
            let winPoints = 500 * multiplier;
            winCounter.innerText = "0";
            let count = 0;
            let counterInterval = setInterval(() => {
                count += Math.ceil(winPoints / 50); // Increment in steps
                if (count >= winPoints) {
                    count = winPoints; // Ensure final value is exact
                    clearInterval(counterInterval);
                }
                winCounter.innerText = count;
            }, 50);
            // popupMessage.innerHTML = `🎉 You won <strong>${winPoints}</strong> coins with ${selectedFruit.innerText.trim()}!`;
            popup.style.display = "block";
            popup.classList.add("fade-in");

            setTimeout(() => {
                startButton.disabled = false;
                isSpinning = false;
            }, 1000);
        }
    }, 1000);
}

// Close popup with animation
function closePopup() {
    let popup = document.getElementById("winPopup");
    popup.classList.add("fade-out");

    setTimeout(() => {
        popup.style.display = "none";
        popup.classList.remove("fade-in", "fade-out");
    }, 300);
}
