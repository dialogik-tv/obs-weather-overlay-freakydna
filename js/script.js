(function() {
    const channel = 'dialogikTV';
    const weatherIcons = {
        'Few clouds': 'broken-clouds.png',
        'Broken clouds': 'broken-clouds.png',
        'Clear sky': 'sun.png',
        'Overcast clouds': 'scattered-clouds.png',
        'Light snow': 'snow.png',
        'Light rain': 'rain.png',
        'Haze': 'haze.png',
        'Scattered clouds': 'scattered-clouds.png'
    }
    
    const temperatureHolder = document.getElementById('temperature-value');
    const errorMessage = document.getElementById('error-message');
    const errorDetails = document.getElementById('error-details');

    // Connect to chat
    const { chat } = new window.TwitchJs({ channel });
    chat.connect().then(() => {
        chat.join(channel);
    });

    const handleMessage = message => {
        if(message.event == 'PRIVMSG') {
            if(
                message.message.startsWith('!wetter') &&
                (
                    message.tags.badges.broadcaster === '1'
                    || message.tags.badges.moderator === '1'
                    || ["dialogiktv", "dialogik", "geierfogel"].indexOf(message.username) > -1
                )
            ) {
                // Determine requested weather location
                let location = 'Phnom Penh';
                if(message.message.includes(' ')) {
                    location = message.message.split(' ').slice(1).join(' ');
                }

                location = replaceUmlaute(location);

                console.log(`Fetching weather data for location [${location}]`);
                const weatherUrl = encodeURI(`https://weather-api-cors-proxy.herokuapp.com/weather.php?city=${location}`);
                console.log({weatherUrl});
                
                // Fetch API data
                fetch(weatherUrl)
                    .then(response => {
                        return response.text();
                    }).then(text => {
                        if(!text.includes("ERROR")) {
                            // Parse data
                            const data = parseWeatherData(text);

                            // But only if data is present (else: handle errors)
                            if(data) {
                                console.log(data);

                                // Display city (if not default)
                                const locationHolder = document.getElementById('location-value');
                                if(location !== 'Phnom Penh') {
                                    locationHolder.innerText = `${data.location.city} (${data.location.country})`;
                                } else {
                                    locationHolder.innerText = '';
                                }

                                // Map HTML fields
                                const windHolder = document.getElementById('wind-value');
                                const humidityHolder = document.getElementById('humidity-value');

                                // Display data
                                temperatureHolder.innerText = parseInt(data.temperature.c);
                                windHolder.innerText = parseInt(data.wind.speed.kph);
                                humidityHolder.innerText = parseInt(data.humidity);

                                // Justify compass needle
                                const degrees = {
                                    'North': -45,
                                    'North-East': 0,
                                    'East': 45,
                                    'South-East': 90,
                                    'South': 135,
                                    'South-West': 180,
                                    'West': 225,
                                    'North-West': 270
                                }
                                const windIcon = document.getElementById('wind-icon');
                                windIcon.style.transform = `rotate(${degrees[data.wind.direction]}deg)`;

                                // Set weather icon
                                let weatherIcon = 'broken-clouds.png';
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
                            }
                        } else {
                            displayError(label, errorMessage, errorDetails, text);
                        }
                    })

                    // Catch errors
                    .catch(function(e) {
                        displayError(label, errorMessage, errorDetails, e);
                    });
            }
        }
    };

    // Listen for all events.
    chat.on(TwitchJs.Chat.Events.ALL, handleMessage);
})();

function parseWeatherData(text) {
    const matches = text.match(/Weather for (.*), (\S+): (.*) with a temperature of (-?[0-9]*\.?[0-9]* C) \((-?[0-9]+.?[0-9]+ F)\)\. Wind is blowing from the (.*) at (-?[0-9]*\.?[0-9]* kph) \((-?[0-9]*\.?[0-9]* mph)\) and the humidity is (-?[0-9]*\.?[0-9]*%)/i);

    // Handle errors
    if(matches === null) {
        return false;
    }

    // Or return data as structured object
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

function displayError(label, errorMessage, errorDetails, error = null) {
    if(error !== null) {
        console.error('An error occured', error);
        if(typeof error == "string") {
            errorDetails.innerText = error;
        } else if(typeof error == "object" && error.hasOwnProperty("message")) {
            errorDetails.innerText = error.message;
        }
    }
    label.classList.add('error');
    errorMessage.innerText = 'Fehler... :(';
    label.classList.add('visible');
    setTimeout(function() {
        label.classList.remove('visible');
        setTimeout(function() {
            label.classList.remove('error');
        }, 1000);
    }, 3000);
}

function replaceUmlaute(value) {
    value = value.replace(/Ä/g, 'Ae');
    value = value.replace(/Ö/g, 'Oe');
    value = value.replace(/Ü/g, 'Ue');
    value = value.replace(/ä/g, 'ae');
    value = value.replace(/ö/g, 'oe');
    value = value.replace(/ü/g, 'ue');
    value = value.replace(/ß/g, 'ss');
    return value;
}