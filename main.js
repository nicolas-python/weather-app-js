const search_button = document.getElementById("search_button");
const city_name = document.getElementById("city_name");
const API_KEY = "165dd84d9346892c4d057d6d1265ad33";
const weather_translation =
    {
    "clear sky":
    {
        icon: "☀️",
        text: "Klarer Himmel"
    },

    "few clouds":
    {
        icon: "🌤️",
        text: "Wenige Wolken"
    },

    "broken clouds":
    {
        icon: "☁️",
        text: "Viele Wolken"
    },

    "overcast clouds":
    {
        icon: "☁️",
        text: "Bedeckter Himmel"
    },

    "scattered clouds":
    {
    icon: "⛅",
    text: "Aufgelockerte Wolken"
    },

    "light rain":
    {
        icon: "🌦️",
        text: "Leichter Regen"
    },

    "moderate rain":
    {
        icon: "🌧️",
        text: "Mäßiger Regen"
    },

    "heavy intensity rain":
    {
        icon: "🌧️",
        text: "Starker Regen"
    },

    "thunderstorm":
    {
        icon: "⛈️",
        text: "Gewitter"
    },

    "snow":
    {
        icon: "❄️",
        text: "Schnee"
    },

    "mist":
    {
        icon: "🌫️",
        text: "Nebel"
    }
};

city_name.addEventListener("keydown", function(event)
{
    if (event.key === "Enter")
    {
        searchWeather();
    }
});

search_button.addEventListener("click", function()
{
    searchWeather();
});

function searchWeather()
{
    document.getElementById("city_name");

    const city = city_name.value.trim().toLowerCase();

    if (city === "")
    {
        alert("Bitte eine Stadt eingeben");
        return;
    }

    if (!isNaN(city))
    {
        alert("Bitte einen gültigen Stadtnamen eingeben");
        return;
    }

    checkCity(city);
}

function proposedCityName(city)
{
    return city
        .normalize("NFD")                       /* zerlegt Sonderzeichen in Buchstabe + Akzent, um sie vergleichbar zu machen */
        .replace(/[\u0300-\u036f]/g, "")        /* entfernt Akzente/Markierungen */
        .replace("ō", "o");                     /* ersetzt spezielles Zeichen ō durch normales o extra für Ōsaka  */
}

function levenshteinDistance(word1, word2)
{
    let matrix = [];            /* Matrix = Tabelle */

    for (let i = 0; i <= word1.length; i = i + 1)
    {
        matrix.push([]);        /* push fügt eine neue leere Zeile zur Matrix hinzu */
    }

    for (let i = 0; i <= word1.length; i = i + 1)
    {
        matrix[i][0] = i;       /* erste Spalte mit Löschkosten füllen */
    }

    for (let j = 0; j <= word2.length; j = j + 1)
    {
        matrix[0][j] = j;       /* j läuft durch die Spalten und füllt die erste Zeile */
    }

    for (let i = 1; i <= word1.length; i = i + 1)
    {
        for (let j = 1; j <= word2.length; j = j + 1)
        {
            console.log(word1[i - 1], word2[j - 1]);
        }
    }
    console.log(matrix);
}
levenshteinDistance("Haus", "Maus");


function checkCity(city)
{
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`)
        .then(response => response.json())

        .then(data =>
        {
            if (data.length > 0)
            {
                if (proposedCityName(data[0].name.toLowerCase()) === city)
                {
                    loadWeather(data[0].name);
                }
                else
                {
                    findCitySuggestion(city);
                }
            }
            else
            {
                findCitySuggestion(city);
            }
        });
}

function loadWeather(city)
{
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`)
        .then(response => {

                if (!response.ok)
                {
                throw new Error("Stadt nicht gefunden. Bitte überprüfe die Schreibweise.");
                }
                return response.json();
                })

            .then(data => {

            const weatherCondition = data.weather[0].main;
            changeBackground(weatherCondition);

            document.getElementById("city").textContent = data.name;
            document.getElementById("details").textContent = "Details";
            document.getElementById("weather_info").style.display = "block";
            document.getElementById("weather_details").style.display = "block";

            const temperature = data.main.temp - 273.15;                                                        /*-273.15 = unterschied zwischen Kelvin und Celsius */
            document.getElementById("temperature").textContent = `${temperature.toFixed(1)} °C`;    /* .toFixed(1) = eine Nachkommastelle */

            const feelsLike = data.main.feels_like - 273.15;
            document.getElementById("feels_like").textContent = `Gefühlt wie: ${feelsLike.toFixed(1)} °C`;

            const weather = data.weather[0].description;
            const currentWeather = weather_translation[weather] ||      /*|| = Nimm links, wenn es existiert. Sonst nimm rechts.*/
            {
                icon: "",                   /* Unbekannte Wetterbegriffe also API-Text übernehmen ohne Icon anzeigen */
                text: weather
            };

            document.getElementById("weather").textContent = `${currentWeather.icon} ${currentWeather.text}`;

            if (data.rain)
            {
            document.getElementById("rain").textContent = `${data.rain["1h"]} mm Regen`;
            }
            else
            {
            document.getElementById("rain").textContent = "Kein Regen";
            }

            document.getElementById("humidity").textContent = `${data.main.humidity}% Luftfeuchtigkeit`;

            const sunrise = new Date(data.sys.sunrise * 1000);   /* *1000 = weil OpenWeather liefert Sekunden, JavaScript erwartet Millisekunden*/
            document.getElementById("sunrise").textContent = `Sonnenaufgang ${sunrise.toLocaleTimeString("de-DE")}`;

            const sunnoon = new Date(data.sys.sunrise * 1000 + (data.sys.sunset * 1000 - data.sys.sunrise * 1000) / 2);
            document.getElementById("sunnoon").textContent = `Sonnenhöchststand ${sunnoon.toLocaleTimeString("de-DE")}`;

            const sunset = new Date(data.sys.sunset * 1000);
            document.getElementById("sunset").textContent =`Sonnenuntergang ${sunset.toLocaleTimeString("de-DE")}`;
            document.getElementById("sun_info").style.display = "flex";

            document.getElementById("wind").textContent = `${data.wind.speed} m/s Windgeschwindigkeit`;
            })
            .catch(error =>
            {
                findCitySuggestion(city);
            });
}

function findCitySuggestion(city)
{
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`)
        .then(response => response.json())

        .then(data =>
        {
            const suggestion = document.getElementById("city_suggestions");

            suggestion.textContent = "";

            if (data.length > 0)
            {
                const button = document.createElement("button");

                button.textContent =
                "Meinten Sie: " + data[0].name + "?";

                button.addEventListener("click", function()
                {
                    city_name.value = data[0].name;
                    loadWeather(data[0].name);

                    suggestion.textContent = "";
                });

                suggestion.appendChild(button);
            }
            else
            {
                suggestion.textContent = "Keine passende Stadt gefunden";
            }
        });
}

const background_images =
{
    "Sunny":"backgrounds/sunny.png",
    "Clear":"backgrounds/clear_sky.png",
    "Clouds":"backgrounds/broken_clouds.png",
    "Rain":"backgrounds/rain.png",
    "Heavy Rain":"backgrounds/heavy_rain.png",
    "Snow":"backgrounds/snow.png",
    "Thunderstorm":"backgrounds/thunderstorm.png",
    "Mist":"backgrounds/mist.png"
};

function changeBackground(weatherCondition)
{
    const background = background_images[weatherCondition];

    if (background)
    {
        document.body.style.backgroundImage = `url('${background}')`;     /* Fügt den gespeicherten Bildpfad in die CSS background-image URL ein,
                                                                          durch den Template String können Variablen mit ${} direkt in den Text eingesetzt werden */
    }
    else
    {
        document.body.style.backgroundImage = "url('background/background.png')";
    }
}
