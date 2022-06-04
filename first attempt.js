//var map = L.map('map').setView([51.505, -0.09], 13);
//
//L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//}).addTo(map);
//
//L.marker([51.5, -0.09]).addTo(map)
//    .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
//    .openPopup();

class App {
    distance = +inputDistance.value;
    duration = +inputDuration.value;
    elevation = +inputElevation.value;
    cadence = +inputCadence.value;


    #map;
    #mapEvent;
    #workout;
    #workouts = [];
    constructor(){
        this.date = new Date();

        this._createMap();
        //this.#map.on(this._mapClick())

        //event listeners
        inputType.addEventListener('change',this._changeInput)
        form.addEventListener('submit', this._formSubmit.bind(this))
    }

    _resetForm(){
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
    }


    _changeInput(e){
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _createMap(){
        
        navigator.geolocation.getCurrentPosition(this._sucess.bind(this), function(){
            console.log('couldnt get your location');
        })

    }

    _sucess(position){
        let {latitude, longitude} = position.coords;

        this.#map = L.map('map').setView([latitude, longitude], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this.#map.on('click',this._mapClick.bind(this))
  
    }

    _hideForm(){
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => (form.style.display = 'grid'), 1000);
    }

    _mapClick(e){
        this.#mapEvent = e;
        //this._resetForm()
        form.classList.remove('hidden');  
        inputDistance.focus()
    }

    _setMarker(workout){
            console.log(this.#mapEvent.coords)
            let {lat, lng} = this.#mapEvent.coords
            L.marker([lat, lng]).addTo(this.#map)
            .bindPopup(
            L.popup({
              maxWidth: 250,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: `${workout.type}-popup`,
            })
            )
            .setPopupContent(
              `${x.type} on ${months[this.date.getMonth()]} ${this.date.getDay()}`
            )
            .openPopup();

    }


    _formSubmit(e){
        e.preventDefault();

        let workout;
        
        
        if(inputType.value === 'running'){
            workout = new Running(this.distance, this.duration, this.elevation)
            console.log(workout)
            this.#workout = workout
            //console.log(this.#workout)
            this.#workouts.push(workout);
            this._setMarker(workout);
            this._logWorkout();
            
        }

        if(inputType.value === 'cycling'){
            workout = new Cycling(this.distance, this.duration, this.cadence)
            this.#workout = workout
            //console.log(this.#workout)
            this.#workouts.push(workout);
            this._setMarker();
            this._logWorkout();
        }

        this._hideForm();

        //this.distance.value = this.duration.value = this.elevation.value = this.cadence.value = '';

    }

    _logWorkout(){
        //console.log(this.#workout);
        let workout;
        console.log(workout);
        let html = `
        <li class="workout workout--${this.#workout.type}" data-id="${+this.date.getDate()}">
        <h2 class="workout__title">Running on ${months[this.date.getMonth()]} ${this.date.getDay()}</h2>
        <div class="workout__details">
          <span class="workout__icon">${this.#workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
          <span class="workout__value">${this.#workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${this.#workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
        `

        if(inputType.value === 'running'){
            workout = new Running(this.distance, this.duration, this.cadence)
            html+= `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">????</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
            `
        }
        if(inputType.value === 'cycling'){
            workout = new Cycling(this.distance, this.duration, this.elevationGain)
            html+= `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">??????</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
            `
        }

        containerWorkouts.insertAdjacentHTML('beforeend', html)
    }


}

class Workout {
    constructor(distance, duration, coords){
        this.distance = distance;
        this.duration = duration;
        this.coords = coords;
    }
}

class Running extends Workout{
    #type = 'running';
    constructor(distance, duration, coords, cadence){
        super(distance, duration, coords)
        this.type = this.#type;
        this.cadence = cadence;
    }



}

class Cycling extends Workout{
    #type = 'cycling';
    constructor(distance, duration, coords, elevationGain){
        super(distance, duration, coords)
        this.type = this.#type;
        this.elevationGain = elevationGain;
    }
}

const test = new App();
