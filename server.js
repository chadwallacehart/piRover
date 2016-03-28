/**tiny
 * Created by chad on 8/30/2014.
 */
var router = require('tiny-router'),
    fs = require('fs');
var five = require("johnny-five");
var Raspi = require("raspi-io");


var board = new five.Board({
    io: new Raspi()
});

var led, rf, rb, lf, lb;

board.on("ready", function() {
    led = new five.Led("P1-40");
    rf = new five.Pin("P1-11"); //RF | PIN11 | GPIO17 | green wire
    rb = new five.Pin("P1-13"); //RB | PIN13 | GPIO23 | red wire
    lf = new five.Pin("P1-15"); //LF | PIN15 | GPIO22 | white wire
    lb = new five.Pin("P1-16"); //LB | PIN16 | GPIO23 | yellow wire

    //initialize all the pins to low
    rf.low();
    rb.low();
    lf.low();
    lb.low();

    //hello world
    led.blink();
});

router
    .use('static', {path: './static'})
    // Use the onboard file system (as opposed to microsd)
    .use('fs', fs);


router
    .get('/', function(req, res){
        res.send('./static/index.html');
        console.log('home page');
    })

    .get('/ping', function(req, res){
        res.send('alive');
        console.log('ping');
    })


    .get('/rest', function(req, res) {
        res.send(   '<h1>Simple REST API for Elenco Rover</h1>' +
                    '<p><h3>Commands</h3></p>' +
                    '<ul>' +
                    '<li><a href="/forward">/forward</a> - move forward for 1 second</li>' +
                    '<li><a href="/backward">/backward</a> - move backward for 1 second</li>' +
                    '<li><a href="/spinright">/spinright</a> - spin to the right for 1 second</li>' +
                    '<li><a href="/spinleft">/spinleft</a> - spin to the left for 1 second</li>' +
                    '<li>/rf/t - right forward for t seconds</li>' +
                    '<li>/rb/t - right backward for t seconds</li>' +
                    '<li>/lf/t - left forward for t seconds</li>' +
                    '<li>/lb/t - left backward for t seconds</li>' +
                    '</ul>');
        console.log("rest");
    })

    .get('/forward/{t}', function(req, res){
        var t = parseInt(req.body.t);
        if (isNaN(t)) t = 1;
        res.send("Moving forward");
        console.log("Toggling rf & lf for " + t + " seconds");
        rf.high();
        lf.high();
        setTimeout(function(){
                rf.low();
                lf.low();
            }
            , t * 1000);
    })

    .get('/backward/{t}', function(req, res){
        var t = parseInt(req.body.t);
        if (isNaN(t)) t = 1;
        res.send("Moving backward");
        console.log("Toggling rb & lb for " + t + " seconds");
        rb.high();
        lb.high();
        setTimeout(function(){
                rb.low();
                lb.low();
            }
            , 1000);
    })

    .get('/spinright/{t}', function(req, res){
        var t = parseInt(req.body.t);
        if (isNaN(t)) t = 1;
        res.send("Spinning right");
        console.log("Toggling rf & lb for " + t + " seconds");
        lf.high();
        rb.high();
        setTimeout(function(){
                lf.low();
                rb.low();
            }
            , 1000);
    })
    .get('/spinleft/{t}', function(req, res){
        var t = parseInt(req.body.t);
        if (isNaN(t)) t = 1;
        res.send("Spinning left");
        console.log("Toggling rf & lb for " + t + " seconds");
        rf.high();
        lb.high();
        setTimeout(function(){
                rf.low();
                lb.low();
            }
            , 1000);
    })

    .get('/rf/{t}', function(req, res){
        var t = parseInt(req.body.t);
        if (isNaN(t)) t = 1;
        res.send("Toggling rf for " + t);
        console.log("Toggling rf on for " + t + " seconds");
        rf.high();
        setTimeout(function(){
                rf.low();
            }
            , t * 1000);
    })

    .get('/rb/{t}', function(req, res){
        var t = parseInt(req.body.t);
        if (isNaN(t)) t = 1;
        res.send("Toggling rb for " + t);
        console.log("Toggling rb on for " + t + " seconds");
        rb.high();
        setTimeout(function(){
                rb.low();
            }
            , t * 1000);
    })

    .get('/lf/{t}', function(req, res){
        var t = parseInt(req.body.t);
        if (isNaN(t)) t = 1;
        res.send("Toggling G3 for " + t);
        console.log("Toggling G3 on for " + t + " seconds");
        lf.high();
        setTimeout(function(){
                lf.low();
            }
            , t * 1000);
    })

    .get('/lb/{t}', function(req, res){
        var t = parseInt(req.body.t);
        if (isNaN(t)) t = 1;
        res.send("Toggling G4 for " + t);
        console.log("Toggling G4 on for " + t + " seconds");
        lb.high();

        setTimeout(function(){
                lb.low();

            }
            , t * 1000);
    })
;

function start(){

        router.listen(8080);
        console.log("listening on port 8080");
}

start();