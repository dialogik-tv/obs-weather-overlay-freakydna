(function() {
    const channel = 'Freakydna';
    const weatherIcons = {
        "Few clouds": "broken-clouds.png",
        "Broken clouds": "broken-clouds.png",
        "Clear sky": "sun.png",
        "Overcast clouds": "scattered-clouds.png",
        "Light snow": "snow.png",
        "Light rain": "rain.png",
        "Haze": "haze.png",
        "Scattered clouds": "scattered-clouds.png"
    }

    // Connect to chat
    const { chat } = new window.TwitchJs({ channel });
    chat.connect().then(() => {
        chat.join(channel);
    });

    const handleMessage = message => {
        if(message.event == 'PRIVMSG') {
            if(
                message.message.startsWith("!wetter") &&
                (message.tags.badges.broadcaster === '1' || message.tags.badges.moderator === '1')
            ) {
                // Determine requested weather location
                let location = "Phnom Penh";
                if(message.message.includes(" ")) {
                    const parts = message.message.split(" ");
                    location = parts[1];
                }
                const weatherUrl = encodeURI(`https://api.scorpstuff.com/weather.php?units=metric&city=${location}`);
                fetch(`https://cors-anywhere.herokuapp.com/${weatherUrl}`)
                .then(response => response.text()).then(text => {
                    // Parse data
                    const data = parseWeatherData(text);
                    console.log(data);

                    // Display city (if not default)
                    const locationHolder = document.getElementById('location-value');
                    if(location !== 'Phnom Penh') {
                        locationHolder.innerText = `${data.location.city} (${data.location.country})`;
                    } else {
                        locationHolder.innerText = '';
                    }

                    // Map HTML fields
                    const temperatureHolder = document.getElementById('temperature-value');
                    const windHolder = document.getElementById('wind-value');
                    const humidityHolder = document.getElementById('humidity-value');

                    // Display data
                    temperatureHolder.innerText = parseInt(data.temperature.c);
                    windHolder.innerText = parseInt(data.wind.speed.kph);
                    humidityHolder.innerText = parseInt(data.humidity);

                    // Justify compass needle
                    const degrees = {
                        "North": -45,
                        "North-East": 0,
                        "East": 45,
                        "South-East": 90,
                        "South": 135,
                        "South-West": 180,
                        "West": 225,
                        "North-West": 270
                    }
                    const windIcon = document.getElementById('wind-icon');
                    windIcon.style.transform = `rotate(${degrees[data.wind.direction]}deg)`;

                    // Set weather icon
                    let weatherIcon = "broken-clouds.png";
                    if(weatherIcons.hasOwnProperty(data.weather)) {
                        weatherIcon = weatherIcons[data.weather];
                    }
                    const weatherIconHolder = document.getElementById('weather-icon');
                    weatherIconHolder.src = `img/${weatherIcon}`;

                    const label = document.getElementById('label');
                    label.classList.add('visible');
                    setTimeout(function() {
                        label.classList.remove('visible');
                    }, 10000);
                })
                .catch(function (err) {
                    console.error('Fehler!', err);
                });
            }
        }
    };

    // Listen for all events.
    chat.on(TwitchJs.Chat.Events.ALL, handleMessage);
})();

function parseWeatherData(text) {
    const matches = text.match(/Weather for (.*), (\S+): (.*) with a temperature of (-?[0-9]*\.?[0-9]* C) \((-?[0-9]+.?[0-9]+ F)\)\. Wind is blowing from the (.*) at (-?[0-9]*\.?[0-9]* kph) \((-?[0-9]*\.?[0-9]* mph)\) and the humidity is (-?[0-9]*\.?[0-9]*%)/i);
    return {
        location: {
            city: matches[1],
            country: matches[2]
        },
        weather: matches[3],
        temperature: {
            c: matches[4],
            f: matches[5]
        },
        wind: {
            direction: matches[6],
            speed: {
                kph: matches[7],
                mph: matches[8]
            }
        },
        humidity: matches[9]
    };
}