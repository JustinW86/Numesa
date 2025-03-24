const { jsPDF } = window.jspdf;

let timerInterval = null;
let timeElapsed = 0;
let isPaused = false;
let tasks = [];

const taskNameInput = document.getElementById('taskName');
const taskDescInput = document.getElementById('taskDesc');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const timerDisplay = document.getElementById('timer');
const taskList = document.getElementById('taskList');
const exportBtn = document.getElementById('exportBtn');

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}

function updateTimer() {
    timerDisplay.textContent = formatTime(timeElapsed);
}

function startTimer() {
    if (!taskNameInput.value || !taskDescInput.value) {
        alert('Please enter a task name and description.');
        return;
    }
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    taskNameInput.disabled = true;
    taskDescInput.disabled = true;

    timerInterval = setInterval(() => {
        if (!isPaused) {
            timeElapsed++;
            updateTimer();
        }
    }, 1000);
}

function pauseTimer() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
}

function stopTimer() {
    clearInterval(timerInterval);
    const task = {
        name: taskNameInput.value,
        description: taskDescInput.value,
        duration: formatTime(timeElapsed)
    };
    tasks.push(task);
    updateTaskList();
    resetTimer();
}

function resetTimer() {
    clearInterval(timerInterval);
    timeElapsed = 0;
    isPaused = false;
    updateTimer();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    taskNameInput.disabled = false;
    taskDescInput.disabled = false;
    taskNameInput.value = '';
    taskDescInput.value = '';
}

function updateTaskList() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = `${task.name} - ${task.description} (Duration: ${task.duration})`;
        taskList.appendChild(li);
    });
}

function exportToPDF() {
    const doc = new jsPDF();
    doc.text("Today's Tasks", 10, 10);
    let y = 20;
    tasks.forEach((task, index) => {
        doc.text(`${index + 1}. ${task.name} - ${task.description} (Duration: ${task.duration})`, 10, y);
        y += 10;
    });
    doc.save(`tasks_${new Date().toISOString().split('T')[0]}.pdf`);
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
stopBtn.addEventListener('click', stopTimer);
exportBtn.addEventListener('click', exportToPDF);

// Initial timer display
updateTimer();