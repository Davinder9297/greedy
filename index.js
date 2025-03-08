document.addEventListener("DOMContentLoaded", () => {
    let coinBalance = 1000;
    const coinBalanceElement = document.getElementById("coinBalance");
    const betChips = document.querySelectorAll(".bet-chip");
    const fruits = document.querySelectorAll(".fruit");
    const timerElement = document.getElementById("timer");
    const spinSound = document.getElementById("spinSound");
    const coinSound = document.getElementById("coinSound");
    const winPopup = document.getElementById("winPopup");
    const winCounter = document.getElementById("winCounter");
    const closePopup = document.getElementById("closePopup");

    let selectedBet = null;
    let selectedFruits = new Set();
    let countdown = 15;
    let timerInterval;
    let isSpinning = false;

    function updateCoinDisplay() {
        if (coinBalanceElement) {
            coinBalanceElement.innerText = coinBalance;
        }
    }

    function showCelebration() {
        const container = document.getElementById("celebrationContainer");

        for (let i = 0; i < 80; i++) {
            let particle = document.createElement("div");
            let type = Math.random();

            if (type < 0.33) {
                particle.classList.add("confetti");
            } else if (type < 0.66) {
                particle.classList.add("star");
            } else {
                particle.classList.add("sparkle");
            }

            let size = Math.random() * 12 + 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;

            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.top = `${Math.random() * 100}vh`;

            container.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 2000);
        }
    }

    updateCoinDisplay();

    function startTimer() {
        clearInterval(timerInterval);
        countdown = 15;
        timerElement.innerText = `${countdown}s`;

        timerInterval = setInterval(() => {
            countdown--;
            timerElement.innerText = `${countdown}s`;

            if (countdown <= 0) {
                clearInterval(timerInterval);
                stopSpinSound();
                autoSpin();
            }
        }, 1000);
    }

    function stopSpinSound() {
        if (spinSound) {
            spinSound.pause();
            spinSound.currentTime = 0;
        }
    }

    betChips.forEach(chip => {
        chip.addEventListener("click", () => {
            betChips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            selectedBet = parseInt(chip.getAttribute("data-value"));
        });
    });

    fruits.forEach(fruit => {
        fruit.addEventListener("click", () => {
            if (isSpinning) return;

            if (!selectedBet) {
                alert("Please select a bet amount first!");
                return;
            }

            if (selectedBet > coinBalance) {
                alert("Not enough coins!");
                return;
            }

            fruit.classList.toggle("selected");

            if (selectedFruits.has(fruit)) {
                selectedFruits.delete(fruit);
                coinBalance += selectedBet;
            } else {
                if (coinBalance >= selectedBet) {
                    selectedFruits.add(fruit);
                    coinBalance -= selectedBet;
                }
            }

            updateCoinDisplay();
        });
    });

    function autoSpin() {
        if (selectedFruits.size === 0) {
            startTimer();
            return;
        }

        isSpinning = true;
        stopSpinSound();
        try { spinSound.play(); } catch (e) {}

        fruits.forEach(fruit => fruit.classList.remove("active", "inactive", "spinning", "current"));
        fruits.forEach(fruit => fruit.classList.add("inactive"));

        let spinDuration = Math.random() * (7000 - 5000) + 5000;
        let spinSteps = 30;
        let intervalTime = spinDuration / spinSteps;
        let index = 0;

        let spinInterval = setInterval(() => {
            fruits.forEach(fruit => fruit.classList.remove("current"));

            let currentFruit = fruits[index % fruits.length];
            currentFruit.classList.add("current");
            currentFruit.classList.remove("inactive");

            index++;

            if (index >= spinSteps) {
                clearInterval(spinInterval);
                finalizeSpin(index);
            }
        }, intervalTime);
    }

    function finalizeSpin(index) {
        stopSpinSound();

        let finalIndex = (index + Math.floor(Math.random() * fruits.length)) % fruits.length;
        let spinResult = fruits[finalIndex];

        spinResult.classList.add("active");

        fruits.forEach(fruit => {
            fruit.classList.remove("spinning", "current");
            if (fruit !== spinResult) fruit.classList.add("inactive");
        });

        const multiplier = parseInt(spinResult.getAttribute("data-multiplier")) || 1;
        let winnings = 0;

        if (selectedFruits.has(spinResult)) {
            winnings = selectedBet * multiplier;
            coinBalance += winnings;
            winPopup.style.display = 'block';
            showCelebration();

            let currentCount = 0;
            let increment = Math.max(1, Math.floor(winnings / 50));

            let counterInterval = setInterval(() => {
                currentCount += increment;
                if (currentCount >= winnings) {
                    currentCount = winnings;
                    clearInterval(counterInterval);
                }
                winCounter.innerText = currentCount;
            }, 20);

            try { coinSound.play(); } catch (e) {}
        }

        updateCoinDisplay();
        selectedFruits.clear();

        // **Reset bet selection**
        selectedBet = null;
        betChips.forEach(chip => chip.classList.remove("active"));

        setTimeout(() => {
            fruits.forEach(fruit => fruit.classList.remove("active", "inactive", "selected"));
            isSpinning = false;
            startTimer();
        }, 3000);
    }

    closePopup.addEventListener("click", () => {
        winPopup.style.display = 'none';
    });

    startTimer();
});
