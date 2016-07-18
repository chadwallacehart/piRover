/**tiny
 * Created by chad on 8/30/2014.
 */
//var router = require('tiny-router'),
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    fs = require('fs'),
    io = require('socket.io')(server),
    five = require("johnny-five"),
    Raspi = require("raspi-io");

var Audio = require('aplay');

var board = new five.Board({
    io: new Raspi()
});

var led, rf, rb, lf, lb, sound, disc;

board.on("ready", function () {
    led = new five.Led("P1-40");    //LED       | PIN40 | GPIO21 | green wire
    rf = new five.Pin("P1-11");     //RF        | PIN11 | GPIO17 | green wire
    rb = new five.Pin("P1-13");     //RB        | PIN13 | GPIO23 | red wire
    lf = new five.Pin("P1-15");     //LF        | PIN15 | GPIO22 | white wire
    lb = new five.Pin("P1-16");     //LB        | PIN16 | GPIO23 | yellow wire
    //sound = new five.Pin("P1-18");  //sound     | PIN18 | GPIO24 | yellow wire
    disc = new five.Pin("P1-22");   //disc      | PIN20 | GPIO25 | white wire

    //initialize all the pins
    rf.low();
    rb.low();
    lf.low();
    lb.low();
    //sound.high();
    disc.low();

    //hello world
    led.blink();
});

/*
 router
 .use('static', {path: './static'})
 .use('fs', fs);
 */
// Routing
app.use(express.static(__dirname + '/static'));


//REST Commands
app
    .get('/ping', function (req, res) {
        res.send('pong');
        console.log('ping');
    })



    //To Do: move thsi to a route
    .get('/rest', function (req, res) {
        res.send("<h1>Simple REST API for Elenco Rover</h1><p><h3>Commands</h3></p><ul><li><a href=\"/forward\">/forward</a> - move forward for 1 second</li><li><a href=\"/backward\">/backward</a> - move backward for 1 second</li><li><a href=\"/spinright\">/spinright</a> - spin to the right for 1 second</li><li><a href=\"/spinleft\">/spinleft</a> - spin to the left for 1 second</li><li><a href=\"/sound\">/sound</a> - spin to the left for 1 second</li><li>/rf/t - right forward for t seconds</li><li>/rb/t - right backward for t seconds</li><li>/lf/t - left forward for t seconds</li><li>/lb/t - left backward for t seconds</li></ul>");
        console.log("rest");
    })

    .get('/forward/:t', function (req, res) {
        var t = req.params.t;
        if (isNaN(t)) t = 1;
        res.send("Moving forward");
        console.log("Toggling rf & lf for " + t + " seconds");
        rf.high();
        lf.high();
        setTimeout(function () {
                rf.low();
                lf.low();
            }
            , t * 1000);
    })

    .get('/backward/:t', function (req, res) {
        var t = req.params.t;
        if (isNaN(t)) t = 1;
        res.send("Moving backward");
        console.log("Toggling rb & lb for " + t + " seconds");
        rb.high();
        lb.high();
        setTimeout(function () {
                rb.low();
                lb.low();
            }
            , 1000);
    })

    .get('/spinright/:t', function (req, res) {
        var t = req.params.t;
        if (isNaN(t)) t = 1;
        res.send("Spinning right");
        console.log("Toggling rf & lb for " + t + " seconds");
        lf.high();
        rb.high();
        setTimeout(function () {
                lf.low();
                rb.low();
            }
            , 1000);
    })
    .get('/spinleft/:t', function (req, res) {
        var t = req.params.t;
        if (isNaN(t)) t = 1;
        res.send("Spinning left");
        console.log("Toggling rf & lb for " + t + " seconds");
        rf.high();
        lb.high();
        setTimeout(function () {
                rf.low();
                lb.low();
            }
            , 1000);
    })

    .get('/rf/:t', function (req, res) {
        var t = req.params.t;
        if (isNaN(t)) t = 1;
        res.send("Toggling rf for " + t);
        console.log("Toggling rf on for " + t + " seconds");
        rf.high();
        setTimeout(function () {
                rf.low();
            }
            , t * 1000);
    })

    .get('/rb/:t', function (req, res) {
        var t = req.params.t;
        if (isNaN(t)) t = 1;
        res.send("Toggling rb for " + t);
        console.log("Toggling rb on for " + t + " seconds");
        rb.high();
        setTimeout(function () {
                rb.low();
            }
            , t * 1000);
    })

    .get('/lf/:t', function (req, res) {
        var t = req.params.t;
        if (isNaN(t)) t = 1;
        res.send("Toggling G3 for " + t);
        console.log("Toggling G3 on for " + t + " seconds");
        lf.high();
        setTimeout(function () {
                lf.low();
            }
            , t * 1000);
    })

    .get('/lb/:t', function (req, res) {
        var t = req.params.t;
        if (isNaN(t)) t = 1;
        res.send("Toggling G4 for " + t);
        console.log("Toggling G4 on for " + t + " seconds");
        lb.high();

        setTimeout(function () {
                lb.low();

            }
            , t * 1000);
    })

    .get('/sound/:t', function (req, res) {
        var t = req.params.t;
        if (isNaN(t)) t = 1;
        res.send("Toggling sound for " + t);
        console.log("Toggling sound on for " + t + " seconds");
        sound.low();

        setTimeout(function () {
                sound.high();

            }
            , t * 1000);
    })

    .get('/disc/:t', function (req, res) {
        var t = req.params.t;
        if (isNaN(t)) t = 1;
        res.send("Toggling disc launcher for " + t);
        console.log("Toggling disc launcher on for " + t + " seconds");
        disc.high();

        setTimeout(function () {
                disc.low();
            }
            , t * 1000 + 5000); //give the disc launcher 5 seconds to spin up
    })

    .get('/off', function (req, res) {
        res.send("Turning everything off");

        //re-initialize all the pins
        rf.low();
        rb.low();
        lf.low();
        lb.low();
        //sound.high();
        disc.low();
        console.log("Returning to off state");
    });




//get the list of sound files
var sounds = [];
fs.readdir('./sounds', function (err, items) {
    for (var i = 0; i < items.length; i++) {
        sounds.push({name: items[i].substr(0, 8), file: './sounds/' + items[i]});
    }
});

//initialization sound
var audio = new Audio();
audio.play('./sounds/' + 'R2D2-SoundBible.com-460754772.wav');
var audioPlaying = true;

audio.on('complete', function () {
    audioPlaying = false;
    console.log('audio complete');
});


//ToDo: get a library to handle this like a route
//Websocket commands
io.on('connection', function (socket) {

    //ToDo: just send the sound name instead of the whole object
    socket.emit('init', {'sounds': sounds});

    socket.on('command', function (data) {
        action(data);
    });

    socket.on('commands', function (data) {
        for (var i = 0; i < data.length; i++) {
            action(data[i]);
        }
    });

    socket.on('touchui', function (data){
        gameControl(data);
    });

    var motorState = {rfOn: false, rbOn: false, lfOn: false, lbOn: false};


    function gameControl(command){
        //console.log(command.control);
        //console.log(motorState);
        switch(command.control){
            case 'rfOn':
                //if right going backward, turn it off
                if (motorState.rbOn == true){
                    motorState.rbOn = false;
                    rb.low();
                    console.log("rb to rf");
                }
                //if rf isn't moving, turn it on
                if (motorState.rfOn == false){
                    motorState.rfOn = true;
                    rf.high();
                    console.log("rf to high");
                }

                break;
            case 'rfOff':
                if (motorState.rfOn == true){
                    motorState.rfOn = false;
                    rf.low();
                    console.log("rf to low");
                }
                break;

            case 'rbOn':
                //if right going forward, turn it off
                if (motorState.rfOn == true){
                    motorState.rfOn = false;
                    rf.low();
                    console.log("rf to rb");
                }
                //if rb isn't moving, turn it on
                if (motorState.rbOn == false) {
                    motorState.rbOn = true;
                    rb.high();
                    console.log("rb to high");
                }
                break;
            case 'rbOff':
                if (motorState.rbOn == true){
                    motorState.rbOn = false;
                    rb.low();
                    console.log("rb to low");
                }
                break;

            case 'lfOn':
                //if left going backward, turn it off
                if (motorState.lbOn == true){
                    motorState.lbOn = false;
                    lb.low();
                    console.log("rb to rf");
                }
                //if lb isn't moving, turn it on
                if (motorState.lfOn == false){
                    motorState.lfOn = true;
                    lf.high();
                    console.log("lb to high");
                }
                break;
            case 'lfOff':
                if (motorState.lfOn == true){
                    motorState.lfOn = false;
                    lf.low();
                    console.log("lf to low");
                }
                break;

            case 'lbOn':
                //if left going forward, turn it off
                if (motorState.lfOn == true){
                    motorState.lfOn = false;
                    lf.low();
                    console.log("changing rf to rb");
                }
                if (motorState.lbOn == false){
                    motorState.lbOn = true;
                    lb.high();
                    console.log("lb to high");
                }
                break;
            case 'lbOff':
                if (motorState.lbOn == true){
                    motorState.lbOn = false;
                    lb.low();
                    console.log("lb to low");
                }
                break;
            case 'heartbeat':
                console.log('heartbeat');
                break;
            default:
                console.log("unrecognized control message: " + command.control);

        }
    }



//Commmand handler for GUI programming
    function action(command) {
        console.log(command);

        if (command.sound) {
            var file = "";
            for (var i = 0; i < sounds.length; i++) {
                if (sounds[i].name.search(command.sound) == 0) {
                    file = sounds[i].file;
                }
            }
            if (file) {
                if (audioPlaying == false){
                    audio.play(file);
                    audioPlaying = true;
                }
                else{
                    var delayFunc = setInterval(function(){
                        if (audioPlaying == false){
                            audio.play(file);
                            audioPlaying = true;
                            clearInterval(delayFunc);
                        }
                        else{
                            console.log("waiting to play audio..");
                        }
                    }, 500);
                    console.log("audio was playing");
                }

            }
            else {
                console.log("can't find sound file for " + command.sound);
                socket.emit('error', {'error': "can't find sound file for " + command.sound});
            }
        }
        else if (command.motion){
            t = command.motion.timer * 1000 || 1000;

            if (moving == true){
                var delayFunc = setInterval(function(){
                    if (moving==false){
                        console.log("waiting to move..");
                        clearInterval(delayFunc);
                        motion(command.motion.action, t);
                    }
                }, 500);
            }
            else {
                motion(command.motion.action, t);
            }
        }
        else if (command.launcher){
            t = command.launcher.timer * 1000 || 1000;

            console.log("Toggling disc launcher on for " + t + " ms");
            disc.high();

            setTimeout(function () {
                    disc.low();
                }
                , t);
        }
        else {
            socket.emit('error', {'error': 'invalid command'});
        }
    }
});

var moving = false;
function motion(action, t){
    //ToDo; handle moving= this is there is an invalid action; bad t
    moving = true;
    switch (action) {
        case 'forward':
            console.log("Forward: toggling rf & lf for " + t + " ms");
            rf.high();
            lf.high();
            setTimeout(function () {
                    rf.low();
                    lf.low();
                    moving = false;
                }
                , t);
            break;
        case 'backward':
            console.log("Backward: toggling rb & lb for " + t + " ms");
            rb.high();
            lb.high();
            setTimeout(function () {
                    rb.low();
                    lb.low();
                    moving = false;
                }
                , t);
            break;
        case 'right':
            console.log("Turn right: toggling rf & lb for " + t + " ms");
            lf.high();
            rb.high();
            setTimeout(function () {
                    lf.low();
                    rb.low();
                    moving = false;
                }
                , t);
            break;
        case 'left':
            console.log("Turn left: toggling rf & lb for " + t + " ms");
            rf.high();
            lb.high();
            setTimeout(function () {
                    rf.low();
                    lb.low();
                    moving = false;
                }
                , t);
            break;
    }
}

//ToDo: setup environment vars
var port = process.env.PORT || 2368;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});