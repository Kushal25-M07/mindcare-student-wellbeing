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

    let moods = JSON.parse(localStorage.getItem("moods")) || [];

    moods.push(mood);

    localStorage.setItem("moods", JSON.stringify(moods));

    displayMoods();
}

function displayMoods() {
    let moodHistory = document.getElementById("moodHistory");

    if (!moodHistory) return;

    let moods = JSON.parse(localStorage.getItem("moods")) || [];

    moodHistory.innerHTML = "";

    moods.forEach(function(mood) {
        let li = document.createElement("li");
        li.innerText = mood;
        moodHistory.appendChild(li);
    });
}

window.onload = function () {
    displayUserName();
    displayMoods();
    displayJournals();
    displayEmergencyContact();
};

let breathingInterval;
let countdownInterval;
let timeLeft = 60;

function startBreathingSession() {
    const circle = document.getElementById("circle");
    const breathText = document.getElementById("breathText");
    const timer = document.getElementById("timer");

    if (!circle || !breathText || !timer) return;

    function cycleBreathing() {
        breathText.innerText = "Inhale";
        circle.classList.add("grow");

        setTimeout(() => {
            breathText.innerText = "Hold";
        }, 4000);

        setTimeout(() => {
            breathText.innerText = "Exhale";
            circle.classList.remove("grow");
        }, 7000);
    }

    cycleBreathing();

    breathingInterval = setInterval(cycleBreathing, 10000);

    countdownInterval = setInterval(() => {
        timeLeft--;
        timer.innerText = timeLeft + " sec";

        if (timeLeft <= 0) {
            stopBreathingSession();
        }
    }, 1000);
}

function stopBreathingSession() {
    clearInterval(breathingInterval);
    clearInterval(countdownInterval);

    document.getElementById("breathText").innerText = "Session Complete";
}
function saveJournal() {
    let entry = document.getElementById("journalEntry").value;

    if (entry.trim() === "") {
        alert("Please write something");
        return;
    }

    let journals = JSON.parse(localStorage.getItem("journals")) || [];

    let journalData = {
        text: entry,
        date: new Date().toLocaleString()
    };

    journals.push(journalData);

    localStorage.setItem("journals", JSON.stringify(journals));

    document.getElementById("journalEntry").value = "";

    displayJournals();
}

function displayJournals() {
    let journalHistory = document.getElementById("journalHistory");

    if (!journalHistory) return;

    let journals = JSON.parse(localStorage.getItem("journals")) || [];

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

    let contact = {
        name: name,
        number: number
    };

    localStorage.setItem("emergencyContact", JSON.stringify(contact));

    displayEmergencyContact();
}

function displayEmergencyContact() {
    let savedContact = document.getElementById("savedContact");
    let callButton = document.getElementById("callButton");

    if (!savedContact || !callButton) return;

    let contact = JSON.parse(localStorage.getItem("emergencyContact"));

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

    let existingUser = JSON.parse(localStorage.getItem("mindcareUser"));

    if (existingUser && existingUser.email !== email) {
        localStorage.removeItem("moods");
        localStorage.removeItem("journals");
        localStorage.removeItem("emergencyContact");
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