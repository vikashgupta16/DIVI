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
        speak("Good afternoon Sir");
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
    recognition.start();
    voice.style.display = "block";
    btn.style.display = "none";
});

function takeCommand(message) {
    voice.style.display = "none";
    btn.style.display = "flex";

    if (message.includes("hello") || message.includes("hey")) {
        speak("hello sir,what can i help you?");
    } else if (message.includes("hello dav") || message.includes("hey dav") || message.includes("hi dav")) {
        speak("hello sir, what can I help you?");
    } else if (message.includes("who are you")) {
        speak("i am virtual assistant ,created by Vikash Gupta");
    } else if (message.includes("what is your name")) {
        speak("My name is dav");
    } else if (message.includes("what is date of birth")) {
        speak("i was genrated on four january two thoushnad twenty five ,created by Vikash Gupta");
    } else if (message.includes("open youtube")) {
        speak("opening youtube...");
        window.open("https://youtube.com/", "_blank");
    } else if (message.includes("open google")) {
        speak("opening google...");
        window.open("https://google.com/", "_blank");
    } else if (message.includes("open facebook")) {
        speak("opening facebook...");
        window.open("https://facebook.com/", "_blank");
    } else if (message.includes("open instagram")) {
        speak("opening instagram...");
        window.open("https://instagram.com/", "_blank");
    } else if (message.includes("open calculator")) {
        speak("opening calculator..");
        window.open("calculator://");
    } else if (message.includes("open whatsapp")) {
        speak("opening whatsapp..");
        window.open("https://web.whatsapp.com/");
    } else if (message.includes("open chatgpt")) {
        speak("opening chatgpt..");
        window.open("https://chatgpt.com/", "_blank");
    } else if (message.includes("open deepseek")) {
        speak("opening deepseek..");
        window.open("https://www.deepseek.com/", "_blank");
    } else if (message.includes("time")) {
        let time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
        speak(time);
    } else if (message.includes("date")) {
        let date = new Date().toLocaleString(undefined, { day: "numeric", month: "short" });
        speak(date);
    } else {
        let finalText = "this is what i found on internet regarding " + (message.replace("dav", "") || message.replace("dav", ""));
        speak(finalText);
        window.open(`https://www.google.com/search?q=${message.replace("dav", "")}`, "_blank");
    }
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
