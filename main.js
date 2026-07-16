const search_button = document.getElementById("search_button");
const city_name = document.getElementById("city_name");
const API_KEY = "165dd84d9346892c4d057d6d1265ad33";
const weather_translation =
    {
    "clear sky": "Klarer Himmel",
    "few clouds": "Wenige Wolken",
    "scattered clouds": "Aufgelockerte Wolken",
    "broken clouds": "Viele Wolken",
    "overcast clouds": "Bedeckter Himmel",
    "light rain": "Leichter Regen",
    "moderate rain": "Mäßiger Regen"
    };

search_button.addEventListener("click", function()
{
    document.getElementById("city_name");
    const city = city_name.value;
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

            const temperature = data.main.temp - 273.15;                                                        /*-273.15 = unterschied zwischen Kelvin und Celsius */
            document.getElementById("temperature").textContent = `${temperature.toFixed(1)} °C`;    /* .toFixed(1) = eine Nachkommastelle */

            const weather = data.weather[0].description;
            document.getElementById("weather").textContent = weather_translation[weather];

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

            document.getElementById("wind").textContent = `${data.wind.speed} m/s Windgeschwindigkeit`;

            console.log(data);
        });
});

