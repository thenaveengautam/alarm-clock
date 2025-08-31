let alarmTime = null;
let alarmActive = false;
let alarmRinging = false;
let audioContext = null;
let oscillator = null;

function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    const timeString = `${hours}:${minutes}:${seconds}`;
    document.getElementById('digitalClock').textContent = timeString;

    // Update date
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);

    // Check alarm
    if (alarmActive && alarmTime) {
        const currentTime = `${hours}:${minutes}`;
        if (currentTime === alarmTime && !alarmRinging) {
            triggerAlarm();
        }
    }
}

function setAlarm() {
    const hours = document.getElementById('hours').value.padStart(2, '0');
    const minutes = document.getElementById('minutes').value.padStart(2, '0');

    if (!hours || !minutes) {
        alert('Please enter both hours and minutes');
        return;
    }

    if (parseInt(hours) < 0 || parseInt(hours) > 23 || parseInt(minutes) < 0 || parseInt(minutes) > 59) {
        alert('Please enter valid time (Hours: 0-23, Minutes: 0-59)');
        return;
    }

    alarmTime = `${hours}:${minutes}`;
    alarmActive = true;
    alarmRinging = false;

    const statusElement = document.getElementById('alarmStatus');
    statusElement.textContent = `Alarm set for ${alarmTime}`;
    statusElement.className = 'alarm-status alarm-set';
}

function stopAlarm() {
    alarmActive = false;
    alarmRinging = false;
    alarmTime = null;

    // Stop audio
    if (oscillator) {
        oscillator.stop();
        oscillator = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }

    // Reset UI
    const statusElement = document.getElementById('alarmStatus');
    statusElement.textContent = 'No alarm set';
    statusElement.className = 'alarm-status alarm-off';

    const container = document.getElementById('clockContainer');
    container.classList.remove('ringing-animation');

    // Clear inputs
    document.getElementById('hours').value = '';
    document.getElementById('minutes').value = '';
}

function triggerAlarm() {
    alarmRinging = true;

    // Update UI
    const statusElement = document.getElementById('alarmStatus');
    statusElement.textContent = '🚨 ALARM RINGING! 🚨';
    statusElement.className = 'alarm-status alarm-ringing';

    const container = document.getElementById('clockContainer');
    container.classList.add('ringing-animation');

    // Create audio alarm
    createAlarmSound();
}

function createAlarmSound() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        function beep() {
            if (!alarmRinging) return;

            oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);

            oscillator.onended = () => {
                if (alarmRinging) {
                    setTimeout(beep, 200);
                }
            };
        }

        beep();
    } catch (error) {
        // Fallback if audio context fails
        console.log('Audio not available, using visual alarm only');
    }
}

// Initialize clock
updateClock();
setInterval(updateClock, 1000);

// Handle input restrictions
document.getElementById('hours').addEventListener('input', function () {
    if (this.value > 23) this.value = 23;
    if (this.value < 0) this.value = 0;
});

document.getElementById('minutes').addEventListener('input', function () {
    if (this.value > 59) this.value = 59;
    if (this.value < 0) this.value = 0;
});

// Auto-focus next input
document.getElementById('hours').addEventListener('input', function () {
    if (this.value.length === 2) {
        document.getElementById('minutes').focus();
    }
});