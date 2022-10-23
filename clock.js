
const updateIntervalSeconds = 58.5;
const secPerMinute = 60;
const msPerSec = 1000;
const oneTickAngleDiff = 6;
const hourAngleDiff = 30;

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
    hourAngle = hourAngleDiff * now.getHours();

    console.log("seconds angle: " + secondAngle)
    console.log("minutes angle: " + minuteAngle)
    console.log("hours angle: " + hourAngle)

    secondHand.style.transform = 'rotate('+ secondAngle +'deg)';
    minuteHand.style.transform = 'rotate('+ minuteAngle +'deg)';
    hourHand.style.transform = 'rotate('+ hourAngle +'deg)';
}

function updateMinute() {
    var minuteHand = document.querySelector('#minute-hand');
    currentMinuteAngle = Number(minuteHand.style.transform.match(/\d+/)[0])
    var currentMinute = (currentMinuteAngle / oneTickAngleDiff) % secPerMinute

    const now = new Date();
    var newMinute = now.getMinutes();

    if (currentMinute != newMinute) {
        diff = newMinute - currentMinute
        newMinuteAngle = currentMinuteAngle + (6 * diff)
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
    updateHour();
    var timeUntilNextMinute = timeUntilNextMinuteBoundary();

    setTimeout(runClock, timeUntilNextMinute)
    updateSecondHandUntilMinuteEnds();
}

setClock();
runClock();
