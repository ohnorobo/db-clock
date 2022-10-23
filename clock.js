
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
    return (hourAngleDiff * hours) + (hoursAdditionalMinuteAngleDiff * minutes);
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
    currentMinuteAngle = Number(minuteHand.style.transform.match(/\d+/)[0])
    var currentMinute = (currentMinuteAngle / oneTickAngleDiff) % minPerHour

    const now = new Date();
    var newMinute = now.getMinutes();

    diff = newMinute - currentMinute
    newMinuteAngle = currentMinuteAngle + (oneTickAngleDiff * diff)
    minuteHand.style.transform = 'rotate('+ newMinuteAngle +'deg)';
}

function updateHour() {
    var hourHand = document.querySelector('#hour-hand');
    currentHourAngle = hourHand.style.transform.match(/\d+/)[0]
    var currentHour = (currentHourAngle / hourAngleDiff) % 24

    console.log("hour: " + currentHour)

    const now = new Date();
    var newHour = now.getHours();

    newHourAngle = currentHourAngle + hourAngleDiff
    hourHand.style.transform = 'rotate('+ newHourAngle +'deg)';
}

function timeUntilNextMinuteBoundary() {
    // returns ms until next minute boundary
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

    updateMinute();
    updateHour();
    var timeUntilNextMinute = timeUntilNextMinuteBoundary();

    setTimeout(runClock, timeUntilNextMinute)

    isSecondHandIncrementing = true;
    updateSecondHandUntilMinuteEnds();
}

setClock();
runClock();
