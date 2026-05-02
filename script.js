function calculateStress() {
    let q1 = parseInt(document.getElementById("q1").value);
    let q2 = parseInt(document.getElementById("q2").value);
    let q3 = parseInt(document.getElementById("q3").value);

    let total = q1 + q2 + q3;

    let result = "";

    if (total <= 3) {
        result = "Low Stress 😊";
    } else if (total <= 6) {
        result = "Moderate Stress 😐";
    } else {
        result = "High Stress 😟";
    }

    document.getElementById("result").innerText = result;
}
function saveMood() {
    let mood = document.getElementById("mood").value;

    if (mood === "") {
        alert("Please select a mood");
        return;
    }

    let user = JSON.parse(localStorage.getItem("mindcareUser"));

    if (!user) return;

    let key = "moods_" + user.email;

    let moods = JSON.parse(localStorage.getItem(key)) || [];

    moods.push(mood);

    localStorage.setItem(key, JSON.stringify(moods));

    displayMoods();
}

function displayMoods() {
    let moodHistory = document.getElementById("moodHistory");

    if (!moodHistory) return;

    let user = JSON.parse(localStorage.getItem("mindcareUser"));

    if (!user) return;

    let key = "moods_" + user.email;

    let moods = JSON.parse(localStorage.getItem(key)) || [];

    moodHistory.innerHTML = "";

    moods.forEach(function(mood) {
        let li = document.createElement("li");
        li.innerText = mood;
        moodHistory.appendChild(li);
    });
}

window.onload = function () {
    loadTheme();
    displayUserName();
    displayMoods();
    displayJournals();
    displayEmergencyContact();
    loadDashboard();
};

let breathingInterval;
let countdownInterval;
let breathingTimeouts = [];
let timeLeft = 60;

function getBreathingPattern() {
    const selectedMode = document.querySelector('input[name="breathingMode"]:checked');
    const mode = selectedMode ? selectedMode.value : "relax";

    const patterns = {
        relax: { inhale: 4000, hold: 4000, exhale: 4000, finalHold: 0 },
        calm: { inhale: 4000, hold: 7000, exhale: 8000, finalHold: 0 },
        focus: { inhale: 4000, hold: 4000, exhale: 4000, finalHold: 4000 }
    };

    return patterns[mode] || patterns.relax;
}

function setBreathingPhase(phase) {
    const circle = document.getElementById("circle");
    const progress = document.querySelector(".breath-progress span");

    if (!circle) return;

    circle.classList.remove("inhale", "hold", "exhale", "complete");

    if (phase) {
        circle.classList.add(phase);
    }

    if (progress) {
        progress.classList.remove("inhale", "hold", "exhale", "complete");

        if (phase) {
            progress.classList.add(phase);
        }
    }
}

function clearBreathingTimers() {
    clearInterval(breathingInterval);
    clearInterval(countdownInterval);

    breathingTimeouts.forEach(function(timeout) {
        clearTimeout(timeout);
    });

    breathingTimeouts = [];
}

function startBreathingSession() {
    const circle = document.getElementById("circle");
    const breathText = document.getElementById("breathText");
    const timer = document.getElementById("timer");

    if (!circle || !breathText || !timer) return;

    clearBreathingTimers();

    if (timeLeft <= 0) {
        timeLeft = 60;
        timer.innerText = timeLeft + " sec";
    }

    function cycleBreathing() {
        const pattern = getBreathingPattern();
        const cycleLength = pattern.inhale + pattern.hold + pattern.exhale + pattern.finalHold;

        breathText.innerText = "Inhale";
        setBreathingPhase("inhale");
        circle.classList.add("grow");

        breathingTimeouts.push(setTimeout(() => {
            breathText.innerText = "Hold";
            setBreathingPhase("hold");
        }, pattern.inhale));

        breathingTimeouts.push(setTimeout(() => {
            breathText.innerText = "Exhale";
            setBreathingPhase("exhale");
            circle.classList.remove("grow");
        }, pattern.inhale + pattern.hold));

        if (pattern.finalHold > 0) {
            breathingTimeouts.push(setTimeout(() => {
                breathText.innerText = "Hold";
                setBreathingPhase("hold");
            }, pattern.inhale + pattern.hold + pattern.exhale));
        }

        return cycleLength;
    }

    const cycleLength = cycleBreathing();

    breathingInterval = setInterval(cycleBreathing, cycleLength);

    countdownInterval = setInterval(() => {
        timeLeft--;
        timer.innerText = timeLeft + " sec";

        if (timeLeft <= 0) {
            stopBreathingSession();
        }
    }, 1000);
}

function stopBreathingSession() {
    clearBreathingTimers();

    const breathText = document.getElementById("breathText");

    if (breathText) {
        breathText.innerText = "Session Complete";
    }

    setBreathingPhase("complete");
}

function resetBreathingSession() {
    clearBreathingTimers();

    timeLeft = 60;

    const circle = document.getElementById("circle");
    const breathText = document.getElementById("breathText");
    const timer = document.getElementById("timer");

    if (circle) {
        circle.classList.remove("grow");
    }

    if (breathText) {
        breathText.innerText = "Ready";
    }

    if (timer) {
        timer.innerText = timeLeft + " sec";
    }

    setBreathingPhase("");
}
function saveJournal() {
    let entry = document.getElementById("journalEntry").value;

    if (entry.trim() === "") {
        alert("Please write something");
        return;
    }

    let user = JSON.parse(localStorage.getItem("mindcareUser"));

    if (!user) return;

    let key = "journals_" + user.email;

    let journals = JSON.parse(localStorage.getItem(key)) || [];

    let journalData = {
        text: entry,
        date: new Date().toLocaleString()
    };

    journals.push(journalData);

    localStorage.setItem(key, JSON.stringify(journals));

    document.getElementById("journalEntry").value = "";

    displayJournals();
}

function displayJournals() {
    let journalHistory = document.getElementById("journalHistory");

    if (!journalHistory) return;

    let user = JSON.parse(localStorage.getItem("mindcareUser"));

    if (!user) return;

    let key = "journals_" + user.email;

    let journals = JSON.parse(localStorage.getItem(key)) || [];

    journalHistory.innerHTML = "";

    journals.forEach(function(journal) {
        let div = document.createElement("div");
        div.classList.add("journal-card");

        div.innerHTML = `
            <p>${journal.text}</p>
            <small>${journal.date}</small>
        `;

        journalHistory.appendChild(div);
    });
}
function saveEmergencyContact() {
    let name = document.getElementById("contactName").value;
    let number = document.getElementById("contactNumber").value;

    if (name.trim() === "" || number.trim() === "") {
        alert("Please enter contact details");
        return;
    }

    let user = JSON.parse(localStorage.getItem("mindcareUser"));

    if (!user) return;

    let key = "emergencyContact_" + user.email;

    let contact = {
        name: name,
        number: number
    };

    localStorage.setItem(key, JSON.stringify(contact));

    displayEmergencyContact();
}

function displayEmergencyContact() {
    let savedContact = document.getElementById("savedContact");
    let callButton = document.getElementById("callButton");

    if (!savedContact || !callButton) return;

    let user = JSON.parse(localStorage.getItem("mindcareUser"));

    if (!user) return;

    let key = "emergencyContact_" + user.email;

    let contact = JSON.parse(localStorage.getItem(key));

    if (contact) {
        savedContact.innerText =
            contact.name + " - " + contact.number;

        callButton.href = "tel:" + contact.number;
    }
}
function loginUser() {
    let username = document.getElementById("username").value.trim();
    let email = document.getElementById("email").value.trim();

    if (username === "" || email === "") {
        alert("Please fill all fields");
        return;
    }

    if (!email.includes("@") || !email.includes(".")) {
        alert("Enter a valid email");
        return;
    }

    let user = {
        name: username,
        email: email
    };

    localStorage.setItem("mindcareUser", JSON.stringify(user));

    window.location.href = "home.html";
}
function displayUserName() {
    let user = JSON.parse(localStorage.getItem("mindcareUser"));

    let welcomeUser = document.getElementById("welcomeUser");

    if (user && welcomeUser) {
        welcomeUser.innerText = "Welcome, " + user.name;
    }
}

function logoutUser() {
    localStorage.removeItem("mindcareUser");

    window.location.href = "index.html";
}
function sendMessage() {
    let input = document.getElementById("userInput").value.trim();
    let chatBox = document.getElementById("chatBox");

    if (input === "") return;

    let userMessage = document.createElement("p");
    userMessage.innerHTML = "<strong>You:</strong> " + input;
    chatBox.appendChild(userMessage);

    let botReply = getBotResponse(input);

    let botMessage = document.createElement("p");
    botMessage.innerHTML = "<strong>Bot:</strong> " + botReply;
    chatBox.appendChild(botMessage);

    document.getElementById("userInput").value = "";

    chatBox.scrollTop = chatBox.scrollHeight;
}

function getBotResponse(input) {
    input = input.toLowerCase();

    if (input.includes("stress")) {
        return "Try taking deep breaths and use the breathing exercise module.";
    }

    if (input.includes("anxiety")) {
        return "Break tasks into smaller parts and focus on one step at a time.";
    }

    if (input.includes("sad")) {
        return "Writing in your journal may help process your feelings.";
    }

    if (input.includes("lonely")) {
        return "Reach out to someone you trust or use emergency support.";
    }

    if (input.includes("exam")) {
        return "Exam pressure is normal. Plan your study time and take breaks.";
    }

    return "I am here for you. Tell me more about how you feel.";
}
function loadDashboard() {
    let user = JSON.parse(localStorage.getItem("mindcareUser"));

    if (!user) return;

    let moods =
        JSON.parse(localStorage.getItem("moods_" + user.email)) || [];

    let journals =
        JSON.parse(localStorage.getItem("journals_" + user.email)) || [];

    let totalMoods = document.getElementById("totalMoods");
    let totalJournals = document.getElementById("totalJournals");
    let latestMood = document.getElementById("latestMood");

    if (totalMoods) {
        totalMoods.innerText = moods.length;
    }

    if (totalJournals) {
        totalJournals.innerText = journals.length;
    }

    if (latestMood && moods.length > 0) {
        latestMood.innerText = moods[moods.length - 1];
    }
}
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
}

function loadTheme() {
    let theme = localStorage.getItem("theme");

    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    }
}

