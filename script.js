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

    let user = JSON.parse(localStorage.getItem("mindcareUser"));

    if (user) {
        localStorage.setItem("stress_" + user.email, JSON.stringify({
            result: result,
            total: total,
            date: formatDateKey(new Date())
        }));
    }
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

    moods.push({
        mood: mood,
        date: formatDateKey(new Date())
    });

    localStorage.setItem(key, JSON.stringify(moods));

    updateActivityStreak("mood");
    displayMoods();
}

function getMoodText(moodEntry) {
    return typeof moodEntry === "string" ? moodEntry : moodEntry.mood;
}

function getMoodDate(moodEntry) {
    return typeof moodEntry === "string" ? "" : moodEntry.date;
}

function formatDateKey(date) {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function getUserStreakKey() {
    let user = JSON.parse(localStorage.getItem("mindcareUser"));

    return user ? "streaks_" + user.email : "";
}

function getDaysBetween(previousDate, currentDate) {
    let previous = new Date(previousDate + "T00:00:00");
    let current = new Date(currentDate + "T00:00:00");

    return Math.round((current - previous) / 86400000);
}

function getUserStreaks() {
    let key = getUserStreakKey();

    if (!key) return {};

    return JSON.parse(localStorage.getItem(key)) || {};
}

function saveUserStreaks(streaks) {
    let key = getUserStreakKey();

    if (!key) return;

    localStorage.setItem(key, JSON.stringify(streaks));
}

function updateActivityStreak(activity) {
    let today = formatDateKey(new Date());
    let streaks = getUserStreaks();
    let current = streaks[activity] || {
        count: 0,
        lastDate: ""
    };

    if (current.lastDate === today) {
        saveUserStreaks(streaks);
        return current.count;
    }

    if (current.lastDate && getDaysBetween(current.lastDate, today) === 1) {
        current.count++;
    } else {
        current.count = 1;
    }

    current.lastDate = today;
    streaks[activity] = current;
    saveUserStreaks(streaks);

    return current.count;
}

function getCurrentActivityStreak(activity) {
    let today = formatDateKey(new Date());
    let streaks = getUserStreaks();
    let current = streaks[activity];

    if (!current || !current.lastDate) return 0;

    let daysBetween = getDaysBetween(current.lastDate, today);

    if (daysBetween <= 1) return current.count;

    current.count = 0;
    streaks[activity] = current;
    saveUserStreaks(streaks);

    return 0;
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
        let moodText = getMoodText(mood);
        let moodDate = getMoodDate(mood);

        li.innerText = moodDate ? moodText + " - " + moodDate : moodText;
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
            updateActivityStreak("breathing");
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

    updateActivityStreak("journal");
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

function getMoodValue(moodText) {
    if (!moodText) return 60;

    if (moodText.includes("Happy")) return 100;
    if (moodText.includes("Calm")) return 90;
    if (moodText.includes("Neutral")) return 70;
    if (moodText.includes("Sad")) return 45;
    if (moodText.includes("Stressed")) return 30;
    if (moodText.includes("Angry")) return 25;

    return 60;
}

function getUniqueDatedEntries(entries) {
    let dates = new Set();

    entries.forEach(function(entry) {
        if (entry.date) {
            dates.add(entry.date.split(",")[0]);
        }
    });

    return dates.size;
}

function getStressScore(stressData) {
    if (!stressData || !stressData.result) return 70;

    if (stressData.result.includes("Low")) return 100;
    if (stressData.result.includes("Moderate")) return 65;
    if (stressData.result.includes("High")) return 30;

    return 70;
}

function getWellnessLevel(score) {
    if (score >= 80) return "Strong";
    if (score >= 60) return "Balanced";
    if (score >= 40) return "Needs care";

    return "Needs support";
}

function updateWellnessScore(user, moods, journals) {
    const scoreElement = document.getElementById("wellnessScore");
    const ring = document.getElementById("wellnessRing");
    const moodStability = document.getElementById("moodStability");
    const stressStatus = document.getElementById("stressStatus");
    const focusHabit = document.getElementById("focusHabit");

    if (!scoreElement || !ring || !moodStability || !stressStatus || !focusHabit) return;

    const recentMoods = moods.slice(-7);
    const moodAverage = recentMoods.length
        ? recentMoods.reduce(function(total, mood) {
            return total + getMoodValue(getMoodText(mood));
        }, 0) / recentMoods.length
        : 60;
    const moodScore = Math.round(moodAverage);
    const journalScore = Math.min(100, Math.round((getUniqueDatedEntries(journals) / 5) * 100));
    const focusStats = getFocusStats();
    const focusScore = Math.min(100, focusStats.completed * 25);
    const stressData = JSON.parse(localStorage.getItem("stress_" + user.email)) || null;
    const stressScore = getStressScore(stressData);
    const wellnessScore = Math.round(
        moodScore * 0.4 +
        journalScore * 0.2 +
        focusScore * 0.2 +
        stressScore * 0.2
    );

    scoreElement.innerText = wellnessScore + "%";
    ring.style.setProperty("--score", wellnessScore * 3.6 + "deg");
    ring.classList.remove("low", "medium", "high");
    ring.classList.add(wellnessScore >= 75 ? "high" : wellnessScore >= 50 ? "medium" : "low");

    moodStability.innerText = recentMoods.length ? getWellnessLevel(moodScore) : "Not enough data";
    stressStatus.innerText = stressData ? stressData.result.replace(/[^\w\s]/g, "").trim() : "Not recorded";
    focusHabit.innerText = focusStats.completed > 0
        ? focusStats.completed + " session" + (focusStats.completed === 1 ? "" : "s") + " today"
        : "No sessions yet";
}

function renderStreakBadges(container, count) {
    if (!container) return;

    const milestones = [3, 7, 30];

    container.innerHTML = "";

    milestones.forEach(function(milestone) {
        const badge = document.createElement("span");
        badge.innerText = milestone + "d";

        if (count >= milestone) {
            badge.classList.add("active");
        }

        container.appendChild(badge);
    });
}

function updateStreakDashboard() {
    const streakItems = [
        { activity: "mood", valueId: "moodStreak", badgesId: "moodStreakBadges" },
        { activity: "journal", valueId: "journalStreak", badgesId: "journalStreakBadges" },
        { activity: "breathing", valueId: "breathingStreak", badgesId: "breathingStreakBadges" },
        { activity: "focus", valueId: "focusSessionStreak", badgesId: "focusSessionStreakBadges" }
    ];

    streakItems.forEach(function(item) {
        const value = document.getElementById(item.valueId);
        const badges = document.getElementById(item.badgesId);

        if (!value) return;

        const count = getCurrentActivityStreak(item.activity);

        value.innerText = count + " day" + (count === 1 ? "" : "s");
        renderStreakBadges(badges, count);
    });
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
function getChatTimestamp() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function createChatMessage(sender, message) {
    let row = document.createElement("div");
    let bubble = document.createElement("div");
    let text = document.createElement("p");
    let time = document.createElement("time");

    row.className = "message-row " + sender;
    bubble.className = "message-bubble";
    text.innerText = message;
    time.innerText = getChatTimestamp();

    bubble.appendChild(text);
    bubble.appendChild(time);
    row.appendChild(bubble);

    return row;
}

function createTypingIndicator() {
    let row = document.createElement("div");
    let bubble = document.createElement("div");

    row.className = "message-row bot typing-row";
    bubble.className = "message-bubble typing-indicator";
    bubble.innerHTML = "<span></span><span></span><span></span>";
    row.appendChild(bubble);

    return row;
}

function scrollChatToLatest() {
    let chatBox = document.getElementById("chatBox");

    if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function useQuickReply(text) {
    let input = document.getElementById("userInput");

    if (!input) return;

    input.value = text;
    sendMessage();
}

function initializeChatbot() {
    let input = document.getElementById("userInput");
    let chatBox = document.getElementById("chatBox");

    if (!input || !chatBox) return;

    input.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    scrollChatToLatest();
}

function sendMessage() {
    let input = document.getElementById("userInput").value.trim();
    let chatBox = document.getElementById("chatBox");

    if (input === "") return;

    chatBox.appendChild(createChatMessage("user", input));

    let botReply = getBotResponse(input);
    let typingIndicator = createTypingIndicator();

    chatBox.appendChild(typingIndicator);

    document.getElementById("userInput").value = "";

    scrollChatToLatest();

    setTimeout(function() {
        typingIndicator.remove();
        chatBox.appendChild(createChatMessage("bot", botReply));
        scrollChatToLatest();
    }, 650);
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
        latestMood.innerText = getMoodText(moods[moods.length - 1]);
    }

    updateWellnessScore(user, moods, journals);
    updateStreakDashboard();
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

function getFocusStatsKey() {
    let user = JSON.parse(localStorage.getItem("mindcareUser"));

    return user ? "mindcareFocusStats_" + user.email : "mindcareFocusStats";
}

const focusDurations = {
    pomodoro: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
};

let focusMode = "pomodoro";
let focusTimeLeft = focusDurations.pomodoro;
let focusTimerInterval;
let focusIsRunning = false;

function formatFocusTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;

    return String(minutes).padStart(2, "0") + ":" + String(remainingSeconds).padStart(2, "0");
}

function getFocusStats() {
    let today = new Date().toDateString();
    let key = getFocusStatsKey();
    let stats = JSON.parse(localStorage.getItem(key)) || JSON.parse(localStorage.getItem("mindcareFocusStats")) || {
        date: today,
        completed: 0,
        streak: 0
    };

    if (stats.date !== today) {
        stats = {
            date: today,
            completed: 0,
            streak: stats.streak || 0
        };
        localStorage.setItem(key, JSON.stringify(stats));
    }

    return stats;
}

function saveFocusStats(stats) {
    localStorage.setItem(getFocusStatsKey(), JSON.stringify(stats));
}

function updateFocusStats() {
    const completed = document.getElementById("focusCompleted");
    const streak = document.getElementById("focusStreak");

    if (!completed || !streak) return;

    const stats = getFocusStats();

    completed.innerText = stats.completed;
    streak.innerText = stats.streak;
}

function updateFocusDisplay() {
    const time = document.getElementById("focusTime");
    const label = document.getElementById("focusModeLabel");
    const progress = document.getElementById("focusProgress");
    const message = document.getElementById("focusMessage");

    if (!time || !label || !progress || !message) return;

    const modeLabels = {
        pomodoro: "Pomodoro",
        short: "Short Break",
        long: "Long Break"
    };

    const total = focusDurations[focusMode];
    const elapsed = total - focusTimeLeft;
    const degrees = total > 0 ? (elapsed / total) * 360 : 0;

    time.innerText = formatFocusTime(focusTimeLeft);
    time.classList.remove("tick");
    void time.offsetWidth;
    time.classList.add("tick");
    label.innerText = modeLabels[focusMode];
    progress.style.setProperty("--progress", degrees + "deg");

    if (!focusIsRunning && focusTimeLeft === total) {
        message.innerText = focusMode === "pomodoro" ? "Ready when you are." : "Enjoy the reset.";
    }
}

function switchFocusMode(mode) {
    if (!focusDurations[mode]) return;

    clearInterval(focusTimerInterval);
    focusIsRunning = false;
    focusMode = mode;
    focusTimeLeft = focusDurations[mode];

    document.querySelectorAll(".focus-mode").forEach(function(button) {
        button.classList.toggle("active", button.dataset.mode === mode);
    });

    const focusCard = document.querySelector(".focus-card");

    if (focusCard) {
        focusCard.classList.remove("complete");
    }

    updateFocusDisplay();
}

function completeFocusSession() {
    clearInterval(focusTimerInterval);
    focusIsRunning = false;
    focusTimeLeft = 0;

    const message = document.getElementById("focusMessage");
    const focusCard = document.querySelector(".focus-card");

    if (message) {
        message.innerText = focusMode === "pomodoro" ? "Great work. Take a kind break." : "Break complete. You are ready.";
    }

    if (focusCard) {
        focusCard.classList.add("complete");
    }

    if (focusMode === "pomodoro") {
        const stats = getFocusStats();
        stats.completed++;
        stats.streak++;
        saveFocusStats(stats);
        updateActivityStreak("focus");
        updateFocusStats();
    }

    updateFocusDisplay();
}

function startFocusTimer() {
    const time = document.getElementById("focusTime");

    if (!time || focusIsRunning) return;

    if (focusTimeLeft <= 0) {
        focusTimeLeft = focusDurations[focusMode];
    }

    focusIsRunning = true;

    const message = document.getElementById("focusMessage");
    const focusCard = document.querySelector(".focus-card");

    if (message) {
        message.innerText = focusMode === "pomodoro" ? "Focus gently. One step at a time." : "Breathe, stretch, reset.";
    }

    if (focusCard) {
        focusCard.classList.remove("complete");
    }

    updateFocusDisplay();

    focusTimerInterval = setInterval(function() {
        focusTimeLeft--;

        if (focusTimeLeft <= 0) {
            completeFocusSession();
            return;
        }

        updateFocusDisplay();
    }, 1000);
}

function pauseFocusTimer() {
    const time = document.getElementById("focusTime");

    if (!time) return;

    clearInterval(focusTimerInterval);
    focusIsRunning = false;

    const message = document.getElementById("focusMessage");

    if (message && focusTimeLeft > 0) {
        message.innerText = "Paused. Return when ready.";
    }
}

function resetFocusTimer() {
    const time = document.getElementById("focusTime");

    if (!time) return;

    clearInterval(focusTimerInterval);
    focusIsRunning = false;
    focusTimeLeft = focusDurations[focusMode];

    const focusCard = document.querySelector(".focus-card");

    if (focusCard) {
        focusCard.classList.remove("complete");
    }

    updateFocusDisplay();
}

function initializeFocusTimer() {
    const focusTimer = document.getElementById("focusTime");

    if (!focusTimer) return;

    document.querySelectorAll(".focus-mode").forEach(function(button) {
        button.addEventListener("click", function() {
            switchFocusMode(button.dataset.mode);
        });
    });

    updateFocusDisplay();
    updateFocusStats();
}

initializeFocusTimer();

function getMoodEmoji(moodText) {
    if (!moodText) return "";

    if (moodText.includes("Happy")) return "😊";
    if (moodText.includes("Calm")) return "😌";
    if (moodText.includes("Sad")) return "😔";
    if (moodText.includes("Stressed")) return "😣";
    if (moodText.includes("Angry")) return "😡";
    if (moodText.includes("Neutral")) return "😐";

    return moodText.split(" ").pop();
}

function getMoodClass(moodText) {
    if (!moodText) return "";

    if (moodText.includes("Happy")) return "happy";
    if (moodText.includes("Calm")) return "calm";
    if (moodText.includes("Sad")) return "sad";
    if (moodText.includes("Stressed")) return "stressed";
    if (moodText.includes("Angry")) return "angry";
    if (moodText.includes("Neutral")) return "neutral";

    return "";
}

function renderMoodCalendar() {
    const grid = document.getElementById("moodCalendarGrid");
    const monthLabel = document.getElementById("calendarMonth");

    if (!grid || !monthLabel) return;

    const user = JSON.parse(localStorage.getItem("mindcareUser"));

    if (!user) return;

    const moods = JSON.parse(localStorage.getItem("moods_" + user.email)) || [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const moodByDate = {};

    moods.forEach(function(entry) {
        const date = getMoodDate(entry);

        if (date) {
            moodByDate[date] = getMoodText(entry);
        }
    });

    monthLabel.innerText = today.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });

    grid.innerHTML = "";

    for (let blank = 0; blank < firstDay.getDay(); blank++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-day empty";
        grid.appendChild(emptyCell);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dateKey = formatDateKey(date);
        const moodText = moodByDate[dateKey];
        const cell = document.createElement("div");
        const dayNumber = document.createElement("span");
        const emoji = document.createElement("strong");

        cell.className = "calendar-day";
        dayNumber.innerText = day;
        emoji.innerText = getMoodEmoji(moodText);

        if (moodText) {
            cell.classList.add("has-mood", getMoodClass(moodText));
            cell.title = moodText;
        }

        if (dateKey === formatDateKey(today)) {
            cell.classList.add("today");
        }

        cell.appendChild(dayNumber);
        cell.appendChild(emoji);
        grid.appendChild(cell);
    }
}

renderMoodCalendar();
initializeChatbot();
