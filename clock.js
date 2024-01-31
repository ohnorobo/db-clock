// This tries to imitate the 'master timed' behavior of the DB clocks.
// https://en.wikipedia.org/wiki/Swiss_railway_clock#Technology

// Math constants
const circleDegrees = 360;

// Time constants
const secPerMinute = 60;
const minPerHour = 60;
const hoursPerClockCycle = 12;
const msPerSec = 1000;

// Don't set the framerate too high or animation timing can get messed up
const FPS = 40;

// How long it takes the second hand to circle the clock in seconds
// The second hand runs slightly fast
// https://en.wikipedia.org/wiki/Swiss_railway_clock#Technology
const updateIntervalSeconds = 58.5;
// Some extra time to not pause the second hand abruptly at the top
const pauseBufferSec = .5;
// How long the minute and hour hand wobble when they move
const wobbleLengthSec = 1.2;

// A deflection of one minute or second tick on the clock
const oneTickAngleDiff = circleDegrees / minPerHour;
// A deflection of one hour tick on the clock
const hourAngleDiff = circleDegrees / hoursPerClockCycle;
// Additional amount the hour hand is deflected per minute
const hoursAdditionalMinuteAngleDiff = hourAngleDiff / minPerHour

// Update intervals for clock components in milliseconds
const secondUpdateInterval = (updateIntervalSeconds / secPerMinute) * msPerSec
const minuteUpdateInterval = secPerMinute * msPerSec

// A function which takes a time t [0,1], and returns the x value [0,1] of a cubic ease
// https://cubic-bezier.com/#.35,.11,.18,.92
const cubicBezierEase = bezier(.35,.11,.18,.92);

function dampedSpring(t) {
    // A damped spring that moves from 0 to 1 in the domain t=[0,1] and bounces n times
    const amplitude = 1;  // At this amplitude the first peak is around 1.6
    const dampening = .97; // [0,1], 0 = no dampening, 1 = infinite dampening
    const num_peaks = 7;

    return -1 * amplitude * Math.pow((1 - dampening), t) * Math.cos((num_peaks + .5) * Math.PI * t) + 1
}

function baseSecondAngle(now) {
    // Get current angle for the second hand out of 360 degrees
    var seconds = now.getSeconds();
    // The second hand runs slightly fast
    var fastSeconds = Math.round(seconds * (secPerMinute / updateIntervalSeconds));
    // but pauses at the top
    return Math.min(fastSeconds * oneTickAngleDiff, circleDegrees);
}

function baseMinuteAngle(now) {
    // Get current angle for the minute hand out of 360 degrees
    var minutes = now.getMinutes();
    return minutes * oneTickAngleDiff;
}

function baseHourAngle(now) {
    // Get current angle for the hour hand out of 360 degrees
    var hours = now.getHours();
    var minutes = now.getMinutes();
    return (hourAngleDiff * (hours % hoursPerClockCycle)) + (hoursAdditionalMinuteAngleDiff * minutes);
}

function calculateSecondsAngle(now) {
    var secondAngle = baseSecondAngle(now);
    var msPastMinuteStart = (now.getSeconds() * msPerSec + now.getMilliseconds());

    // Pause at the top
    if (msPastMinuteStart >= (updateIntervalSeconds + pauseBufferSec) * msPerSec) {
        secondAngle = 0;
    } else {
        // Otherwise ease between seconds
        var secondFraction = now.getMilliseconds() / msPerSec;
        secondAngle = secondAngle + oneTickAngleDiff * cubicBezierEase(secondFraction);
    }
    return secondAngle;
}

function calculateMinutesAngle(now) {
    var minuteAngle = baseMinuteAngle(now);
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

setClock();
setInterval(setClock, msPerSec/FPS);