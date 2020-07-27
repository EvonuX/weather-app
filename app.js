// Set initial variables
let state = {}
const coords = { lat: '', lng: '' }
const metric = `<span class="temp--metric">&deg;C</span>`

const IMG = document.getElementById('main-img'),
  TEMP = document.getElementById('main-temp'),
  WEATHER = document.getElementById('main-weather'),
  DATE = document.getElementById('main-date'),
  CITY = document.getElementById('main-city'),
  FORECAST = document.getElementById('forecast'),
  WIND = document.getElementById('main-wind'),
  WIND_DIRECTION = document.getElementById('main-windDir'),
  WIND_DIRECTION_TEXT = document.getElementById('main-windDirText'),
  HUMIDITY = document.getElementById('main-humidity'),
  VISIBILITY = document.getElementById('main-visibility'),
  PRESSURE = document.getElementById('main-pressure'),
  BAR = document.getElementById('bar-fill'),
  SIDEBAR = document.getElementById('sidebar'),
  SIDEBAR_OPEN = document.getElementById('sidebar-open'),
  SIDEBAR_CLOSE = document.getElementById('sidebar-close'),
  SIDEBAR_SEARCH = document.getElementById('search'),
  SIDEBAR_BUTTON = document.getElementById('search-btn'),
  SIDEBAR_OPTIONS = document.querySelectorAll('[data-weather]'),
  LOADER = document.getElementById('loader'),
  FETCH_WEATHER = document.getElementById('get-location')

// Helper functions
const closeSidebar = () => {
  SIDEBAR.style.transform = 'translateX(-100%)'
}

const openSidebar = () => {
  SIDEBAR.style.transform = 'translateX(0)'
  SIDEBAR_SEARCH.focus()
}

const showLoader = () => {
  LOADER.style.opacity = '1'
  setTimeout(() => (LOADER.style.display = 'flex'), 1000)
}

const hideLoader = () => {
  LOADER.style.opacity = '0'
  setTimeout(() => (LOADER.style.display = 'none'), 1000)
}

const setTemp = (temp, unit = 'celsius') => {
  if (unit === 'fahrenheit') {
    return ((temp * 9) / 5 + 32).toFixed(0) + `<span class="temp--metric">&deg;F</span>`
  } else {
    return temp.toFixed(0) + metric
  }
}

const setDate = date => {
  const formattedDate = new Date(date)
  const options = { weekday: 'short', month: 'short', day: 'numeric' }

  return formattedDate.toLocaleDateString('en-US', options)
}

// Get users location
const showPosition = position => {
  coords.lat = position.coords.latitude
  coords.lng = position.coords.longitude

  getWeather(`?lattlong=${coords.lat},${coords.lng}`)
}

const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition)
  } else {
    getWeather(`?query=london`)
    alert(
      'Geolocation is not supported by this browser. Please search for a city to get weather results.'
    )
  }
}

getLocation()

// Get API data and update state
const countryFromId = id => {
  fetch(`https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/${id}`)
    .then(res => res.json())
    .then(data => {
      state = data
    })
    .catch(err => {
      console.error(err)
      alert('Oops, something went wrong!')
    })
}

const getWeather = query => {
  showLoader()

  fetch(
    `https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/search${query}`
  )
    .then(res => res.json())
    .then(data => {
      countryFromId(data[0].woeid)
      hideLoader()
    })
    .catch(err => {
      hideLoader()
      console.error(err)
    })
}

// Populate markup with dynamic content
const {
  the_temp,
  weather_state_name,
  wind_direction_compass,
  applicable_date,
  wind_speed,
  wind_direction,
  humidity,
  visibility,
  air_pressure
} = state.consolidated_weather[0]

const populate = unit => {
  IMG.src = '/assets/' + weather_state_name + '.png'
  TEMP.innerHTML = setTemp(the_temp, unit)
  WEATHER.innerText = weather_state_name
  DATE.innerText = setDate(applicable_date)
  CITY.innerText = state.parent.title
  WIND.innerText = wind_speed.toFixed()
  WIND_DIRECTION.firstChild.nextSibling.style.transform = `rotate(${wind_direction}deg)`
  WIND_DIRECTION_TEXT.innerText = wind_direction_compass
  HUMIDITY.innerText = humidity.toFixed()
  VISIBILITY.innerText = visibility.toFixed()
  PRESSURE.innerText = air_pressure.toFixed()
  BAR.style.width = humidity.toFixed() + '%'

  FORECAST.innerHTML = state.consolidated_weather
    .slice(1)
    .map(day => {
      return `
      <div class="card">
        <div class="card__date">${setDate(day.applicable_date)}</div>
        <img class="card__image" src="/assets/${
          day.weather_state_name
        }.png" width="55" height="50" alt="forecast" />
        <div class="card__temp">
          <div class="color--primary">${setTemp(day.min_temp, unit)}</div>
          <div class="color--secondary">${setTemp(day.max_temp, unit)}</div>
        </div>
      </div>
    `
    })
    .join('')
}

// Sidebar
SIDEBAR_OPEN.addEventListener('click', openSidebar)
SIDEBAR_CLOSE.addEventListener('click', closeSidebar)

SIDEBAR_BUTTON.addEventListener('click', () => {
  getWeather(`?query=${SIDEBAR_SEARCH.value}`)
})

SIDEBAR_OPTIONS.forEach(btn => {
  btn.addEventListener('click', () => {
    const query = btn.getAttribute('data-weather')
    getWeather(`?query=${query}`)
    closeSidebar()
  })
})

FETCH_WEATHER.addEventListener('click', () => {
  getLocation()
})

document.querySelectorAll('[data-metric]').forEach(btn => {
  btn.addEventListener('click', () => {
    const metric = btn.getAttribute('data-metric')
    populate(metric)
  })
})

document.addEventListener('keydown', e => {
  if (e.code === 'Enter' || e.code === 'NumpadEnter') {
    SIDEBAR_BUTTON.click()
  }
})

populate('celsius')
