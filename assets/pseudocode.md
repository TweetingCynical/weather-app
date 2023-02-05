# Weather Forecast App

# Pseudocode for how to build Weather App

Steps to achieving the working Weather Forecase App:

- Check localStorage for stored history;
  - If there is history, create the buttons for each city using a for loop;
- Add a searched city to local storage history when a city is searched;
  - Create a new button when that city is searched;
- Create api search term and change from city to co-ordinates;
- Use api data to get weather information for current weather:
  - TODAY SECTION:
  - Create a title, icon, temp, wind and humidity element;
  - Fill those elements with data from api;
  - Append to TODAY section;
  - FORECAST SECTION:
  - Filter out records in api data that are not necessary;
  - For loop to create a card for each of the next 5 days;
  - Create a title, icon, temp, wind and humidity element;
  - Fill those elements with data from api;
  - Append to FORECAST section;
- Add event listeners to buttons from search history, so that when they are clicked, they call the same function as the search button
