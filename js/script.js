// const weatherIcons = {
//     "Broken clouds": "cloud.gif",
//     "Clear sky": "cloud.gif",
//     "Overcast clouds": "cloud.gif",
//     "Light snow": "cloud.gif",
//     "Light rain": "cloud.gif",
//     "Haze": "cloud.gif",
//     "Scattered clouds": "cloud.gif"
// }

(function() {
    const channel = 'dialogikTV';

    // Check if user comes from twitch authentication
    if(window.location.hash !== '') {
        // Remove twitch connect link
        const twitchConnector = document.getElementById('twitch-connector');
        twitchConnector.parentNode.removeChild(twitchConnector);

        // Extract token
        var hash = window.location.hash.split('#')[1].split('&')[0].split('=');
        var token = null;
        if(hash[0] == 'access_token') {
            var token = hash[1];

            // Remove token from URL
            history.pushState("", document.title, window.location.pathname);

            // Connect to chat
            const { chat } = new window.TwitchJs({ token, channel });
            chat.connect().then(() => {
                chat.join(channel);
            });

            const handleMessage = message => {
                if(message.event == 'PRIVMSG') {
                    if(
                        message.tags.badges.hasOwnProperty('broadcaster') &&
                        message.tags.badges.broadcaster === '1' &&
                        message.message === '!wetter'
                    ) {
                        const weatherUrl = encodeURI('https://api.scorpstuff.com/weather.php?units=metric&city="Phnom Penh"');
                        fetch(`https://cors-anywhere.herokuapp.com/${weatherUrl}`)
                        .then(response => response.text()).then(text => {
                            // Parse data
                            const data = parseWeatherData(text);
                            console.log(data);

                            // Map HTML fields
                            const temperatureHolder = document.getElementById('temperature-value');
                            const windHolder = document.getElementById('wind-value');
                            const humidityHolder = document.getElementById('humidity-value');

                            // Display data
                            temperatureHolder.innerText = parseInt(data.temperatureC);
                            windHolder.innerText = parseInt(data.windSpeedKPH);
                            humidityHolder.innerText = parseInt(data.humidity);

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
        }
    }
})();

function parseWeatherData(text) {
    const groups = text.match(/Weather for (.*), (\S+): (.*) with a temperature of (-?[0-9]*\.?[0-9]* C) \((-?[0-9]+.?[0-9]+ F)\)\. Wind is blowing from the (.*) at (-?[0-9]*\.?[0-9]* kph) \((-?[0-9]*\.?[0-9]* mph)\) and the humidity is (-?[0-9]*\.?[0-9]*%)/i);
    return {
        city: groups[1],
        country: groups[2],
        weather: groups[3],
        temperatureC: groups[4],
        temperatureF: groups[5],
        windDirection: groups[6],
        windSpeedKPH: groups[7],
        windSpeedMPH: groups[8],
        humidity: groups[9]
    };
}