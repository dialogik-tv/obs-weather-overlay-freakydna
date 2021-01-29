# OBS Weather Overlay

This is an OBS overlay that shows current weather information or any other city in the world, triggered by the Twitch Chat commands `!weather <city>` or `!wetter <city>` (German for *weather*). There are [several parameters](#customization) that can be passed in the URL to customize the overlay.

This overlay project is dedicated to [Freakydna](https://www.twitch.tv/Freakydna), a loyal viewer and subscriber of our [Twitch channel](https://www.twitch.tv/dialogikTV), where he requested this overlay development as a reward redemption for his collected channel points.

## Setting up the overlay for your Twitch channel

1. Pass your channel name via the `channel` parameter to the overlay URL
2. [Get an API key from the Open Weather API](https://home.openweathermap.org/users/sign_up) and also pass it to the URL via the `key` paramter as in this example.

    ```
    https://dialogik-tv.github.io/twitchchat-weather-obs-overlay?channel=dialogikTV&key=1a2b3c4d5e6f7g8h9i0j
    ```

## Customization

You can customize the look of your overlay by passing more parameters to the overlay URL (*don't use `<` or `>`!*):

    <url_as_above>?channel=<you>&key=<key>&city=<city>&mods=<0/1>&subs=<0/1>&vip=<0/1>&chat=<0/1>

* `city` - Using a different default city, default `Phnom Penh` (see above).
* `mods` - Allow channel moderators to use the `!weather`/`!wetter` commands. `1` to allow or `0` to disallow, default `1`.
* `subs` - Allow channel subscribers to use the commands, default `1`.
* `vip` - Allow VIPs to use the commands, default `1`.
* `chat` - Allow anyone in the chat to use the commands, default `0`. Note that if you set this to `1`, settings for mod, sub and vip are overwritten.

### Planned customization features

* `font` - Using a custom Google font.
* `color` - Use a different color scheme.

## Attribution

* [Cloud Day](https://www.flaticon.com/free-icon/cloudy-day_3814929) by [Freepik](https://www.flaticon.com/authors/freepik)
* [Cloudy Day](https://www.flaticon.com/free-icon/cloudy-day_3814858) by [Freepik](https://www.flaticon.com/authors/freepik)
* [Compass](https://www.flaticon.com/free-icon/compass_660333) by [Smashicons](https://www.flaticon.com/authors/smashicons)
* [Haze](https://www.flaticon.com/free-icon/haze_727789) by [Pixel perfect](https://www.flaticon.com/authors/pixel-perfect)
* [Humidity](https://www.flaticon.com/free-icon/humidity_727790) by [Pixel perfect](https://www.flaticon.com/authors/pixel-perfect)
* [Rain](https://www.flaticon.com/free-icon/rain_3815058) by [Freepik](https://www.flaticon.com/authors/freepik)
* [Snowflake](https://www.flaticon.com/free-icon/snowflake_3815117) by [Freepik](https://www.flaticon.com/authors/freepik)
* [Sunny](https://www.flaticon.com/free-icon/sunny_3815245) by [Freepik](https://www.flaticon.com/authors/freepik)
