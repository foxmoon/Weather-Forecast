"use strict";

function hideDisplayElement(element, elementDisplay) {
  element.classList.remove(`appeared-${elementDisplay}`);
  element.classList.add("hidden-element");
}

function showDisplayElement(element, elementDisplay) {
  element.classList.remove("hidden-element");
  element.classList.add(`appeared-${elementDisplay}`);
}

function showErrorMsg(errorMsg) {
  hideDisplayElement(document.querySelector(".loading-info-block"), "block");
  hideDisplayElement(
    document.querySelector(".main__weather-widget-wrapper"),
    "block"
  );
  const errorMsgLabel = document.querySelector(".main__error-message");
  errorMsgLabel.textContent = `Something went wrong!\n${errorMsg}`;
  showDisplayElement(document.querySelector("header"), "block");
  showDisplayElement(errorMsgLabel, "block");
}

function preparePageBeforeRequest() {
  hideDisplayElement(document.querySelector("header"), "block");
  hideDisplayElement(document.querySelector(".main__error-message"), "block");
  hideDisplayElement(
    document.querySelector(".main__weather-widget-wrapper"),
    "block"
  );
  showDisplayElement(document.querySelector(".loading-info-block"), "block");
}

function updateMinskWeatherData() {
  document.querySelector(".loading-info-block__text-info").textContent =
    "Getting data about weather in Minsk from the server...";
  preparePageBeforeRequest();
  getAndUpdateWeatherData(
    "https://api.openweathermap.org/data/2.5/forecast?q=Minsk&appid=a94d0a5ac08570add4b47b8da933f247"
  );
}

async function getResource(url) {
  const result = await fetch(url);
  if (!result.ok) {
    throw new Error(`Could not fetch ${url}, status: ${result.status}`);
  }
  return await result.json(); // Extract data from the HTTP response (which is in the form of json format) and return it as a js object
}

function getAndUpdateWeatherData(neededURL) {
  getResource(neededURL)
    .then((request) => {
      if (request.cod === "200") {
        hideDisplayElement(
          document.querySelector(".loading-info-block"),
          "block"
        );
        showDisplayElement(document.querySelector("header"), "block");
        showDisplayElement(
          document.querySelector(".main__weather-widget-wrapper"),
          "block"
        );
        const currWeatherObj = request.list[0];
        document.querySelector(
          ".main__precipitation-image"
        ).src = `https://openweathermap.org/img/wn/${currWeatherObj.weather[0].icon}@2x.png`;
        document.querySelector(".main__precipitation-text").textContent =
          currWeatherObj.weather[0].main;
        document.querySelector(
          ".main__temperature"
        ).textContent = `${Math.round(currWeatherObj.main.temp - 273.15)} °C`;
        document.querySelector(
          ".main__wind-speed-data"
        ).textContent = `${currWeatherObj.wind.speed.toFixed(1)} m/s`;
        request.list.forEach((forecast, id) => {
          if (id) {
            const dateTime = forecast.dt_txt.split(" ");
            document
              .querySelector(".main__weather-forecast-list-wrapper")
              .insertAdjacentHTML(
                "beforeend",
                `<div class="weather-forecast-card">
                    <div class="weather-forecast-card__date-time-wrapper">
                        <span class="weather-forecast-card__date">${
                          dateTime[0]
                        }</span>
                        <span class="weather-forecast-card__time">${
                          dateTime[1]
                        }</span>
                    </div>
                    <img
                        src="https://openweathermap.org/img/wn/${
                          forecast.weather[0].icon
                        }@2x.png"
                        alt="${forecast.weather[0].description}"
                        class="weather-forecast-card__precipitation-image"
                    />
                    <span class="weather-forecast-card__temperature">${Math.round(
                      forecast.main.temp - 273.15
                    )} °C</span>
                </div>`
              );
          }
        });
      } else {
        showErrorMsg(request.cod);
      }
    })
    .catch((e) => {
      showErrorMsg(e);
    });
}

const cityTimeWrapper = document.querySelector(".main__city-time-wrapper");
const cityLabel = document.querySelector(".main__city");
const cityTimeLabel = document.querySelector(".main__city-time");
const locationDataWrapper = document.querySelector(
  ".main__latitude-longitude-wrapper"
);
const locationLatitude = document.querySelector(".main__latitude");
const locationLongitude = document.querySelector(".main__longitude");

document
  .querySelector(".header__nav-list")
  .addEventListener("click", (event) => {
    if (event.target.id === "btn-Minsk") {
      document
        .querySelector("#btn-user-location")
        .classList.remove("active-btn");
      event.target.classList.add("active-btn");
      hideDisplayElement(locationDataWrapper, "flex");
      showDisplayElement(cityTimeWrapper, "flex");
      cityLabel.textContent = "Minsk";
      updateTime();
      updateMinskWeatherData();
    }
    if (event.target.id === "btn-user-location") {
      document.querySelector("#btn-Minsk").classList.remove("active-btn");
      event.target.classList.add("active-btn");
      hideDisplayElement(cityTimeWrapper, "flex");
      showDisplayElement(locationDataWrapper, "flex");
      const textLoadingInfo = document.querySelector(
        ".loading-info-block__text-info"
      );
      textLoadingInfo.textContent = "Getting data about current location...";
      preparePageBeforeRequest();
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          textLoadingInfo.textContent = `Getting data about weather at\n${latitude}, ${longitude}\nfrom the server...`;
          locationLatitude.textContent = `Latitude: ${latitude}`;
          locationLongitude.textContent = `Longitude: ${longitude}`;
          getAndUpdateWeatherData(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=a94d0a5ac08570add4b47b8da933f247`
          );
        },
        (err) => {
          showErrorMsg(
            `Error while trying to get location\nError code:${err.code}\nError description:${err.message}`
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  });

updateMinskWeatherData();

const hours = document.querySelector(".global-container__hours-num");
const minutes = document.querySelector(".global-container__minutes-num");
const seconds = document.querySelector(".global-container__seconds-num");

function updateTime() {
  const localTargetTimeArr = new Date().toLocaleTimeString().split(":");
  cityTimeLabel.textContent = `${localTargetTimeArr[0]}:${localTargetTimeArr[1]}`;
}

updateTime(); // Calling for the first time that the user didn't wait the first minute
setInterval(updateTime, 60000);
