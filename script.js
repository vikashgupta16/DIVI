let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");

function speak(text) {
    let text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.pitch = 1;
    text_speak.volume = 1;
    text_speak.lang = "hi-GB";
    window.speechSynthesis.speak(text_speak);
}

function wishMe() {
    let day = new Date();
    let hours = day.getHours();
    let greeting;
    if (hours >= 0 && hours < 12) {
        greeting = "Good Morning Sir";
    } else if (hours >= 12 && hours < 16) {
        greeting = "Good Afternoon Sir";
    } else {
        greeting = "Good Evening Sir";
    }
    speak(greeting);
}
window.onload = wishMe;

let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();

recognition.onresult = (event) => {
    let currentIndex = event.resultIndex;
    let transcript = event.results[currentIndex][0].transcript;
    content.innerText = transcript;
    takeCommand(transcript.toLowerCase());
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
        speak("Hello sir, what can I help you with?");
    } else if (message.includes("who are you")) {
        speak("I am a virtual assistant, created by Vikash Gupta");
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
        window.open("whatsapp://");
    } else if (message.includes("time")) {
        let time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
        speak(time);
    } else if (message.includes("date")) {
        let date = new Date().toLocaleString(undefined, { day: "numeric", month: "short" });
        speak(date);
    } else if (message.includes("weather in")) {
        let location = message.split("in")[1].trim();
        getWeather(location);
    } else if (message.includes("tell me a joke")) {
        tellJoke();
    } else {
        let finalText = "This is what I found on the internet regarding " + message.replace("divi", "");
        speak(finalText);
        window.open(`https://www.google.com/search?q=${message.replace("divi", "")}`, "_blank");
    }
}

function getWeather(location) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=your_api_key&units=metric`)
        .then(response => response.json())
        .then(data => {
            let weather = `The weather in ${location} is ${data.weather[0].description} with a temperature of ${data.main.temp} degrees Celsius.`;
            speak(weather);
        })
        .catch(() => speak("Sorry, I couldn't fetch the weather information."));
}

function tellJoke() {
    fetch("https://official-joke-api.appspot.com/jokes/random")
        .then(response => response.json())
        .then(data => {
            let joke = `${data.setup} ... ${data.punchline}`;
            speak(joke);
        })
        .catch(() => speak("Sorry, I couldn't fetch a joke for you."));
}
