class App {
    #map;
    #mapEvent;
    #mapZoomLevel = 13;
    #workout = [];
    constructor(){
        this._getPosition();

        this._getLocalStorage();

        form.addEventListener('submit', this._newWorkout.bind(this));

        inputType.addEventListener('change', this._toggleElevationField);

        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))

        console.log(this.#map);
    }

    _getPosition(){

    if(navigator.geolocation)
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),function(){
            console.log('position failed')
        })


    }

    _loadMap(position){

        let {latitude, longitude} = position.coords;
        console.log(latitude, longitude)

        this.#map = L.map('map').setView([latitude, longitude], this.#mapZoomLevel);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        L.marker([latitude, longitude]).addTo(this.#map)
            .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
            .openPopup();


        //mapG = map;

        this.#map.on('click', this._showForm.bind(this));

        this.#workout.forEach(x => this.renderWorkoutMarker(x));

    }

    _showForm(e){

        this.#mapEvent = e;
            form.classList.remove('hidden');
            inputDistance.focus();

    }

    _toggleElevationField(){

        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');

    }

    _newWorkout(e){
        e.preventDefault();
        const validInput = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        const allPos = (...inputs) => inputs.every(inp => inp > 0);

        // get data from from

        const type = inputType.value;
        const distance = +inputDistance.value
        const duration = +inputDuration.value
        let {lat, lng} = this.#mapEvent.latlng;
        let workout;

        // check if data us valid

        // if workout running, create running object
        
        if(type === 'running'){
            const cadence = +inputCadence.value;
            //if(!Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(cadence)) return console.log("input needs to be a number")
            if(!validInput(distance, duration, cadence) || !allPos(distance, duration, cadence)) return console.log("input needs to be a positive number");
            workout = new Running({lat, lng}, distance, duration, cadence)
        }

        // if workout cycling, create cycling object

        if(type === 'cycling'){
            const elevation = +inputElevation.value
            if(!validInput(distance, duration, elevation) || !allPos(distance, duration)) return console.log("input needs to be a positive number");
            workout = new Cycling({lat, lng}, distance, duration, elevation)
        }

        // add new object to workout array

        this.#workout.push(workout);
        
        // render workout on map as marker

        this.renderWorkoutMarker(workout);
        
        // render workout on list
        this._renderWorkout(workout);
        // clear input fields
        
        //hide form and clear input fields

        this._hideform()

        // set local storage

        this._setLocalStorage()


    }

    _setLocalStorage(){
        localStorage.setItem('workouts', JSON.stringify(this.#workout));
    }

    _getLocalStorage(){
        const data = JSON.parse(localStorage.getItem('workouts'));
        console.log(data);

        if(!data) return;

        this.#workout = data;
        this.#workout.forEach(x => this._renderWorkout(x));
    }

    _hideform(){

        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
        form.style.display = 'none'
        form.classList.add('hidden');
        setTimeout(() => form.style.display = 'grid', 1000)
    }

    renderWorkoutMarker(workout){
        L.marker(workout.coords)
        .addTo(this.#map)
        .bindPopup(L.popup({maxWidth: 250, minWidth:100, autoClose:false, closeOnClick: false,className:`${workout.type}-popup`}))
        .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'} ${workout.description}`)
        .openPopup();

    }

    _renderWorkout(workout){
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">🏃‍♂️</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>`;

        if(workout.type === 'running'){
            html +=  `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`
        }

        if(workout.type === 'cycling'){
            html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elvationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li`

        }

        form.insertAdjacentHTML('afterend', html)
    }

    _moveToPopup(e){
        const workoutEl = e.target.closest('.workout');
        console.log(workoutEl);

        if(!workoutEl) return;

        const workout = this.#workout.find(work => work.id === workoutEl.dataset.id);
        console.log(workout);

        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan:{duration: 1},
        } )
    }

}








const app = new App();

class Workout {

    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coords, distance, duration){
        this.coords = coords;
        this.distance = distance; //in km
        this.duration = duration; //in min

    }

    _setDescription(){
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
}

class Running extends Workout{
    type = 'running'
    constructor(coords, distance, duration, cadence){
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }

    calcPace(){
        //min/km
        this.pace = this.duration / this.distance;
        return this.pace
    }
}

class Cycling extends Workout{
    type = 'cycling';
    constructor(coords, distance, duration, elvationGain){
        super(coords, distance, duration);
        this.elvationGain = elvationGain;
        this.calcSpeed();
        this._setDescription();
    }

    calcSpeed(){
        this.speed = this.distance / (this.duration / 60)
        return this.speed
    }
}

const run = new Running([39, -12], 5.2, 24, 178)
const cycling = new Cycling([39, -12], 27, 95, 523)
console.log(run, cycling)
//if(navigator.geolocation)
//    navigator.geolocation.getCurrentPosition(function(position){
//        let {latitude, longitude} = position.coords;
//        console.log(latitude, longitude)
//
//        const map = L.map('map').setView([latitude, longitude], 13);
//
//        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//        }).addTo(map);
//
//        L.marker([latitude, longitude]).addTo(map)
//            .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
//            .openPopup();
//
//
//        mapG = map;
//
//        map.on('click', function(e){
//            mapEvent = e;
//            form.classList.remove('hidden');
//            inputDistance.focus();
//            //console.log(e)
//            //let {lat, lng} = e.latlng;
//            //console.log(lat, lng)
//
//            //L.marker([lat, lng])
//            //.addTo(map)
//            //.bindPopup(L.popup({maxWidth: 250, minWidth:100, autoClose:false, closeOnClick: false,className:'running-popup'}))
//            //.setPopupContent('workout')
//            //.openPopup();
//
//        })
//
//    }, function(){
//        console.log('position failed')
//    })
//
//form.addEventListener('submit', function(e){
//    e.preventDefault();
//
//    //clear input
//    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''
//
//    //display marker
//    console.log(e)
//    let {lat, lng} = mapEvent.latlng;
//    console.log(lat, lng)
//    L.marker([lat, lng])
//    .addTo(mapG)
//    .bindPopup(L.popup({maxWidth: 250, minWidth:100, autoClose:false, closeOnClick: false,className:'running-popup'}))
//    .setPopupContent('workout')
//    .openPopup();
//})
//
//inputType.addEventListener('change', function(e){
//    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
//    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
//})


