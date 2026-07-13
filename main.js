const search_button = document.getElementById("search_button");
const city_name = document.getElementById("city_name");
const API_KEY = "165dd84d9346892c4d057d6d1265ad33";

search_button.addEventListener("click", function()
{
    document.getElementById("city_name");
    const city = city_name.value;

    console.log(city_name.value);

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => {

            document.getElementById("city").textContent = data.name;

            const temperature = data.main.temp - 273.15;                                                        /*-273.15 = unterschied zwischen Kelvin und Celsius */
            document.getElementById("temperature").textContent = `${temperature.toFixed(1)} °C`;    /* .toFixed(1) = eine Nachkommastelle */

            document.getElementById("weather").textContent = data.weather[0].description;

            if (data.rain)
            {
            document.getElementById("rain").textContent = `${data.rain["1h"]} mm Regen`;
            }
            else
            {
            document.getElementById("rain").textContent = "Kein Regen";
            }

            document.getElementById("humidity").textContent = `${data.main.humidity}%`;

            document.getElementById("sunset").textContent = data.sys.sunset

            document.getElementById("wind").textContent = `${data.wind.speed} m/s`;

            console.log(data);
        });
});

