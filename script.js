'use strict';




class Workout{
    date=new Date();
    id=(Date.now()+'').slice(-10);
    constructor(coords,distance,duration){
this.coords=coords;//[lat,long]
this.distance=distance;
this.duration=duration;
    }
    _setDescription(){
// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 
'October', 'November', 'December'];

this.description=`${this.type[0].toUpperCase()}${this.type.slice(1)} on 
${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}
class Running extends Workout{
    type='running';
    constructor(coords,distance,duration,cadence){
        super(coords,distance,duration);
        this.cadence=cadence;
        this.calcPace();
        this._setDescription();

        }
        calcPace(){
            this.pace=this.duration/this.distance;
            return this.pace;
        }
}
class Cycling extends Workout{
    type='cycling';
    constructor(coords,distance,duration,elevationGain){
    super(coords,distance,duration);
    this.elevationGain=elevationGain;
    this.calcSpeed();
    this._setDescription();
    }
    calcSpeed(){
        this.speed=this.distance/(this.duration/60);
        return this.speed;
    }
}
const run=new Running([39,-12],5.2,2.4,178)
const cycling=new Cycling([39,-12],10,4,180)

console.log(run);
console.log(cycling);

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class App{
    map;
    mapEvent;
    workouts=[];
    zoomLevel=13;
    constructor(){
      this._getPosition();

      //get data from local storage
      this._getLocalStorage();

      form.addEventListener('submit',this._newWorkout.bind(this))
    inputType.addEventListener('change',this._toggleElevationField)
    containerWorkouts.addEventListener('click',this._moveToPopup.bind(this))
    }


_getPosition(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),function(){
            alert('Could not get the location');
        })
    }
};

_loadMap(position){
    
        const {latitude}=position.coords;
        const {longitude}=position.coords;
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
        const coords=[latitude,longitude]
        this.map = L.map('map').setView(coords, this.zoomLevel);//the other parameter is the zooming level
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    this.map.on('click',this._showForm.bind(this))
    this.workouts.forEach(work=>{this.renderWorkoutMarker(work);})

}
_showForm(mapE){
    this.mapEvent=mapE;
    form.classList.remove('hidden')
    inputDistance.focus();//to activate the cursor automatically without clicking
}
_hideForm(){
    inputDistance.value=inputDuration.value=inputElevation.value=inputCadence.value='';
    form.classList.add('hidden')
}
_toggleElevationField(){
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
}
_newWorkout(e){
    e.preventDefault();

    const validateInputs=(...inputs)=>
    inputs.every(inp=>Number.isFinite(inp));
    
    const allPositive=(...input)=>input.every(inp=>inp > 0);
//get data from
const type=inputType.value;
const distance= +inputDistance.value;
const duration= +inputDuration.value;
const {lat,lng}=this.mapEvent.latlng;

let workout;

//if workout running,create running object
if (type==='running'){
    const cadence=+inputCadence.value;

    //check if data is valid
    if(
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validateInputs(distance,duration,cadence) ||
        !allPositive(distance,duration,cadence)
    )
    return alert('Inputs have to be positive numbers!')

    workout=new Running([lat,lng],distance,duration,cadence);
    
}

//if workout cycling,create cycling object
if (type==='cycling'){
    const elevation=+inputElevation.value;
    if(
       
        !validateInputs(distance,duration,elevation) || 
        !allPositive(distance,duration)
    )
    return alert('Inputs have to be positive numbers!')

    workout=new Cycling([lat,lng],distance,duration,elevation);

}
this.workouts.push(workout);
    console.log(workout);

this.renderWorkoutMarker(workout);

this._renderWorkout(workout);
   
   
this._hideForm();
    //Display marker
// console.log(this.mapEvent);
    
///set local storage
this._setLocalStorage();
  

}
renderWorkoutMarker(workout){
    L.marker(workout.coords).addTo(this.map)
    .bindPopup(L.popup({
        maxWidth:250,
        minWidth:100,
        autoClose:false,
        closeOnClick:false,
        className:`${workout.type}-popup`
    })).setPopupContent(`${workout.type==='running'?'🏃‍♂️':'🚴‍♂️'} ${workout.description}`)
    .openPopup();
   }
   _renderWorkout(workout){
let html=` <li class="workout workout--${workout.type}" data-id=${workout.id}>
<h2 class="workout__title">${workout.description}</h2>
<div class="workout__details">
  <span class="workout__icon">${workout.type==='running'?'🏃‍♂️':'🚴‍♂️'}</span>
  <span class="workout__value">${workout.distance}</span>
  <span class="workout__unit">km</span>
</div>
<div class="workout__details">
  <span class="workout__icon">⏱</span>
  <span class="workout__value">${workout.duration}</span>
  <span class="workout__unit">min</span>
</div>`;

if (workout.type==='running'){
    html +=`
 <div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.pace.toFixed()}</span>
    <span class="workout__unit">min/km</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">🦶🏼</span>
    <span class="workout__value">${workout.cadence}</span>
    <span class="workout__unit">spm</span>
  </div>
</li>`
}

if (workout.type==='cycling'){
    html+=`</div>
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed()}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>`;
}
form.insertAdjacentHTML('afterend',html)
   }

   _moveToPopup(e){
       const workoutEl=e.target.closest('.workout');
       console.log(workoutEl);

       if(!workoutEl) return;

       const workout=this.workouts.find(
           work=>work.id ===workoutEl.dataset.id
       )
       console.log(workout);
       this.map.setView(workout.coords,this.zoomLevel,{
           animate:true,
           pan:{
               duration:1
           }
       })
   }
   _setLocalStorage(){
    localStorage.setItem('workouts',JSON.stringify(this.workouts))//json.stringify converts objects to strings
};
_getLocalStorage(){
  const data=JSON.parse(localStorage.getItem('workouts'));
  console.log(data);
  if(!data) return;
  this.workouts=data;
  this.workouts.forEach(work=>{this._renderWorkout(work);
})
}
}
const app=new App()


