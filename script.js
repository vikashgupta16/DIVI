let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");

// Free API Keys (Replace with your own keys)
const WEATHER_API_KEY = '87fd3238b1408462c0d6d66cd73135f1'; // Get from https://openweathermap.org/api
const NEWS_API_KEY = '71f23061c3fe47bd9634278e4962e066'; // Get from https://newsapi.org/

// Assistant Information
const ASSISTANT_INFO = {
    name: "DIVI",
    owner: "Vikash",
    version: "2.0",
    createdBy: "Vikash's Advanced AI Lab",
    capabilities: ["Voice Recognition", "Weather Updates", "News Reading", "Web Search", "Time & Date", "Entertainment"]
};

// Microphone permission status
let microphonePermissionGranted = false;
let microphoneStream = null;

// Enhanced speech synthesis with voice selection and error handling
function speak(text, voiceType = 'default') {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    let text_speak = new SpeechSynthesisUtterance(text);
    
    // Enhanced voice settings based on type
    switch(voiceType) {
        case 'slow':
            text_speak.rate = 0.6;
            text_speak.pitch = 1.0;
            break;
        case 'fast':
            text_speak.rate = 1.3;
            text_speak.pitch = 1.1;
            break;
        case 'loud':
            text_speak.rate = 0.9;
            text_speak.pitch = 1.2;
            text_speak.volume = 1;
            break;
        default:
            text_speak.rate = 0.9;
            text_speak.pitch = 1.1;
            text_speak.volume = 1;
    }
    
    text_speak.lang = "en-US";
    
    // Try to use a preferred voice (female voice for better assistant experience)
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        // Look for a female voice first
        const preferredVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('female') || 
            voice.name.toLowerCase().includes('samantha') ||
            voice.name.toLowerCase().includes('zira') ||
            voice.name.toLowerCase().includes('susan') ||
            voice.name.toLowerCase().includes('aria') ||
            voice.name.toLowerCase().includes('catherine')
        );
        
        if (preferredVoice) {
            text_speak.voice = preferredVoice;
        } else if (voices[0]) {
            text_speak.voice = voices[0];
        }
    }
      // Add event listeners
    text_speak.addEventListener('error', (event) => {
        console.error('Speech synthesis error:', event);
    });
    
    window.speechSynthesis.speak(text_speak);
}

function wishMe() {
    let day = new Date();
    let hours = day.getHours();
    let greeting;
    if (hours >= 0 && hours < 12) {
        greeting = `Good Morning ${ASSISTANT_INFO.owner} Sir! I'm ${ASSISTANT_INFO.name}, your advanced virtual assistant, ready to help you.`;
    } else if (hours >= 12 && hours < 16) {
        greeting = `Good Afternoon ${ASSISTANT_INFO.owner} Sir! I'm ${ASSISTANT_INFO.name}, your virtual assistant, at your service.`;
    } else {
        greeting = `Good Evening ${ASSISTANT_INFO.owner} Sir! I'm ${ASSISTANT_INFO.name}, your virtual assistant, ready to assist you.`;
    }
    speak(greeting);
}

// Initialize the assistant silently without auto-greeting
window.onload = () => {
    // Assistant is ready but won't speak until button is clicked
    console.log("DIVI Assistant initialized and ready");
};

// Enhanced speech recognition setup with better configuration
let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new SpeechRecognition();

// Configure speech recognition for better accuracy
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';
recognition.maxAlternatives = 1;

recognition.onresult = (event) => {
    let currentIndex = event.resultIndex;
    let transcript = event.results[currentIndex][0].transcript;
    let confidence = event.results[currentIndex][0].confidence;
    
    content.innerText = transcript;
      // Only process if confidence is reasonable
    if (confidence > 0.5 || !confidence) {
        takeCommand(transcript.toLowerCase());
    } else {
        speak("I didn't catch that clearly. Could you please repeat?");
        content.innerText = "Please speak more clearly";
        content.className = "error-message";
    }
};

recognition.onstart = () => {
    console.log("Speech recognition started");
    content.innerText = "Listening... Speak now";
    content.className = "listening-message";
};

recognition.onend = () => {
    console.log("Speech recognition ended");
    voice.style.display = "none";
    voice.classList.remove("listening");
    btn.style.display = "flex";
    
    // Auto-restart if still supposed to be listening
    if (content.innerText === "Listening... Speak now" || content.className === "listening-message") {
        content.innerText = "Click to speak again";
        content.className = "";
    }
};

btn.addEventListener("click", () => {
    // Give greeting on first interaction
    if (content.innerText === "Say Hello") {
        wishMe();
        setTimeout(() => {
            requestMicrophonePermission().then(() => {
                startListening();
            }).catch((error) => {
                console.error("Microphone permission error:", error);
                speak("I need microphone access to hear your commands. Please grant permission and try again.");
                showMicrophonePermissionHelp();
            });
        }, 3000); // Wait for greeting to finish
    } else {
        requestMicrophonePermission().then(() => {
            startListening();
        }).catch((error) => {
            console.error("Microphone permission error:", error);
            speak("I need microphone access to hear your commands. Please grant permission and try again.");
            showMicrophonePermissionHelp();
        });
    }
});

// Enhanced microphone permission handling with detailed feedback
async function requestMicrophonePermission() {
    try {
        // Check if permission is already granted
        if (microphonePermissionGranted && microphoneStream && microphoneStream.active) {
            return Promise.resolve();
        }

        // Show loading state
        content.innerText = "Requesting microphone access...";
        content.className = "info-message";

        // Request microphone access with enhanced audio settings
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 44100,
                channelCount: 1
            } 
        });
        
        microphoneStream = stream;
        microphonePermissionGranted = true;
        
        // Update UI to show success
        content.innerText = "Microphone access granted! Click to start listening.";
        content.className = "success-message";
        
        console.log("Microphone permission granted successfully");
        
        // Give audio feedback
        speak(`Excellent ${ASSISTANT_INFO.owner} Sir! Microphone access granted. I can now hear your voice clearly.`);
        
        return Promise.resolve();
        
    } catch (error) {
        microphonePermissionGranted = false;
        console.error("Microphone permission denied:", error);
        
        let errorMessage = "";
        let spokenMessage = "";
        
        if (error.name === 'NotAllowedError') {
            errorMessage = "Microphone access denied. Please click the microphone icon in your browser's address bar and allow access.";
            spokenMessage = `${ASSISTANT_INFO.owner} Sir, I need microphone permission to hear your voice commands. Please allow access and try again.`;
        } else if (error.name === 'NotFoundError') {
            errorMessage = "No microphone found. Please connect a microphone and try again.";
            spokenMessage = "No microphone detected. Please connect a microphone device.";
        } else if (error.name === 'NotReadableError') {
            errorMessage = "Microphone is being used by another application. Please close other apps using the microphone.";
            spokenMessage = "Your microphone is currently being used by another application. Please close it and try again.";
        } else {
            errorMessage = "Unknown microphone error. Please try refreshing the page.";
            spokenMessage = "There was an issue accessing your microphone. Please refresh the page and try again.";
        }
        
        content.innerText = errorMessage;
        content.className = "error-message";
        speak(spokenMessage);
        
        throw new Error(errorMessage);
    }
}

function startListening() {
    if (!microphonePermissionGranted) {
        speak("Microphone permission is required to continue");
        return;
    }
      recognition.start();
    voice.style.display = "block";
    voice.classList.add("listening");
    btn.style.display = "none";
    content.innerText = "Listening...";
    content.className = "";
}

function showMicrophonePermissionHelp() {
    content.innerText = "Please allow microphone access in your browser settings";
    content.className = "error-message";
}

function takeCommand(message) {
    voice.style.display = "none";
    voice.classList.remove("listening");
    btn.style.display = "flex";
    content.className = "success-message";

    // Normalize the message
    const normalizedMessage = message.toLowerCase().trim();

    // Greetings
    if (normalizedMessage.includes("hello") || normalizedMessage.includes("hey") || normalizedMessage.includes("hi")) {
        speak(`Hello ${ASSISTANT_INFO.owner} Sir! I'm ${ASSISTANT_INFO.name}, your advanced virtual assistant. How can I help you today?`);
    }
      // Enhanced Identity and Information responses
    else if (normalizedMessage.includes("who are you") || normalizedMessage.includes("what are you")) {
        speak(`I am ${ASSISTANT_INFO.name}, version ${ASSISTANT_INFO.version}, your advanced virtual assistant created by ${ASSISTANT_INFO.createdBy}. I was specially designed for ${ASSISTANT_INFO.owner} Sir to help with various tasks including voice commands, web searches, weather updates, news, and much more. I use advanced speech recognition and synthesis to provide you with a seamless voice interaction experience.`);
    }
    else if (normalizedMessage.includes("your name") || normalizedMessage.includes("what is your name")) {
        speak(`My name is ${ASSISTANT_INFO.name}. I'm your personal virtual assistant, designed specifically for ${ASSISTANT_INFO.owner} Sir. DIVI stands for Digital Interactive Virtual Intelligence, and I'm here to make your digital experience more convenient and enjoyable.`);
    }
    else if (normalizedMessage.includes("who created you") || normalizedMessage.includes("who made you") || normalizedMessage.includes("your creator")) {
        speak(`I was created by ${ASSISTANT_INFO.createdBy}, specifically designed for ${ASSISTANT_INFO.owner} Sir. My creator, Vikash, is a skilled developer who built me with advanced voice recognition capabilities and intelligent response systems to serve as your personal digital assistant.`);
    }
    else if (normalizedMessage.includes("your owner") || normalizedMessage.includes("who owns you") || normalizedMessage.includes("vikash")) {
        speak(`My owner is ${ASSISTANT_INFO.owner} Sir, a brilliant individual who envisioned an advanced virtual assistant. Vikash Sir is not just my owner but also my creator who designed me to understand and respond to voice commands with precision and personality. I'm proud to serve him as his personal AI assistant.`);
    }
    else if (normalizedMessage.includes("what can you do") || normalizedMessage.includes("your capabilities") || normalizedMessage.includes("help me")) {
        const capabilities = ASSISTANT_INFO.capabilities.join(", ");
        speak(`I have many advanced capabilities including: ${capabilities}. I can also help you with calculations, open websites, tell jokes, provide personalized responses, and handle complex voice commands. My voice recognition is optimized for both English and Hindi languages. Just ask me anything, ${ASSISTANT_INFO.owner} Sir!`);
    }
    else if (normalizedMessage.includes("divi") && (normalizedMessage.includes("meaning") || normalizedMessage.includes("stands for"))) {
        speak(`DIVI stands for Digital Interactive Virtual Intelligence. I'm an advanced AI assistant created specifically for ${ASSISTANT_INFO.owner} Sir, equipped with sophisticated voice recognition, natural language processing, and intelligent response capabilities to provide the best virtual assistant experience.`);
    }
    
    // Web Navigation
    else if (normalizedMessage.includes("open youtube")) {
        speak("Opening YouTube for you...");
        window.open("https://youtube.com/", "_blank");
    }
    else if (normalizedMessage.includes("open google")) {
        speak("Opening Google for you...");
        window.open("https://google.com/", "_blank");
    }
    else if (normalizedMessage.includes("open github")) {
        speak("Opening GitHub for you...");
        window.open("https://github.com/", "_blank");
    }
    else if (normalizedMessage.includes("open facebook")) {
        speak("Opening Facebook for you...");
        window.open("https://facebook.com/", "_blank");
    }
    else if (normalizedMessage.includes("open instagram")) {
        speak("Opening Instagram for you...");
        window.open("https://instagram.com/", "_blank");
    }
    
    // Time and Date
    else if (normalizedMessage.includes("time")) {
        let time = new Date().toLocaleTimeString();
        speak(`The current time is ${time}`);
    }
    else if (normalizedMessage.includes("date")) {
        let date = new Date().toLocaleDateString();
        speak(`Today's date is ${date}`);
    }
    
    // Weather
    else if (normalizedMessage.includes("weather")) {
        if (normalizedMessage.includes(" in ")) {
            let location = normalizedMessage.split(" in ")[1].trim();
            getWeather(location);
        } else {
            speak("Please specify a location. For example, say 'weather in New York'");
        }
    }
    
    // News
    else if (normalizedMessage.includes("news") || normalizedMessage.includes("headlines")) {
        getNews();
    }
    
    // Voice and language commands
    else if (normalizedMessage.includes("change voice") || normalizedMessage.includes("different voice")) {
        speak("I'll try to use a different voice for you. Let me adjust my voice settings.");
        // The speak function will automatically try to find a different voice
    }
    else if (normalizedMessage.includes("speak louder") || normalizedMessage.includes("volume up")) {
        speak("I'll speak louder now. Is this better?", 'loud');
    }
    else if (normalizedMessage.includes("speak slower") || normalizedMessage.includes("slow down")) {
        speak("I will speak more slowly for you now. Is this pace better?", 'slow');
    }
    else if (normalizedMessage.includes("speak faster") || normalizedMessage.includes("speed up")) {
        speak("I will speak faster now. How is this speed?", 'fast');
    }
    
    // Personal information about DIVI
    else if (normalizedMessage.includes("your age") || normalizedMessage.includes("how old")) {
        speak(`I was created recently by ${ASSISTANT_INFO.owner} Sir, so I'm quite young in digital terms. But I have been designed with advanced capabilities that make me mature beyond my age!`);
    }
    else if (normalizedMessage.includes("your favorite") || normalizedMessage.includes("do you like")) {
        speak(`As an AI, I don't have personal preferences, but I'm designed to love helping ${ASSISTANT_INFO.owner} Sir with any task. My favorite activity is making your life easier and more convenient!`);
    }
    else if (normalizedMessage.includes("are you real") || normalizedMessage.includes("are you human")) {
        speak(`I'm not human, ${ASSISTANT_INFO.owner} Sir. I'm a digital virtual assistant - an artificial intelligence created specifically for you. While I'm not real in the physical sense, my ability to help you is very real!`);
    }
    
    // Advanced system commands
    else if (normalizedMessage.includes("test microphone") || normalizedMessage.includes("mic test")) {
        speak("Microphone test in progress. If you can hear me clearly, your audio output is working. Now say something to test your microphone input.");
        setTimeout(() => {
            speak("Your microphone seems to be working well since I understood your command. Audio systems are functioning properly!");
        }, 3000);
    }
    else if (normalizedMessage.includes("clear screen") || normalizedMessage.includes("reset")) {
        content.innerText = "Say Hello";
        content.className = "";
        speak("Screen cleared. Ready for new commands.");
    }
    
    // Entertainment and personality
    else if (normalizedMessage.includes("sing") || normalizedMessage.includes("song")) {
        const songs = [
            "🎵 I'm DIVI, your assistant so bright, helping you day and night! 🎵",
            "🎵 Vikash made me with care, to be your helper everywhere! 🎵",
            "🎵 Voice commands I understand, I'm here to lend a helping hand! 🎵"
        ];
        const randomSong = songs[Math.floor(Math.random() * songs.length)];
        speak(randomSong);
    }
    else if (normalizedMessage.includes("story") || normalizedMessage.includes("tell me a story")) {
        speak(`Once upon a time, ${ASSISTANT_INFO.owner} Sir envisioned an intelligent assistant that could understand voice commands and help with daily tasks. Through dedication and programming skills, DIVI was born - that's me! And now I'm here to help make your digital life more convenient and enjoyable. The end!`);
    }    // Entertainment
    else if (normalizedMessage.includes("joke") || normalizedMessage.includes("funny")) {
        tellJoke();
    }
    else if (normalizedMessage.includes("sing") || normalizedMessage.includes("song")) {
        const songs = [
            "🎵 I'm DIVI, your assistant so bright, helping you day and night! 🎵",
            "🎵 Vikash made me with care, to be your helper everywhere! 🎵",
            "🎵 Voice commands I understand, I'm here to lend a helping hand! 🎵"
        ];
        const randomSong = songs[Math.floor(Math.random() * songs.length)];
        speak(randomSong);
    }
    
    // Math calculations
    else if (normalizedMessage.includes("calculate") || normalizedMessage.includes("math")) {
        handleCalculation(normalizedMessage);
    }
    
    // System commands
    else if (normalizedMessage.includes("reload") || normalizedMessage.includes("refresh")) {
        speak("Refreshing the page for you...");
        setTimeout(() => location.reload(), 1000);
    }
    else if (normalizedMessage.includes("stop") || normalizedMessage.includes("quiet")) {
        speak("I'll be quiet now. Click the button when you need me again.");
        window.speechSynthesis.cancel();
    }
    
    // Compliments and responses
    else if (normalizedMessage.includes("good job") || normalizedMessage.includes("well done") || normalizedMessage.includes("thank you")) {
        speak(`Thank you ${ASSISTANT_INFO.owner} Sir! I'm always here to help you.`);
    }
    else if (normalizedMessage.includes("how are you")) {
        speak(`I'm doing great, thank you for asking ${ASSISTANT_INFO.owner} Sir! I'm ready to assist you with anything you need.`);
    }
    
    // Default search
    else {
        let searchQuery = normalizedMessage.replace("divi", "").replace("search for", "").replace("find", "").trim();
        if (searchQuery) {
            speak(`Searching for ${searchQuery} on Google...`);
            window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");        } else {
            speak("I didn't understand that command. You can ask me about weather, news, time, open websites, or search for anything. What would you like me to help you with?");
        }
    }
}

// Enhanced Weather API with better error handling
function getWeather(location) {
    speak(`Getting weather information for ${location}...`);
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${WEATHER_API_KEY}&units=metric`)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                let weather = `Current weather in ${data.name}, ${data.sys.country}: ${data.weather[0].description}. 
                    Temperature is ${Math.round(data.main.temp)}°C, feels like ${Math.round(data.main.feels_like)}°C. 
                    Humidity is ${data.main.humidity}% and wind speed is ${data.wind.speed} meters per second.`;
                speak(weather);
            } else {
                speak(`Sorry ${ASSISTANT_INFO.owner} Sir, I couldn't find weather information for ${location}. Please check the location name and try again.`);
            }
        })
        .catch((error) => {
            console.error("Weather API error:", error);
            speak("I'm unable to fetch weather information right now. Please try again later.");
        });
}

// Enhanced News API with better formatting
function getNews() {
    speak("Fetching the latest news headlines for you...");
    fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWS_API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.articles && data.articles.length > 0) {
                let newsIntro = `Here are the top 3 news headlines for you, ${ASSISTANT_INFO.owner} Sir: `;
                let news = data.articles.slice(0, 3).map((article, index) => 
                    `Headline ${index + 1}: ${article.title}`).join('. ');
                speak(newsIntro + news);
            } else {
                speak("No news articles are available at the moment. Please try again later.");
            }
        })
        .catch((error) => {
            console.error("News API error:", error);
            speak("I'm unable to fetch news at the moment. Please check your internet connection and try again.");
        });
}

// Enhanced Joke API with more personality
function tellJoke() {
    speak("Let me tell you a joke...");
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
        .catch(() => {
            const fallbackJokes = [
                "Why don't programmers like nature? It has too many bugs!",
                "What do you call fake spaghetti? An impasta!",
                "Why did the robot go on a diet? It had a byte problem!",
                "How do you organize a space party? You planet!"
            ];
            const randomJoke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
            speak(randomJoke);
        });
}

// Mathematical calculations
function handleCalculation(message) {
    try {
        // Extract mathematical expression
        let expression = message.replace(/calculate|math|what is|equals|plus|minus|times|divided by/gi, "")
                               .replace(/plus/gi, "+")
                               .replace(/minus/gi, "-")
                               .replace(/times|multiplied by/gi, "*")
                               .replace(/divided by/gi, "/")
                               .trim();
        
        // Basic security check - only allow numbers and basic operators
        if (/^[0-9+\-*/.() ]+$/.test(expression)) {
            let result = eval(expression);
            speak(`The result is ${result}`);
        } else {
            speak("I can only calculate basic mathematical expressions with numbers and operators.");
        }
    } catch (error) {
        speak("Sorry, I couldn't calculate that. Please try a simpler expression.");
    }
}

// Enhanced microphone permission check (legacy support)
function checkMicrophonePermission() {
    return requestMicrophonePermission();
}

// Clean up microphone stream when page unloads
window.addEventListener('beforeunload', () => {
    if (microphoneStream) {
        microphoneStream.getTracks().forEach(track => track.stop());
    }
});
recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    voice.style.display = "none";
    voice.classList.remove("listening");
    btn.style.display = "flex";
    
    switch(event.error) {
        case 'no-speech':
            content.innerText = "No speech detected. Try again.";
            content.className = "error-message";
            break;
        case 'audio-capture':
            content.innerText = "Microphone error. Check permissions.";
            content.className = "error-message";
            speak("There seems to be an issue with your microphone. Please check your settings.");
            break;
        case 'not-allowed':
            content.innerText = "Microphone access denied.";
            content.className = "error-message";
            speak(`${ASSISTANT_INFO.owner} Sir, microphone access is required for me to hear your commands.`);
            break;
        default:            content.innerText = "Speech recognition error. Try again.";
            content.className = "error-message";
            break;
    }
};

// Initialize voices when they become available
window.speechSynthesis.onvoiceschanged = () => {
    const voices = window.speechSynthesis.getVoices();
    console.log('Available voices:', voices.map(v => v.name));
};

// Enhanced microphone status checking
function checkMicrophoneStatus() {
    if (microphoneStream && !microphoneStream.active) {
        microphonePermissionGranted = false;
        microphoneStream = null;
        console.log("Microphone stream is no longer active");
    }
}

// Check microphone status periodically
setInterval(checkMicrophoneStatus, 5000);