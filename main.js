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
    const city = city_name.value.trim();  /*.trim() entfernt Leerzeichen am Anfang und Ende der Eingabe*/
    if (city === "")
    {
    alert("Bitte eine Stadt eingeben");
    return;
    }

    if (!isNaN(city))                   /*isNaN = is Not a Number*/
    {
    alert("Bitte einen gültigen Stadtnamen eingeben");
    return;
    }
    console.log(city_name.value);

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`)
        .then(response => {

                if (!response.ok)
                {
                throw new Error("Stadt nicht gefunden. Bitte überprüfe die Schreibweise.");
                }
                return response.json();
                })

            .then(data => {

            document.getElementById("city").textContent = data.name;
            document.getElementById("details").textContent = "Details";
            document.getElementById("weather_info").style.display = "block";
            document.getElementById("weather_details").style.display = "block";

            const temperature = data.main.temp - 273.15;                                                        /*-273.15 = unterschied zwischen Kelvin und Celsius */
            document.getElementById("temperature").textContent = `${temperature.toFixed(1)} °C`;    /* .toFixed(1) = eine Nachkommastelle */

            const weather = data.weather[0].description;;
            const currentWeather = weather_translation[weather];
            document.getElementById("weather").textContent =`${currentWeather.icon} ${currentWeather.text}`;

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
            document.getElementById("sunrise").textContent = `Sonnenaufgang: ${sunrise.toLocaleTimeString("de-DE")}`;

            const sunset = new Date(data.sys.sunset * 1000);
            document.getElementById("sunset").textContent =`Sonnenuntergang: ${sunset.toLocaleTimeString("de-DE")}`;
            document.getElementById("sun_info").style.display = "flex";

            document.getElementById("wind").textContent = `${data.wind.speed} m/s Windgeschwindigkeit`;

            console.log(data);
        });
};

