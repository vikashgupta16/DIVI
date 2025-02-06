let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");

function speak(text) {
    let text_speak = new SpeechSynthesisUtterance(text);
    let voices = window.speechSynthesis.getVoices();

    function setVoice() {
        voices = window.speechSynthesis.getVoices();
        let selectedVoice = voices.find(v => v.name.toLowerCase().includes('male')) || voices[0];
        text_speak.voice = selectedVoice;
        text_speak.rate = 1;
        text_speak.pitch = 1;
        text_speak.volume = 1;
        window.speechSynthesis.speak(text_speak);
    }

    if (voices.length > 0) {
        setVoice();
    } else {
        window.speechSynthesis.onvoiceschanged = setVoice;
    }
}

function wishMe() {
    let hours = new Date().getHours();
    let greeting = hours < 12 ? "Good Morning Sir" : hours < 16 ? "Good Afternoon Sir" : "Good Evening Sir";
    speak(greeting);
}

window.speechSynthesis.onvoiceschanged = wishMe;
window.onload = wishMe;

let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();

recognition.onresult = (event) => {
    let transcript = event.results[event.resultIndex][0].transcript;
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
        .catch(() => alert("Microphone access is required. Please allow it in browser settings."));
});

function takeCommand(message) {
    voice.style.display = "none";
    btn.style.display = "flex";

    const commands = {
        "hello": "Hello sir, what can I help you?",
        "who are you": "I am a virtual assistant, created by Vikash Gupta",
        "what is your name": "My name is Dav",
        "what is your date of birth": "I was generated on January 4, 2025, created by Vikash Gupta",
        "open youtube": "https://youtube.com/",
        "open google": "https://google.com/",
        "open facebook": "https://facebook.com/",
        "open instagram": "https://instagram.com/",
        "open whatsapp": "https://web.whatsapp.com/",
        "open chatgpt": "https://chatgpt.com/",
        "open deepseek": "https://www.deepseek.com/"
    };

    for (let key in commands) {
        if (message.includes(key)) {
            if (commands[key].startsWith("http")) {
                speak(`Opening ${key.split(" ")[1]}...`);
                window.open(commands[key], "_blank");
            } else {
                speak(commands[key]);
            }
            return;
        }
    }

    if (message.includes("time")) {
        speak(new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric" }));
    } else if (message.includes("date")) {
        speak(new Date().toLocaleDateString(undefined, { day: "numeric", month: "short" }));
    } else {
        let searchQuery = message.replace("dav", "").trim();
        speak(`This is what I found on the internet regarding ${searchQuery}`);
        window.open(`https://www.google.com/search?q=${searchQuery}`, "_blank");
    }
}

function checkMicrophonePermission() {
    return navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            stream.getTracks().forEach(track => track.stop());
        });
}

let inactivityTimeout;
function resetInactivityTimer() {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => location.reload(), 60000);
}
