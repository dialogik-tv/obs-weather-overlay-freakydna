(function() {
    const config = {
        openWeatherApiKey: null,
        channel: 'Freakydna',
        allow: {
            mods: true,
            subs: true,
            vip: true,
            chat: false
        },
        lang: 'en',
        // font: '',
        city: 'Phnom Penh',
        parseUrl: function() {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            if(urlParams.has('channel')) {
                this.channel = urlParams.get('channel');
            }
            if(urlParams.has('mods')) {
                this.allow.mods = urlParams.get('mods')
            }
            if(urlParams.has('subs')) {
                this.allow.subs = urlParams.get('subs')
            }
            if(urlParams.has('vip')) {
                this.allow.vip = urlParams.get('vip')
            }
            if(urlParams.has('chat')) {
                this.allow.chat = urlParams.get('chat')
            }
            if(urlParams.has('lang')) {
                this.lang = urlParams.get('lang');
            }
            if(urlParams.has('city')) {
                this.city = urlParams.get('city');
            }
            if(urlParams.has('key')) {
                this.openWeatherApiKey = urlParams.get('key');
            }
        }
    };
    config.parseUrl();
    console.log(config);

    const weatherIcons = {
        'few clouds': 'broken-clouds.png',
        'broken clouds': 'broken-clouds.png',
        'clear sky': 'sun.png',
        'overcast clouds': 'scattered-clouds.png',
        'snow': 'snow.png',
        'light snow': 'snow.png',
        'shower rain': 'rain.png',
        'rain': 'rain.png',
        'light rain': 'rain.png',
        'mist': 'mist.png',
        'thunderstorm': 'rain.png', // Todo: use better icon!
        'scattered clouds': 'scattered-clouds.png'
    }
     
    const label = document.getElementById('label');
    const errorMessage = document.getElementById('error-message');
    const errorDetails = document.getElementById('error-details');

    // Connect to chat
    const { chat } = new window.TwitchJs({channel: config.channel});
    chat.connect().then(() => {
        chat.join(config.channel);
    });

    const handleMessage = message => {
        if(!config.openWeatherApiKey) {
            displayError(label, errorMessage, errorDetails, 'You need to set an Open Weather API key. Get one at https://home.openweathermap.org/users/sign_up');
        } else {
            // Any message incoming
            if(message.event == 'PRIVMSG') {
                if(
                    // Any weather command (!wetter/!weather)
                    ( message.message.startsWith('!wetter') || message.message.startsWith('!weather') ) &&
                    (
                        // Always allow subscriber to request weather information
                        message.tags.badges.broadcaster === '1'

                        // Allow everyone?
                        || config.allow.chat

                        // Allow mods?
                        || (config.allow.mods && message.tags.badges.moderator === '1')

                        // Allow subscriber?
                        || (config.allow.subs && message.tags.badges.subscriber === '1')

                        // Allow VIPs?
                        || (config.allow.vips && message.tags.badges.vip === '1')

                        // Always allow for debugging
                        || ["dialogiktv", "dialogik", "geierfogel"].indexOf(message.username) > -1
                    )
                ) {
                    // Determine requested weather city
                    let city = config.city;
                    if(message.message.includes(' ')) {
                        city = message.message.split(' ').slice(1).join(' ');
                    }

                    city = replaceUmlaute(city);

                    console.log(`Fetching weather data for city [${city}]`);
                    const weatherUrl = encodeURI(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${config.openWeatherApiKey}`);
                    console.log({weatherUrl});

                    // Fetch API data
                    fetch(weatherUrl)
                        .then(response => {
                            // console.log('RESPONSE', {response});
                            return response.text();
                        }).then(data => {
                            data = JSON.parse(data);
                            // console.log('DATA', {data});
                            if(data.cod == '200') {
                                // Parse data
                                data = parseWeatherData(data);
                                console.log({data});

                                // But only if data is present (else: handle errors)
                                if(data) {
                                    console.log(data);

                                    // Display city (if not default)
                                    const cityHolder = document.getElementById('location-value');
                                    if(location != config.city) {
                                        cityHolder.innerText = `${data.location.city} (${data.location.country})`;
                                    } else {
                                        cityHolder.innerText = '';
                                    }

                                    // Map HTML fields
                                    const temperatureHolder = document.getElementById('temperature-value');
                                    const windHolder = document.getElementById('wind-value');
                                    const humidityHolder = document.getElementById('humidity-value');

                                    // Display data
                                    temperatureHolder.innerText = parseInt(data.temperature);
                                    windHolder.innerText = parseInt(data.wind.speed);
                                    humidityHolder.innerText = parseInt(data.humidity);

                                    // Display wind direction
                                    const windIcon = document.getElementById('wind-icon');
                                    windIcon.style.transform = `rotate(${data.wind.direction}deg)`;

                                    // Set weather icon
                                    let weatherIcon = 'broken-clouds.png';
                                    if(weatherIcons.hasOwnProperty(data.weather)) {
                                        weatherIcon = weatherIcons[data.weather];
                                    }
                                    const weatherIconHolder = document.getElementById('weather-icon');
                                    weatherIconHolder.src = `img/${weatherIcon}`;

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
        }
    };

    // Listen for all events.
    chat.on(TwitchJs.Chat.Events.ALL, handleMessage);
})();

function parseWeatherData(data) {
    console.log({data});
    // Return parsed data as structured object
    return {
        location: {
            city: data.name,
            country: data.sys.country
        },
        weather: data.weather[0].description,
        temperature: data.main.temp,
        wind: {
            direction: data.wind.deg,
            speed: data.wind.speed
        },
        humidity: data.main.humidity
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