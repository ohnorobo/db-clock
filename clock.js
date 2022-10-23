function setClock() {
    const now = new Date();

    var secondHand = document.querySelector('#second-hand');
    var minuteHand = document.querySelector('#minute-hand');
    var hourHand = document.querySelector('#hour-hand');

    console.log("seconds: " + now.getSeconds())
    console.log("minutes: " + now.getMinutes())
    console.log("hours: " + now.getHours())

    secondAngle = 6 * now.getSeconds();
    minuteAngle = 6 * now.getMinutes();
    hourAngle = 30 * now.getHours();

    console.log("seconds angle: " + secondAngle)
    console.log("minutes angle: " + minuteAngle)
    console.log("hours angle: " + hourAngle)

    secondHand.style.transform = 'rotate('+ secondAngle +'deg)';
    minuteHand.style.transform = 'rotate('+ minuteAngle +'deg)';
    hourHand.style.transform = 'rotate('+ hourAngle +'deg)';
}

function updateSecond() {
    var secondHand = document.querySelector('#second-hand');
    currentSecondAngle = Number(secondHand.style.transform.match(/\d+/)[0])
    var currentSecond = (currentSecondAngle / 6) % 360

    console.log("current seconds angle: " + currentSecondAngle)
    console.log("current seconds: " + currentSecond)

    const now = new Date();
    var newSecond = now.getSeconds();

    console.log("new seconds: " + newSecond)

    // Unless we're at the end early
    //if (currentSecond != 0 && newSecond == 0) {
        // Increment
        newSecondAngle = currentSecondAngle + 6
        secondHand.style.transform = 'rotate('+ newSecondAngle +'deg)';
    //}
}

function updateMinute() {
    var minuteHand = document.querySelector('#minute-hand');
    currentMinuteAngle = Number(minuteHand.style.transform.match(/\d+/)[0])
    var currentMinute = (currentMinuteAngle / 6) % 60

    console.log("current minute angle: " + currentMinuteAngle)
    console.log("current minute: " + currentMinute)

    const now = new Date();
    var newMinute = now.getMinutes();

    console.log("new minute: " + newMinute)

    if (currentMinute != newMinute) {
        diff = newMinute - currentMinute

        console.log("minute diff: " + diff)

        newMinuteAngle = currentMinuteAngle + (6 * diff)

        console.log("new minute angle: " + newMinuteAngle)

        minuteHand.style.transform = 'rotate('+ newMinuteAngle +'deg)';
    }
}

function updateHour() {
    var hourHand = document.querySelector('#hour-hand');
    currentHourAngle = hourHand.style.transform.match(/\d+/)[0]
    var currentHour = (currentHourAngle / 30) % 24

    console.log("hour: " + currentHour)

    const now = new Date();
    var newHour = now.getHours();

    if (currentHour != newHour) {
        newHourAngle = currentHourAngle + 30
        hourHand.style.transform = 'rotate('+ newHourAngle +'deg)';
    }
}





const updateIntervalSeconds = 58.5;
const secPerMinute = 60;
const msPerSec = 1000;

secondUpdateInterval = (updateIntervalSeconds / secPerMinute) * msPerSec
minuteUpdateInterval = secPerMinute * msPerSec

var secondIntervalId;

function updateClock() {
    // This tries to imitate the 'master timed' behavior of the DB clocks.
    // https://en.wikipedia.org/wiki/Swiss_railway_clock#Technology
    // This should be called at the top of each minute
    clearInterval(secondIntervalId)
    secondIntervalId = setInterval(updateSecond, secondUpdateInterval)

    console.log(secondIntervalId)
    
    updateMinute()
    updateHour()
}



function updateSecondHandUntilMinuteEnds() {
    var secondHand = document.querySelector('#second-hand');
    currentSecondAngle = Number(secondHand.style.transform.match(/\d+/)[0])
    var currentSecond = (currentSecondAngle / 6) % 360

    console.log("current seconds angle: " + currentSecondAngle)
    console.log("current seconds: " + currentSecond)

    if (currentSecond == 0) {
        // stop
    } else {
        newSecondAngle = currentSecondAngle + 6
        secondHand.style.transform = 'rotate('+ newSecondAngle +'deg)';

        setTimeout(updateSecondHandForMinute, secondUpdateInterval);
    }
}


setClock();
updateSecondHandUntilMinuteEnds();
//updateClock();
//setInterval(updateClock, minuteUpdateInterval)

