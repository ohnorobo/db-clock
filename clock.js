// This tries to imitate the 'master timed' behavior of the DB clocks.
// https://en.wikipedia.org/wiki/Swiss_railway_clock#Technology

const bezier = require(['./bezier_easing']);

// Math constants
const circleDegrees = 360;

// Time constants
const secPerMinute = 60;
const minPerHour = 60;
const hoursPerClockCycle = 12;
const msPerSec = 1000;
const wobbleLengthSec = 1.2;

// The second hand runs slightly fast
// https://en.wikipedia.org/wiki/Swiss_railway_clock#Technology
const updateIntervalSeconds = 58.5;
//const updateIntervalSeconds = 60*3;

// A deflection of one minute/second tick on the clock
const oneTickAngleDiff = circleDegrees / minPerHour;
// A deflection of one hour tick on the clock
const hourAngleDiff = circleDegrees / hoursPerClockCycle;
// Additional amount the hour hand is deflected per minute
const hoursAdditionalMinuteAngleDiff = hourAngleDiff / minPerHour

// Update intervals for clock components in milliseconds
secondUpdateInterval = (updateIntervalSeconds / secPerMinute) * msPerSec
minuteUpdateInterval = secPerMinute * msPerSec


function cubicBezierEase(t) {
    // Return the diff from 0 to change in a cubic bezier ease over time.
    // t is a time from 0 to 1

    const p1 = .35;
    const p2 = .11;
    const p3 = .18;
    const p4 = .92;

    var easing = BezierEasing(p1, p2, p3, p4);

    return easing(t)

    /*
    return (1-t)^3 * p1 + 
           3 * (1-t)^2 * p2 + 
           3 * (1-t) * p3 + 
           t^3 * p4;
    */
}


function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x^3 : 1 - (-2 * x + 2)^3 / 2;
}


function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
function C (aA1)      { return 3.0 * aA1; }

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
function calcBezier (aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }



function dampedSpring(t) {
    // A damped spring that moves from 0 to 1 in the domain t=[0,1] and bounces n times

    amplitude = 1;
    dampening = .9; // 0-1,  0 = no dampening, 1 = infinite dampening
    num_peaks = 7;

    return -1 * amplitude * Math.pow((1 - dampening), t) * Math.cos((num_peaks + .5) * Math.PI * t) + 1
}


function baseSecondsAngle(now) {
    // Get current angle for the second hand out of 360 degrees
    var seconds = now.getSeconds();
    // The second hand runs slightly fast
    var fastSeconds = Math.round(seconds * (secPerMinute / updateIntervalSeconds));
    // but pauses at the top
    return Math.min(fastSeconds * oneTickAngleDiff, 360);
}

function baseMinutesAngle(now) {
    // Get current angle for the minute hand out of 360 degrees
    var minutes = now.getMinutes();
    return minutes * oneTickAngleDiff;
}

function baseHourAngle(now) {
    // Get current angle for the hour hand out of 360 degrees
    var hours = now.getHours();
    var minutes = now.getMinutes();
    return (hourAngleDiff * (hours % 12)) + (hoursAdditionalMinuteAngleDiff * minutes);
}


function calculateSecondsAngle(now) {
    // TODO calculate ease
    return baseSecondsAngle(now);
}

function calculateMinutesAngle(now) {
    var minuteAngle = baseMinutesAngle(now);
    var msPastMinuteStart = (now.getSeconds() * msPerSec + now.getMilliseconds());

    if (msPastMinuteStart <= wobbleLengthSec * msPerSec) {
        // How much of the wobble time is completed [0,1]
        var wobble_fraction = msPastMinuteStart / (msPerSec * wobbleLengthSec);
        // x value of wobble [0,1+] where 1 is the ending point
        var wobble = dampedSpring(wobble_fraction);

        minuteAngle = minuteAngle + oneTickAngleDiff * (wobble - 1);
    }    
    return minuteAngle
}

function calculateHourAngle(now) {
    var hourAngle = baseHourAngle(now);
    var msPastMinuteStart = (now.getSeconds() * msPerSec + now.getMilliseconds());

    if (msPastMinuteStart <= wobbleLengthSec * msPerSec) {
        // How much of the wobble time is completed [0,1]
        var wobble_fraction = msPastMinuteStart / (msPerSec * wobbleLengthSec);
        // x value of wobble [0,1+] where 1 is the ending point
        var wobble = dampedSpring(wobble_fraction);

        hourAngle = hourAngle + hoursAdditionalMinuteAngleDiff * (wobble - 1);
    }    
    return hourAngle
}


function setClock() {
    var secondHand = document.querySelector('#second-hand');
    var minuteHand = document.querySelector('#minute-hand');
    var hourHand = document.querySelector('#hour-hand');

    var now = new Date();

    var secondAngle = calculateSecondsAngle(now);
    var minuteAngle = calculateMinutesAngle(now);
    var hourAngle = calculateHourAngle(now)

    secondHand.style.transform = 'rotate('+ secondAngle +'deg)';
    minuteHand.style.transform = 'rotate('+ minuteAngle +'deg)';
    hourHand.style.transform = 'rotate('+ hourAngle +'deg)';
}

function setHandAngle(hand, angle) {
    hand.style.transform = 'rotate('+ angle +'deg)'; 
}

function setHandAngleClosure(hand, angle) {
    // Angle setting function to be called as a closure
    return(function() {
        setHandAngle(hand, angle)
    })
}

// Sometime for js timing reasons updateSecondHandUntilMinuteEnds
// is called while already running.
// This helps us keep track and ignore that.
var isSecondHandIncrementing = false;

function updateSecondHandUntilMinuteEnds() {
    if (isSecondHandIncrementing) {
        return;
    }

    isSecondHandIncrementing = true;
    updateSecondHandUntilMinuteEndsTick();
}

function updateSecondHandUntilMinuteEndsTick() {
    // Continually update the second hand position until it reaches 0 degrees.
    var secondHand = document.querySelector('#second-hand');
    var currentSecondAngle = Number(secondHand.style.transform.match(/\d+/)[0]);
    var currentSecond = (currentSecondAngle / oneTickAngleDiff) % secPerMinute;

    newSecondAngle = currentSecondAngle + oneTickAngleDiff;
    setHandAngle(secondHand, newSecondAngle);

    if (currentSecond == secPerMinute - 1) {
        isSecondHandIncrementing = false;
        return; // stop
    } else {
        setTimeout(updateSecondHandUntilMinuteEndsTick, secondUpdateInterval);
    }
}

function updateSecond() {
    var secondHand = document.querySelector('#second-hand');
    
    // Angle of the current second hand.
    // This can to arbitrarily above 360 as the hand keeps rotating.
    var oldSecondAngle = Number(secondHand.style.transform.match(/\d+/)[0])

    // New angle the second hand should be at out of 360
    var newSecondAngleMod360 = calculateSecondsAngle();

    diff = (newSecondAngleMod360 - (oldSecondAngle % circleDegrees));
    // If we're <= 10 seconds behind we adjust backwards, otherwise forward.
    if (diff < -10 * oneTickAngleDiff) {diff = diff + circleDegrees;}
    newSecondAngle = oldSecondAngle + diff;

    setHandAngle(secondHand, newSecondAngle);
}

function timeUntilNextMinuteBoundary() {
    // returns milliseconds until next minute boundary
    var now = new Date();
    var seconds = now.getSeconds();
    var milliseconds = now.getMilliseconds();

    var oneMinuteBoundaryAgo = now - ((seconds * msPerSec) + milliseconds);
    var oneMinuteBoundaryFromNow = oneMinuteBoundaryAgo + (secPerMinute * msPerSec);

    var diff = oneMinuteBoundaryFromNow - now;
    return diff;
}

setInterval(setClock, 1);