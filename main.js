const search_button = document.getElementById("search_button");
const city_name = document.getElementById("city_name");
const API_KEY = "165dd84d9346892c4d057d6d1265ad33";
let cities = [];
let citiesLoaded = false;
let selectedSuggestion = null;

async function loadCities()
{
    const response = await fetch("data/cities.txt");
    const text = await response.text();

    const lines = text.split("\n");

    cities = lines.map(line =>
    {
        const parts = line.split("\t");
        return parts[1]?.toLowerCase();
    }).filter(Boolean);


    citiesLoaded = true;
}

loadCities();

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
        if (selectedSuggestion)
        {
            city_name.value = selectedSuggestion;
            loadWeather(selectedSuggestion);

            document.getElementById("city_suggestions").textContent = "";
            selectedSuggestion = null;
        }
        else
        {
            searchWeather();
        }
    }
});

search_button.addEventListener("click", function()
{
    searchWeather();
});

function searchWeather()
{
    console.log("Suche gestartet");
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


    if (!citiesLoaded)
    {
        alert("Städte werden noch geladen. Bitte kurz warten.");
        return;
    }


    checkCity(city);
}
/* Normalisiert Städtenamen für Vergleiche */
/* aktuell nicht aktiv, da cities.txt bereits kleine Schreibweise nutzt*/
function proposedCityName(city)
{
    return city
        .normalize("NFD")                       /* zerlegt Sonderzeichen in Buchstabe + Akzent, um sie vergleichbar zu machen */
        .replace(/[\u0300-\u036f]/g, "")        /* entfernt Akzente/Markierungen */
        .replace("ō", "o");                     /* ersetzt spezielles Zeichen ō durch normales o extra für Ōsaka */
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
        if (word1[i - 1] === word2[j - 1])
        {
            matrix[i][j] = matrix[i - 1][j - 1];
        }
        else
        {
            matrix[i][j] = Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]) + 1;
        }
      }
    }
    return matrix[word1.length][word2.length];
}

function findLocalCitySuggestion(input)
{
    let bestCity = "";
    let smallestDistance = Infinity;


    cities.forEach(function(city)
    {
        const distance = levenshteinDistance(city, input);

        if (distance < smallestDistance)
        {
            smallestDistance = distance;
            bestCity = city;
        }
    });

    if (smallestDistance <= 2)
    {
        return bestCity;
    }

    return null;
}

function checkCity(city)
{
    const suggestionBox = document.getElementById("city_suggestions");
    suggestionBox.textContent = "";

    const suggestion = findLocalCitySuggestion(city);


    if (suggestion)
    {
        selectedSuggestion = suggestion;
        const button = document.createElement("button");

        button.textContent = "Meinten Sie: " + formatCityName(suggestion) + "?";


        button.onclick = function()
        {
            city_name.value = formatCityName(suggestion);
            loadWeather(suggestion);

            document.getElementById("city_suggestions").textContent = "";
        }
        suggestionBox.appendChild(button);
    }

    else
    {
        loadWeather(city);
    }

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
            document.getElementById("hourly_weather").style.display = "flex";

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

            document.getElementById("wind").textContent = `${data.wind.speed} m/s Windgeschwindigkeit`

            loadHourlyWeather(data.coord.lat, data.coord.lon);

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
            let bestCity = "";
            let smallestDistance = Infinity;

            data.forEach(function(city)
            {
            const distance = levenshteinDistance(
                city.name.toLowerCase(),
                city_name.value.toLowerCase()
            );

            if (distance < smallestDistance)
            {
                smallestDistance = distance;
                bestCity = city.name;
            }
            });

            const button = document.createElement("button");
            button.textContent = "Meinten Sie: " + bestCity + "?";
            button.addEventListener("click", function()
            {
                city_name.value = bestCity;
                loadWeather(bestCity);

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

function formatCityName(city)
{
    return city
        .split(" ")
        .map(word =>
        {
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
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

function loadHourlyWeather(lat, lon)   /*lat = latitude = Breitengrad (Nord/Süd), lon = longitude = Längengrad (Ost/West)*/
{
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`)    /* /data/2.5/forecast = kostenlose 5-Tage-Vorhersage mit 3-Stunden-Intervallen */
        .then(response => response.json())

        .then(data =>
    {
    const hourlyContainer = document.getElementById("hourly_weather");

    hourlyContainer.textContent = "";

    data.list.forEach(forecast =>
    {
        console.log(forecast);
    const temperature = forecast.main.temp - 273.15;

    const date = new Date(forecast.dt * 1000);

    const time = date.toLocaleTimeString("de-DE", {hour: "2-digit", minute: "2-digit"});      /*2-digit = 2 stellen anzeigen= aus 15:00:00 wird 15:00 */

    const weather = forecast.weather[0].description;

    const currentWeather = weather_translation[weather] ||
    {
        icon: "❓",
        text: weather
    };


    const card = document.createElement("div");
    card.className = "hour_card";

    card.innerHTML =
    `
    <p>${time}</p>
    <p>${temperature.toFixed(1)} °C</p>
    <p>${currentWeather.icon}</p>
    <p>${currentWeather.text}</p>
    `;

    hourlyContainer.appendChild(card);
    });
    });
}