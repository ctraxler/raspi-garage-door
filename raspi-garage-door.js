"use strict"

// Node depends
const events = require('events');
const inherits = require('util').inherits;

// App depends
var onoff = require('onoff');

var Gpio = onoff.Gpio;

const ACTIVATION_LENGTH = 3000; // how long to activate the relay in milliseconds.

/* Contructor. Exports a garageDoor to userspace.
*
* 
* gpioRelay: number      	// The Linux GPIO identifier; an unsigned integer.
*
* gpioOpenSensor: number      	// The Linux GPIO identifier; an unsigned integer.
*
* gpioClosedSensor: number      // The Linux GPIO identifier; an unsigned integer.
*
*/

var Relay = {};
var openSensor = {}; 
var closedSensor = {}; 

function GarageDoor (gpioRelay, gpioOpenSensor, gpioClosedSensor) {

  if (!(this instanceof GarageDoor)) {
    return new GarageDoor(gpioRelay, gpioOpenSensor, gpioClosedSensor);
  }

  var that = this;

  events.EventEmitter.call(this); 

  Relay = new Gpio(gpioRelay, 'out');
  openSensor = new Gpio(gpioOpenSensor, 'in', 'both');
  closedSensor = new Gpio(gpioClosedSensor, 'in', 'both');



  // watch for changes to the openSensor, if rising then door is open, if falling then door is in transit
  openSensor.watch(function (err, value) {
    if (err) {
      throw err;
    } 
    //if value is 0 then door in transit, if 1 then door is now open
    if (value === 0) {
      that.emit('InBetween'); 	
    } else if (value === 1) {
      that.emit('Open')
    } else {
      console.log('Received unknown value from watch in openSensor');
    }
  }); 

  closedSensor.watch(function(err, value) {
    if (err) { 
      throw err;
    }
    //if value is 0 then door in transit, if 1 then door is now closed
    if (value === 0) {
      that.emit('InBetween');
    } else if (value === 1) {
      that.emit('Closed');
    } else {
      console.log('Received unkown value from watch in closedSensor');
    }
  });


}

GarageDoor.prototype.emitCurrentState = function() {
    var openState = openSensor.readSync();
    var closedState = closedSensor.readSync();

    console.log('openState: ' + openState);
    console.log('closedState: ' + closedState);

    if ((openState === 1) && (closedState === 1)) {
      console.log('ERROR: Door sensed as open and closed');
    } else {
      if (openState === 1) {
        this.emit('Open');
      } else if (closedState === 1) {
        this.emit('Closed');
      } else this.emit('InBetween');
    } 
  }

  // closes the relay wired to the garage door control wires for ACTIVATION_LENGTH
GarageDoor.prototype.activateDoor = function() {
  // close the relay
  Relay.writeSync(0);
  console.log('activating relay...');
  // wait ACTIVATION_LENGTH and open the relay
  setTimeout(function(){
      Relay.writeSync(1);
      console.log('deactivating relay');
    }, ACTIVATION_LENGTH);
}

GarageDoor.prototype.cleanup = function() {

  console.log('cleaning up...');
  Relay.writeSync(0);
  Relay.unexport();

  openSensor.unexport();
  closedSensor.unexport();
  console.log('clean up finished, exiting');
}


inherits(GarageDoor, events.EventEmitter); 
module.exports.GarageDoor = GarageDoor; 
