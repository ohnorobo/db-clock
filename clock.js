// Math constants
const circleDegrees = 360;

// Time constants
const secPerMinute = 60;
const minPerHour = 60;
const hoursPerClockCycle = 12;
const msPerSec = 1000;

// The minute hand runs slightly fast
// https://en.wikipedia.org/wiki/Swiss_railway_clock#Technology
const updateIntervalSeconds = 58.5;

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
    console.log("seconds: " + seconds);
    return seconds * oneTickAngleDiff;
}

function calculateMinutesAngle() {
    // Get current angle for the minute hand out of 360 degrees
    const now = new Date();
    var minutes = now.getMinutes();
    console.log("minutes: " + minutes);
    return minutes * oneTickAngleDiff;
}

function calculateHourAngle() {
    // Get current angle for the hour hand out of 360 degrees
    const now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    console.log("hours: " + hours);
    console.log("additional hour diff: " + hoursAdditionalMinuteAngleDiff * now.getMinutes());
    return (hourAngleDiff * (hours % 12)) + (hoursAdditionalMinuteAngleDiff * minutes);
}

function setClock() {
    var secondHand = document.querySelector('#second-hand');
    var minuteHand = document.querySelector('#minute-hand');
    var hourHand = document.querySelector('#hour-hand');

    var secondAngle = calculateSecondsAngle();
    var minuteAngle = calculateMinutesAngle();
    var hourAngle = calculateHourAngle()

    console.log("seconds angle: " + secondAngle)
    console.log("minutes angle: " + minuteAngle)
    console.log("hours angle: " + hourAngle)

    secondHand.style.transform = 'rotate('+ secondAngle +'deg)';
    minuteHand.style.transform = 'rotate('+ minuteAngle +'deg)';
    hourHand.style.transform = 'rotate('+ hourAngle +'deg)';
}

// Sometime for js timing reasons updateSecondHandUntilMinuteEnds
// is called while already running.
// This helps us keep track and ignore that.
var isSecondHandIncrementing = false;

function updateSecondHandUntilMinuteEnds() {
    // Continually update the second hand position until it reaches 0 degrees.
    var secondHand = document.querySelector('#second-hand');
    var currentSecondAngle = Number(secondHand.style.transform.match(/\d+/)[0]);
    var currentSecond = (currentSecondAngle / oneTickAngleDiff) % secPerMinute;

    newSecondAngle = currentSecondAngle + oneTickAngleDiff;
    secondHand.style.transform = 'rotate('+ newSecondAngle +'deg)';

    if (currentSecond == secPerMinute - 1) {
        isSecondHandIncrementing = false;
        return; // stop
    } else {
        setTimeout(updateSecondHandUntilMinuteEnds, secondUpdateInterval);
    }
}

function updateMinute() {
    var minuteHand = document.querySelector('#minute-hand');
    
    // Angle of the current minute hand.
    // This can to arbitrarily above 360 as the hand keeps rotating.
    var oldMinuteAngle = Number(minuteHand.style.transform.match(/\d+/)[0])

    // New angle the minute hand should be at out of 360
    var newMinuteAngleMod360 = calculateMinutesAngle();

    diff = Math.abs(newMinuteAngleMod360 - oldMinuteAngle) % circleDegrees
    newMinuteAngle = oldMinuteAngle + diff;

    console.log("minute values:" + oldMinuteAngle + " " + newMinuteAngleMod360 + " " + diff + " " + newMinuteAngle);

    minuteHand.style.transform = 'rotate('+ newMinuteAngle +'deg)';
}

function updateHour() {
    var hourHand = document.querySelector('#hour-hand');

    // Angle of the current hour hand.
    // This can to arbitrarily above 360 as the hand keeps rotating.
    var oldHourAngle = Number(hourHand.style.transform.match(/\d+/)[0])

    // New angle the hour hand should be at out of 360
    var newHourAngleMod360 = calculateHourAngle();

    diff = Math.abs(newHourAngleMod360 - oldHourAngle) % circleDegrees
    newHourAngle = oldHourAngle + diff;

    console.log("hour values:" + oldHourAngle + " " + newHourAngleMod360 + " " + diff + " " + newHourAngle);

    hourHand.style.transform = 'rotate('+ newHourAngle +'deg)';
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
    console.log("running runClock:" + now + " : " + now.getMilliseconds());
    // In theory in every call of this except the first one ms should be near 0 or 1000

    updateMinute();
    updateHour();
    var timeUntilNextMinute = timeUntilNextMinuteBoundary();

    setTimeout(runClock, timeUntilNextMinute)

    isSecondHandIncrementing = true;
    updateSecondHandUntilMinuteEnds();
}

setClock();
runClock();