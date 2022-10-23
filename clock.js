
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

function setClock() {
    const now = new Date();

    var secondHand = document.querySelector('#second-hand');
    var minuteHand = document.querySelector('#minute-hand');
    var hourHand = document.querySelector('#hour-hand');

    console.log("seconds: " + now.getSeconds())
    console.log("minutes: " + now.getMinutes())
    console.log("hours: " + now.getHours())

    secondAngle = oneTickAngleDiff * now.getSeconds();
    minuteAngle = oneTickAngleDiff * now.getMinutes();
    hourAngle = (hourAngleDiff * now.getHours()) + (hoursAdditionalMinuteAngleDiff * now.getMinutes());

    console.log("additional hour diff: " + hoursAdditionalMinuteAngleDiff * now.getMinutes());

    console.log("seconds angle: " + secondAngle)
    console.log("minutes angle: " + minuteAngle)
    console.log("hours angle: " + hourAngle)

    secondHand.style.transform = 'rotate('+ secondAngle +'deg)';
    minuteHand.style.transform = 'rotate('+ minuteAngle +'deg)';
    hourHand.style.transform = 'rotate('+ hourAngle +'deg)';
}

function updateSecondHandUntilMinuteEnds() {
    var secondHand = document.querySelector('#second-hand');
    currentSecondAngle = Number(secondHand.style.transform.match(/\d+/)[0]);
    var currentSecond = (currentSecondAngle / oneTickAngleDiff) % secPerMinute;

    newSecondAngle = currentSecondAngle + oneTickAngleDiff;
    secondHand.style.transform = 'rotate('+ newSecondAngle +'deg)';

    if (currentSecond == secPerMinute - 1) {
        // stop
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

    if (currentMinute != newMinute) {
        diff = newMinute - currentMinute
        newMinuteAngle = currentMinuteAngle + (oneTickAngleDiff * diff)
        minuteHand.style.transform = 'rotate('+ newMinuteAngle +'deg)';
    }
}

function updateHour() {
    var hourHand = document.querySelector('#hour-hand');
    currentHourAngle = hourHand.style.transform.match(/\d+/)[0]
    var currentHour = (currentHourAngle / hourAngleDiff) % 24

    console.log("hour: " + currentHour)

    const now = new Date();
    var newHour = now.getHours();

    if (currentHour != newHour) {
        newHourAngle = currentHourAngle + hourAngleDiff
        hourHand.style.transform = 'rotate('+ newHourAngle +'deg)';
    }
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
    updateMinute();
    //updateHour();
    var timeUntilNextMinute = timeUntilNextMinuteBoundary();

    setTimeout(runClock, timeUntilNextMinute)
    updateSecondHandUntilMinuteEnds();
}

setClock();
runClock();
