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
            document.getElementById("temperature").textContent = data.main.temp;
            console.log(data);
        });
});

