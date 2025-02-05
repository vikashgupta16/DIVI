let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");

function speak(text) {
    let text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.pitch = 1;
    text_speak.volume = 1;
    window.speechSynthesis.speak(text_speak);
}

function wishMe() {
    let day = new Date();
    let hours = day.getHours();
    if (hours >= 0 && hours < 12) {
        speak("Good Morning Sir");
    } else if (hours >= 12 && hours < 16) {
        speak("Good Afternoon Sir");
    } else {
        speak("Good Evening Sir");
    }
}
window.onload = wishMe;

let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();

let inactivityTimeout;
let reloadTimeout;

recognition.onresult = (event) => {
    let currentIndex = event.resultIndex;
    let transcript = event.results[currentIndex][0].transcript;
    content.innerText = transcript;
    takeCommand(transcript.toLowerCase());

    resetInactivityTimer();
};

btn.addEventListener("click", () => {
    checkMicrophonePermission()
        .then(() => {
            recognition.start();
            voice.style.display = "block";
            btn.style.display = "none";
        })
        .catch(() => {
            alert("Microphone access is required for this feature. Please allow microphone access in your browser settings.");
        });
});

function takeCommand(message) {
    voice.style.display = "none";
    btn.style.display = "flex";

    if (message.includes("hello") || message.includes("hey") || message.includes("hi") || message.includes("hii")) {
        speak("Hello sir, what can I help you?");
    } else if (message.includes("hello dav") || message.includes("hey dav") || message.includes("hi dav")) {
        speak("Hello sir, what can I help you?");
    } else if (message.includes("who are you")) {
        speak("I am a virtual assistant, created by Vikash Gupta");
    } else if (message.includes("what is your name")) {
        speak("My name is Dav");
    } else if (message.includes("what is your date of birth")) {
        speak("I was generated on January 4, 2025, created by Vikash Gupta");
    } else if (message.includes("open youtube")) {
        speak("Opening YouTube...");
        window.open("https://youtube.com/", "_blank");
    } else if (message.includes("open google")) {
        speak("Opening Google...");
        window.open("https://google.com/", "_blank");
    } else if (message.includes("open facebook")) {
        speak("Opening Facebook...");
        window.open("https://facebook.com/", "_blank");
    } else if (message.includes("open instagram")) {
        speak("Opening Instagram...");
        window.open("https://instagram.com/", "_blank");
    } else if (message.includes("open calculator")) {
        speak("Opening calculator...");
        window.open("calculator://");
    } else if (message.includes("open whatsapp")) {
        speak("Opening WhatsApp...");
        window.open("https://web.whatsapp.com/");
    } else if (message.includes("open chatgpt")) {
        speak("Opening ChatGPT...");
        window.open("https://chatgpt.com/", "_blank");
    } else if (message.includes("open deepseek")) {
        speak("Opening DeepSeek...");
        window.open("https://www.deepseek.com/", "_blank");
    } else if (message.includes("time")) {
        let time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
        speak(time);
    } else if (message.includes("date")) {
        let date = new Date().toLocaleString(undefined, { day: "numeric", month: "short" });
        speak(date);
    } else {
        let finalText = "This is what I found on the internet regarding " + (message.replace("dav", "") || message.replace("dav", ""));
        speak(finalText);
        window.open(`https://www.google.com/search?q=${message.replace("dav", "")}`, "_blank");
    }
}

// Check for microphone permission
function checkMicrophonePermission() {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                resolve();
                // Close the stream to release the microphone
                stream.getTracks().forEach(track => track.stop());
            })
            .catch(() => {
                reject();
            });
    });
}

// Inactivity timeout management
function resetInactivityTimer() {
    // Clear previous timeouts if any
    clearTimeout(inactivityTimeout);
    clearTimeout(reloadTimeout);

    // Set a new inactivity timeout (1 minute)
    inactivityTimeout = setTimeout(() => {
        reloadPage();
    }, 60000); // Reload after 1 minute of inactivity

    // Also reset another timeout for 15 seconds inactivity from microphone
    reloadTimeout = setTimeout(() => {
        reloadPage();
    }, 15000); // Reload after 15 seconds of inactivity from microphone
}

// Reload the page
function reloadPage() {
    location.reload(); // Reload the page
}
