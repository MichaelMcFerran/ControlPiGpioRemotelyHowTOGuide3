// heroku, change to url connecting to
var socket = require("socket.io-client")("https://ledbutton0607.herokuapp.com");
//local host 
//var socket = require("socket.io-client")("http://localhost:3000"); //may change from 3000 as errors in local testing otherwise
var gpio = require("rpi-gpio"); //uses direct pin numbering

//added below led control for button/led control
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO as BCM numbering
var LEDB = new Gpio(27, 'out'); //use GPIO27/pin 15 as output 
var pushButton = new Gpio(22, 'in', 'both'); //use GPIO 22/pin 15 as input, and 'both' button presses, and releases should be handled


//this is used for qol when program ends, turns led off when client not connected
process.on("SIGINT", function(){
  LEDB.writeSync(0); // Turn LED off
  LEDB.unexport(); // Unexport LED GPIO to free resources
  pushButton.unexport(); // Unexport Button GPIO to free resources
  gpio.write(37, true, function(){
    gpio.destroy(function(){
      process.exit();
    });
  });
});


var led =gpio.setup(37, gpio.DIR_OUT, function(){
  gpio.write(37, true); // turns led off as in active low config
});


//below works with null
//var button = gpio.setup(15, gpio.DIR_IN, pull_up_down=gpio.PUD_UP);

//connect to server

    socket.on("connect", function () {
        console.log("Connected to server");
        //update change anytime there is one
        socket.on("updateState", function (state) {
            console.log("The new state is: " + state);
            gpio.write(37, !state);
        });

	pushButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton GPIO, specify callback function
  	if (err) { //if an error
    	console.error('There was an error', err); //output error message to console
  	return;
  	}
  	LEDB.writeSync(value); //turn LED on or off depending on the button state (0 or 1)
  	//write pin status to console
  	console.log(' Pin status is : ', value);
	//need to change to emit when true or false

	//Sending pin state to server, but isn't its own socket.on as not triggered 
	//by a listening event but a gpio state change
	socket.emit("buttonpress", value);
	});

    });


