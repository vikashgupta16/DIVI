let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");
let reloadTimeout;

// Free API Keys (Replace with your own keys)
const WEATHER_API_KEY = 'your_openweathermap_key'; // Get from https://openweathermap.org/api
const NEWS_API_KEY = '71f23061c3fe47bd9634278e4962e066'; // Get from https://newsapi.org/

function speak(text) {
    let text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.pitch = 1;
    text_speak.volume = 1;
    text_speak.lang = "en-US"; // Changed to English for broader compatibility
    text_speak.addEventListener('end', resetInactivityTimer);
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

let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new SpeechRecognition();

recognition.onresult = (event) => {
    let currentIndex = event.resultIndex;
    let transcript = event.results[currentIndex][0].transcript;
    content.innerText = transcript;
    takeCommand(transcript.toLowerCase());
    resetInactivityTimer();
};

btn.addEventListener("click", () => {
    checkMicrophonePermission().then(() => {
        recognition.start();
        voice.style.display = "block";
        btn.style.display = "none";
        resetInactivityTimer();
    }).catch(() => {
        speak("Please enable microphone access to continue");
    });
});

function takeCommand(message) {
    voice.style.display = "none";
    btn.style.display = "flex";

    if (message.includes("hello") || message.includes("hey")) {
        speak("Hello sir, what can I help you with?");
    } else if (message.includes("who are you")) {
        speak("I am your virtual assistant, created using modern web technologies");
    } else if (message.includes("open youtube")) {
        speak("Opening YouTube...");
        window.open("https://youtube.com/", "_blank");
    } else if (message.includes("open google")) {
        speak("Opening Google...");
        window.open("https://google.com/", "_blank");
    } else if (message.includes("time")) {
        let time = new Date().toLocaleTimeString();
        speak(`The current time is ${time}`);
    } else if (message.includes("date")) {
        let date = new Date().toLocaleDateString();
        speak(`Today's date is ${date}`);
    } else if (message.includes("weather in")) {
        let location = message.split("in")[1].trim();
        getWeather(location);
    } else if (message.includes("news")) {
        getNews();
    } else if (message.includes("joke")) {
        tellJoke();
    } else {
        let searchQuery = message.replace("divi", "").trim();
        if (searchQuery) {
            speak(`Searching for ${searchQuery}`);
            window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
        }
    }
    resetInactivityTimer();
}

// Free Weather API
function getWeather(location) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${WEATHER_API_KEY}&units=metric`)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                let weather = `Current weather in ${data.name}: ${data.weather[0].description}, 
                    Temperature: ${Math.round(data.main.temp)}°C, 
                    Humidity: ${data.main.humidity}%`;
                speak(weather);
            } else {
                speak("Sorry, I couldn't find that location");
            }
        })
        .catch(() => speak("Unable to fetch weather information"));
}

// Free News API
function getNews() {
    fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWS_API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.articles && data.articles.length > 0) {
                let news = data.articles.slice(0, 3).map((article, index) => 
                    `News ${index + 1}: ${article.title}`).join('. ');
                speak(`Here are the top news headlines: ${news}`);
            } else {
                speak("No news articles found");
            }
        })
        .catch(() => speak("Unable to fetch news at the moment"));
}

// Free Joke API
function tellJoke() {
    fetch("https://v2.jokeapi.dev/joke/Any?safe-mode")
        .then(response => response.json())
        .then(data => {
            if (data.joke) {
                speak(data.joke);
            } else if (data.setup && data.delivery) {
                speak(`${data.setup} ... ${data.delivery}`);
            } else {
                speak("Why don't scientists trust atoms? Because they make up everything!");
            }
        })
        .catch(() => speak("What do you call fake spaghetti? An impasta!"));
}

function checkMicrophonePermission() {
    return navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            stream.getTracks().forEach(track => track.stop());
            return true;
        });
}

function resetInactivityTimer() {
    clearTimeout(reloadTimeout);
    reloadTimeout = setTimeout(() => {
        speak("Inactivity detected. Refreshing...");
        setTimeout(() => location.reload(), 2000);
    }, 15000);
}

// Initialize inactivity timer on load
resetInactivityTimer();