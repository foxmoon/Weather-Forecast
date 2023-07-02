"use strict";

function hideBlockElement(element) {
  element.classList.remove("appeared-block");
  element.classList.add("hidden-element");
}

function showBlockElement(element) {
  element.classList.remove("hidden-element");
  element.classList.add("appeared-block");
}

function showErrorMsg(errorMsg) {
  hideBlockElement(document.querySelector(".loading-spinner"));
  hideBlockElement(document.querySelector(".main__weather-widget-wrapper"));
  const errorMsgLabel = document.querySelector(".main__error-message");
  errorMsgLabel.textContent = `Something went wrong!\n${errorMsg}`;
  showBlockElement(errorMsgLabel);
}

const getResource = async (url) => {
  const result = await fetch(url);
  if (!result.ok) {
    throw new Error(`Could not fetch ${url}, status: ${result.status}`);
  }
  return await result.json(); // Извлекаем из HTTP-ответа данные (которые в виде json формата) и возвращаем их в виде js-объекта
};

getResource(
  "https://api.openweathermap.org/data/2.5/forecast?q=Minsk&appid=a94d0a5ac08570add4b47b8da933f247"
)
  .then((request) => {
    if (request.cod === "200") {
      hideBlockElement(document.querySelector(".loading-spinner"));
      showBlockElement(document.querySelector(".main__weather-widget-wrapper"));
      const currWeatherObj = request.list[0];
      document.querySelector(
        ".main__precipitation-image"
      ).src = `https://openweathermap.org/img/wn/${currWeatherObj.weather[0].icon}@2x.png`;
      document.querySelector(".main__precipitation-text").textContent =
        currWeatherObj.weather[0].main;
      document.querySelector(".main__temperature").textContent = `${Math.round(
        currWeatherObj.main.temp - 273.15
      )} °C`;
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
              `
                  <div class="weather-forecast-card">
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
                  </div>
                `
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

const hours = document.querySelector(".global-container__hours-num");
const minutes = document.querySelector(".global-container__minutes-num");
const seconds = document.querySelector(".global-container__seconds-num");

function updateTime() {
  const localTargetTimeArr = new Date().toLocaleTimeString().split(":");
  document.querySelector(
    ".main__city-time"
  ).textContent = `${localTargetTimeArr[0]}:${localTargetTimeArr[1]}`;
}

updateTime(); // Calling for the first time that the user didn't wait the first minute
setInterval(updateTime, 60000);
