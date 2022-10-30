// Math constants
const circleDegrees = 360;

// Time constants
const secPerMinute = 60;
const minPerHour = 60;
const hoursPerClockCycle = 12;
const msPerSec = 1000;

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

function calculateSecondsAngle() {
    // Get current angle for the second hand out of 360 degrees
    const now = new Date();
    var seconds = now.getSeconds();
    // The second hand runs slightly fast
    var fastSeconds = Math.round(seconds * (secPerMinute / updateIntervalSeconds));
    return fastSeconds * oneTickAngleDiff;
}

function calculateMinutesAngle() {
    // Get current angle for the minute hand out of 360 degrees
    const now = new Date();
    var minutes = now.getMinutes();
    return minutes * oneTickAngleDiff;
}

function calculateHourAngle() {
    // Get current angle for the hour hand out of 360 degrees
    const now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    return (hourAngleDiff * (hours % 12)) + (hoursAdditionalMinuteAngleDiff * minutes);
}

function setClock() {
    var secondHand = document.querySelector('#second-hand');
    var minuteHand = document.querySelector('#minute-hand');
    var hourHand = document.querySelector('#hour-hand');

    var secondAngle = calculateSecondsAngle();
    var minuteAngle = calculateMinutesAngle();
    var hourAngle = calculateHourAngle()

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

function rotateElastic(hand, oldAngle, newAngle) {
    // Rotate the hand element
    // Over 1.2 seconds, between oldAngle and newAngle
    // approximate the damping function
    // y(t) = -(e^(-t)cos(pi2t)) + 1
    // we want 8 mins + maxes, so the period for t is 4.
    overallTime = 1.2 * msPerSec;

    // See https://easings.net/#easeOutElastic
    // Unfortunatly rotate doesn't work with css keyframes
    // so we're stuck with this
    var elasticMovements = [
        // fraction of animation, fraction of motion
        [1/8, 1.6065],
        [2/8, 0.6321],
        [3/8, 1.2231],
        [4/8, 0.8646],
        [5/8, 1.0821],
        [6/8, 0.9502],
        [7/8, 1.0302],
        [1,   1],
    ]

    for (var i = 0; i < elasticMovements.length; i++) {
        var timeFraction = elasticMovements[i][0];
        var motionFraction = elasticMovements[i][1];
        var time = overallTime * timeFraction;
        var angle = ((newAngle - oldAngle) * motionFraction) + oldAngle;

        setTimeout(setHandAngleClosure(hand, angle), time);
    }
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

function updateMinute() {
    var minuteHand = document.querySelector('#minute-hand');
    
    // Angle of the current minute hand.
    // This can to arbitrarily above 360 as the hand keeps rotating.
    var oldMinuteAngle = Number(minuteHand.style.transform.match(/\d+/)[0])

    // New angle the minute hand should be at out of 360
    var newMinuteAngleMod360 = calculateMinutesAngle();

    diff = (newMinuteAngleMod360 - (oldMinuteAngle % circleDegrees));
    if (diff < 0) {diff = diff + circleDegrees;}
    newMinuteAngle = oldMinuteAngle + diff;

    rotateElastic(minuteHand, oldMinuteAngle, newMinuteAngle);
}

function updateHour() {
    var hourHand = document.querySelector('#hour-hand');

    // Angle of the current hour hand.
    // This can to arbitrarily above 360 as the hand keeps rotating.
    var oldHourAngle = Number(hourHand.style.transform.match(/\d+/)[0])

    // New angle the hour hand should be at out of 360
    var newHourAngleMod360 = calculateHourAngle();

    diff = (newHourAngleMod360 - (oldHourAngle % circleDegrees));
    if (diff < 0) {diff = diff + circleDegrees;}
    newHourAngle = oldHourAngle + diff;

    rotateElastic(hourHand, oldHourAngle, newHourAngle);
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

function runClock() {
    // This tries to imitate the 'master timed' behavior of the DB clocks.
    // https://en.wikipedia.org/wiki/Swiss_railway_clock#Technology
    var now = new Date();
    // In theory in every call of this except the first one ms should be near 0 or 1000 ms

    updateMinute();
    updateHour();
    var timeUntilNextMinute = timeUntilNextMinuteBoundary();

    setTimeout(runClock, timeUntilNextMinute);

    updateSecondHandUntilMinuteEnds();
}

function resetClock() {
    updateSecond();
    updateMinute();
    updateHour();
    // Start second hand if it's stopped
    updateSecondHandUntilMinuteEnds();
}

setClock();
runClock();

// js timing gets weird if the tab doesn't have focus
// if we regain focus reset the clock to keep things from being too off
window.onfocus = resetClock;