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
    let btn = $("<button>")
      .addClass("btn-main")
      .attr("type", "button")
      .attr("id", userHistory[index])
      .text(userHistory[index]);
    searchHistoryAside.append(btn);
  }
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
  let cityName = location.name;

  // Use coordinates to get weather data
  let queryWeatherURL = `${initAPIURL}/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${myKey}`;
  console.log(queryWeatherURL);

  $.ajax({
    url: queryWeatherURL,
    method: "GET",
  }).then(function (data) {
    showCurrentWeather(cityName, data.list[0]);
  });
}

function showCurrentWeather(city, weatherInfo) {
  // Set date
  const displayDate = moment().format("dddd, Do MMMM YYYY");
  const icon = `https://openweathermap.org/img/w/${weatherInfo.weather[0].icon}.png`;
  // const type = weatherInfo.weather[0].main;
  const description = weatherInfo.weather[0].description;
  const tempC = weatherInfo.main.temp.toFixed(0);
  const wind = (weatherInfo.wind.speed / 1.61).toFixed(1);
  const humidity = weatherInfo.main.humidity;

  const card = $("<div>").addClass("card shadow p-3 mb-5 bg-white rounded");
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
  iconBG.append(iconEl);
  titleDiv.append(cardTitle, iconBG);
  // const typeEl = $("<p>")
  //   .addClass("card-text")
  //   .text(`${type} (${description})`);
  const tempEl = $("<p>").addClass("card-text").text(`Temperature: ${tempC}°C`);
  const windEl = $("<p>").addClass("card-text").text(`Wind: ${wind} mph`);
  const humidityEl = $("<p>")
    .addClass("card-text")
    .text(`Humidity: ${humidity}%`);
  cardBody.append(titleDiv, tempEl, windEl, humidityEl);
  card.append(cardBody);

  // Clear any previously appended current weather data
  today.html("");
  // Append new current weather data
  today.append(card);
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

function historyClick(event) {
  if (!$(event.target).hasClass("btn-main")) {
    return;
  }
  let city = $(event.target).attr("id");
  getCoordinates(city);
  input.val("");
}

// Check history to create buttons from localStorage
checkHistory();

// Create on click event listener for search form
searchForm.on("submit", submitSearch);
searchHistoryAside.on("click", historyClick);
