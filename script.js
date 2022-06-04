'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const btnMaptyPlus = document.querySelector('.maptyPlus');
const bodyEl = document.querySelector("body");
const maptyPlusModal = document.querySelector('.modal')

//my attempt

//var map = L.map('map').setView([51.505, -0.09], 13);
//
//L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//}).addTo(map);
//
//L.marker([51.5, -0.09]).addTo(map)
//    .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
//    .openPopup();

class Workout{
    #date = new Date();
    #id = this._getId();
    constructor(distance, duration, coords){
        this.distance = distance;
        this.duration = duration;
        this.coords = coords;
        this.id = this.#id;
        this.description = this._getDescription();
    }

    _getId(){
        let date = +this.#date
        return +date.toString().slice(-8);
    }

    _getDescription(){
        return `${months[this.#date.getMonth()]} ${this.#date.getDate()}`
    }
}



class Running extends Workout{
    #type = 'running';
    constructor(distance, duration, coords, cadence,){
        super(distance, duration, coords)
        this.cadence = cadence;
        this.pace = this._getPace();
        this.type = this.#type;
    }

    _getPace(){
        return +(this.duration / this.distance).toFixed(1);
    }
}



class Cycling extends Workout{
    #type = 'cycling';
    constructor(distance, duration, coords, elevationGain){
        super(distance, duration, coords)
        this.elevationGain = elevationGain;
        this.speed = this._getSpeed();
        this.type = this.#type;
    }

    _getSpeed(){
        return +(this.distance / this.duration).toFixed(3);
    }
}



class App{
    #mapE;
    #map;
    #workouts = [];
    #setView = 13;
    constructor(){

        this._getPosition();
        this._getLocalStorage();
        this._createModal();

        //event listeners
        inputType.addEventListener('change', this._toggleElevationField)
        form.addEventListener('submit', this._newWorkout.bind(this))
        containerWorkouts.addEventListener('click', this._moveToMarker.bind(this))
        btnMaptyPlus.addEventListener('click', this._showModal)
    }

    _getPosition(){
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){
            console.log( 'failed to get current position');
        })
    }


    _loadMap(position){
        this.#map;
        const {latitude, longitude} = position.coords;
        //console.log(latitude, longitude);

        const map = L.map('map').setView([latitude, longitude], this.#setView);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.on('click', this._showForm.bind(this))

        this.#map = map;

        this.#workouts.forEach( x => this._renderMarker(x));
 
    }

    _showForm(mapEvent){
        console.log(mapEvent)
        this.#mapE = mapEvent;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleElevationField(e){
        console.log(e);
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _renderWorkout(workout){
        //console.log(workout.speed);

        let html = `
            <li class="workout workout--${workout.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.type} on ${workout.description}</h2>
            <div class="workout__details">
              <span class="workout__icon">${workout.type == 'running'? '🏃‍♂️' : "🚴‍♀️"}</span>
              <span class="workout__value">${workout.distance}</span>
              <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⏱</span>
              <span class="workout__value">${workout.duration}</span>
              <span class="workout__unit">min</span>
            </div>
        `

        if(workout?.type === 'running'){
            html+=`
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace}</span>
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

        if(workout?.type === 'cycling'){
            html+=`
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⛰</span>
              <span class="workout__value">${workout.elevationGain}</span>
              <span class="workout__unit">spm</span>
            </div>
            </li>
            `
        }

        form.insertAdjacentHTML("afterend", html);

    }   


    _hideForm(){

        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
        form.style.display = 'none'
        form.classList.add('hidden');
        setTimeout(() => form.style.display = 'grid', 1000)
    }

    _renderMarker(workout){

        //console.log(workout);

        L.marker(workout.coords).addTo(this.#map)
        .bindPopup(L.popup({maxWidth: 250, minWidth:100, autoClose:false, closeOnClick: false,className:`${workout.type}-popup`}))
        .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'} on ${workout.description}`)
        .openPopup();

    }


    _newWorkout(e){
        e.preventDefault();
        let workout = '';

        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const cadence = +inputCadence.value; 
        const elevation = +inputElevation.value;

        let {lat, lng} = this.#mapE.latlng;
        const isNum = (...el) => el.every(x => Number.isFinite(x));
        const posIn = (...el) => el.every(x => x > 0);
        //guarder clauses
        if(!navigator.geolocation || !isNum(distance, duration) || !posIn(distance, duration)) return
        //render workout 
        if(inputType.value === 'running'){
           workout = new Running(distance, duration, [lat, lng], cadence )
           //console.log(workout)
            this._renderWorkout(workout)
            this.#workouts.push(workout)
        }
        if(inputType.value === 'cycling'){
            workout = new Cycling(distance, duration, [lat, lng], elevation)
            //console.log(workout)
            this._renderWorkout(workout)
            this.#workouts.push(workout)
         }

        //render workout marker 
         
        this._renderMarker(workout)

        //hide form
        this._hideForm();

        // setting workouts in local storage

        this._setLocalStorage();

    }

    _setLocalStorage(){
        localStorage.setItem('workoutsArr', JSON.stringify(this.#workouts));
    }

    _getLocalStorage(){
        let data = JSON.parse(localStorage.getItem('workoutsArr'));
        //console.log(data);
        this.#workouts = data;

        if(!data) return;
    
        this.#workouts.forEach(x => {
            this._renderWorkout(x);
            //console.log(x.coords)
        })
    }

    _moveToMarker(e){
       const clickedWorkout = +(e.target.closest(".workout")?.dataset.id);

       if(!clickedWorkout) return

       let coord = this.#workouts.find(el => el.id === clickedWorkout)

       this.#map.setView(coord.coords, this.#setView, {
        animate: true,
        pan:{duration: 1},
    });
    
    }


    //mapty+

    _createModal(){
        let modal = `
            <div class="modal hideModal">
                <button class="modalOptions">Edit Workout</button>
                <button class="modalOptions">Delete Workout</button>
                <button class="modalOptions">Delete All Workouts</button>
            </div>
        `
        bodyEl.insertAdjacentHTML("afterbegin", modal);
    }

    _showModal(e){
        
        e.target.closest("body").children[0].classList.toggle('hideModal')
    }
}

const test =  new App();