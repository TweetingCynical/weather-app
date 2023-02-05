// Links to DOM
const input = $("#search-input");
const searchForm = $("#search-form");
const searchHistoryAside = $("#history");
const today = $("#today");
const forecast = $("#forecast");

// Building api data
const initAPIURL = "https://api.openweathermap.org";
const myKey = "60b84830c44702730b0a92a73fe990a4";
let userHistory = [];

// Create search button history
function createButtons() {
  searchHistoryAside.html("");
  for (let index = 0; index < userHistory.length; index++) {
    const btn = $("<button>")
      .addClass("btn-main")
      .attr("type", "button")
      .attr("id", userHistory[index])
      .text(userHistory[index]);
    searchHistoryAside.append(btn);
  }
  const btn = $("<button>")
    .addClass("btn-clear bg-primary")
    .attr("type", "button")
    .attr("id", "clear")
    .text("Clear History");
  searchHistoryAside.append(btn);
}

// Check search history from localStorage
function checkHistory() {
  let searched = localStorage.getItem("searched");

  if (searched) {
    userHistory = JSON.parse(searched);
  }
  createButtons();
}

// Add search history
function appendHistory(city) {
  // Check if this city search already exists in the userHistory (no point adding it again)
  if (userHistory.indexOf(city) !== -1) {
    return;
  }
  // Push the current search city into the userHistory
  userHistory.push(city);
  // Set the new userHistory as localStorage
  localStorage.setItem("searched", JSON.stringify(userHistory));
  // Now create the buttons
  createButtons();
}

// Get coordinates data using api
function getCoordinates(city) {
  let queryCoordinatesURL = `${initAPIURL}/geo/1.0/direct?q=${city}&limit=5&appid=${myKey}`;

  $.ajax({
    url: queryCoordinatesURL,
    method: "GET",
  }).then(function (data) {
    if (!data[0]) {
      alert("This city was not found. Please try again.");
    } else {
      appendHistory(city);
      getWeather(data[0]);
    }
  });
}

// Use coordinates data to get weather
function getWeather(location) {
  // Extract location data from coordinates api
  let latitude = location.lat;
  let longitude = location.lon;
  let cityName = `${location.name}, ${location.country}`;

  // Use coordinates to get weather data
  let queryWeatherURL = `${initAPIURL}/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${myKey}`;
  console.log(queryWeatherURL);

  $.ajax({
    url: queryWeatherURL,
    method: "GET",
  }).then(function (data) {
    showCurrentWeather(cityName, data.list[0]);
    showForecastWeather(data.list);
  });
}

// Creates the TODAY section filled with current weather data from api
function showCurrentWeather(city, weatherInfo) {
  // Set date
  const displayDate = moment().format("ddd, Do MMM YYYY");

  // Store values from api fetch
  const icon = `${initAPIURL}/img/w/${weatherInfo.weather[0].icon}.png`;
  const description = weatherInfo.weather[0].description;
  const tempC = weatherInfo.main.temp.toFixed(0);
  const wind = (weatherInfo.wind.speed / 1.61).toFixed(1);
  const humidity = weatherInfo.main.humidity;

  // Create elements for section
  const card = $("<div>").addClass("card shadow-lg p-3 mb-5 bg-white rounded");
  const cardBody = $("<div>").addClass("card-body");
  const titleDiv = $("<div>").addClass("title-div");
  const cardTitle = $("<h3>")
    .addClass("h3")
    .text(`Current weather for ${city} (${displayDate})`);
  const iconBG = $("<div>").addClass("icon-bg");
  const iconEl = $("<img>")
    .addClass("icon")
    .attr("src", icon)
    .attr("alt", description);
  const tempEl = $("<p>").addClass("card-text").text(`Temperature: ${tempC}°C`);
  const windEl = $("<p>").addClass("card-text").text(`Wind: ${wind} mph`);
  const humidityEl = $("<p>")
    .addClass("card-text")
    .text(`Humidity: ${humidity}%`);

  // Append elements to section
  iconBG.append(iconEl);
  titleDiv.append(cardTitle, iconBG);
  cardBody.append(titleDiv, tempEl, windEl, humidityEl);
  card.append(cardBody);

  // Clear any previously appended current weather data
  today.html("");
  // Append new current weather data
  today.append(card);
}

// Create elements to display forecasted weather
function showForecastWeather(weatherInfo) {
  forecast.html("");
  // Filter out the records from weatherInfo which are not midday forecasts
  let dailyForecast = weatherInfo.filter(function (info) {
    return info.dt_txt.includes("12:00:00");
  });

  // Create overall forecast area card elements
  const cardContainer = $("<div>").addClass("card shadow-lg mb-3 rounded");
  const cardBodyContainer = $("<div>").addClass(
    "card-body text-white forecast-cards"
  );
  const cardBodyTitle = $("<h3>")
    .addClass("h3 text-center mt-3")
    .text(`5-day Forecast`);
  cardContainer.append(cardBodyTitle, cardBodyContainer);
  forecast.append(cardContainer);

  // For loop to create the cards for each of the next 5 days
  for (let i = 0; i < dailyForecast.length; i++) {
    // Store values from api fetch
    const displayDate = moment(
      dailyForecast[i].dt_txt,
      "YYYY-MM-DD HH:mm:ss"
    ).format("ddd, DD/MM");
    const icon = `${initAPIURL}/img/w/${dailyForecast[i].weather[0].icon}.png`;
    const description = dailyForecast[i].weather[0].description;
    const tempC = dailyForecast[i].main.temp.toFixed(0);
    const wind = (dailyForecast[i].wind.speed / 1.61).toFixed(1);
    const humidity = dailyForecast[i].main.humidity;

    // Create elements for card container
    const card = $("<div>").addClass(
      "card-body shadow-lg mx-1 mb-2 rounded col-md forecast-card"
    );
    const cardTitle = $("<h5>")
      .addClass("h5 text-white")
      .text(`${displayDate}`);
    const iconBG = $("<div>").addClass("icon-bg-sm");
    const iconEl = $("<img>")
      .addClass("icon-sm")
      .attr("src", icon)
      .attr("alt", description);
    iconBG.append(iconEl);
    const tempEl = $("<p>").addClass("card-text").text(`Temp: ${tempC}°C`);
    const windEl = $("<p>").addClass("card-text").text(`Wind: ${wind}mph`);
    const humidityEl = $("<p>")
      .addClass("card-text")
      .text(`Humidity: ${humidity}%`);

    // Append all card elements to the card
    card.append(cardTitle, iconBG, tempEl, windEl, humidityEl);

    // Append card to its container
    cardBodyContainer.append(card);
  }
}

// Search form submit function
function submitSearch(event) {
  // Prevents refresh of page each time user presses submit
  event.preventDefault();

  // Get value of search input and remove white space
  let city = input.val().trim();
  getCoordinates(city);
  input.val("");
}

// Call getCoordinates function if a search history button is clicked
function historyClick(event) {
  if (!$(event.target).hasClass("btn-main")) {
    return;
  }
  let city = $(event.target).attr("id");
  getCoordinates(city);
  input.val("");
}

// Clear all search city history
function clearHistory(event) {
  if (!$(event.target).hasClass("btn-clear")) {
    return;
  }
  let searched = [];
  localStorage.setItem("searched", JSON.stringify(searched));
  checkHistory();
}

// Check history to create buttons from localStorage
checkHistory();

// Create on click event listener for search form
searchForm.on("submit", submitSearch);
searchHistoryAside.on("click", historyClick);
searchHistoryAside.on("click", clearHistory);
