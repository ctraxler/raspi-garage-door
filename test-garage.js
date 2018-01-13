//node.js deps
events = require('events'); 


//npm deps


//app deps
var onoff = require('onoff');
const GarageDoor = require('./raspi-garage-door').GarageDoor;

/*
var Gpio = onoff.Gpio;

var relay = new Gpio(21, 'in', 'both');
var openSim = new Gpio(20, 'out');
var closedSim = new Gpio(25, 'out');
*/

var emitted = false;

console.log('Creating garage door');

// GarageDoor(Relay, Open, Closed)
var garageDoor = new GarageDoor(21, 20, 16); 

/*
openSim.writeSync(0);
closedSim.writeSync(0);
*/

console.log('listening to open');
garageDoor.on('Open', function() {
  emitted = true; 
  console.log('door emitted open');
});	

console.log('listening to InBetween');
garageDoor.on('InBetween', function() {
  emitted = true; 
  console.log('door emitted InBetween');
});	

console.log('listening to closed');
garageDoor.on('Closed', function() {
  emitted = true; 
  console.log('door emitted closed');
});

// Cause the door ot emit the current state 
garageDoor.emitCurrentState();


console.log('Activating door');
garageDoor.activateDoor();



process.on('SIGINT', function () {
  garageDoor.cleanup()
});


