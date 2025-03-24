const { jsPDF } = window.jspdf;

let tasks = [];
const taskContainer = document.getElementById('taskContainer');
const createTaskBtn = document.getElementById('createTaskBtn');
const exportBtn = document.getElementById('exportBtn');

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}

function getTimestamp() {
    return new Date().toLocaleString();
}

function createTaskCard() {
    const taskId = Date.now(); // Unique ID for each task
    const task = {
        id: taskId,
        name: '',
        description: '',
        totalTime: 0,
        isRunning: false,
        isPaused: false,
        interval: null,
        auditTrail: [`Created at ${getTimestamp()}`]
    };
    tasks.push(task);

    const card = document.createElement('div');
    card.className = 'task-card';
    card.id = `task-${taskId}`;
    card.innerHTML = `
        <input type="text" class="task-name" placeholder="Task Name" required>
        <textarea class="task-desc" placeholder="Task Description" required></textarea>
        <div class="timer-controls">
            <button class="start-btn">Start</button>
            <button class="pause-btn" disabled>Pause</button>
            <button class="stop-btn" disabled>Stop</button>
            <button class="delete-btn">Delete</button>
        </div>
        <div class="timer">00:00:00</div>
    `;

    const startBtn = card.querySelector('.start-btn');
    const pauseBtn = card.querySelector('.pause-btn');
    const stopBtn = card.querySelector('.stop-btn');
    const deleteBtn = card.querySelector('.delete-btn');
    const timerDisplay = card.querySelector('.timer');
    const nameInput = card.querySelector('.task-name');
    const descInput = card.querySelector('.task-desc');

    startBtn.addEventListener('click', () => startTimer(task, startBtn, pauseBtn, stopBtn, nameInput, descInput, timerDisplay));
    pauseBtn.addEventListener('click', () => pauseTimer(task, pauseBtn));
    stopBtn.addEventListener('click', () => stopTimer(task, startBtn, pauseBtn, stopBtn, nameInput, descInput, timerDisplay));
    deleteBtn.addEventListener('click', () => deleteTask(taskId, card));

    taskContainer.appendChild(card);
}

function startTimer(task, startBtn, pauseBtn, stopBtn, nameInput, descInput, timerDisplay) {
    if (!nameInput.value || !descInput.value) {
        alert('Please enter a task name and description.');
        return;
    }
    task.name = nameInput.value;
    task.description = descInput.value;
    task.isRunning = true;
    task.isPaused = false;
    task.auditTrail.push(`Started at ${getTimestamp()}`);

    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    nameInput.disabled = true;
    descInput.disabled = true;

    task.interval = setInterval(() => {
        if (task.isRunning && !task.isPaused) {
            task.totalTime++;
            timerDisplay.textContent = formatTime(task.totalTime);
        }
    }, 1000);
}

function pauseTimer(task, pauseBtn) {
    task.isPaused = !task.isPaused;
    task.auditTrail.push(`${task.isPaused ? 'Paused' : 'Resumed'} at ${getTimestamp()}`);
    pauseBtn.textContent = task.isPaused ? 'Resume' : 'Pause';
}

function stopTimer(task, startBtn, pauseBtn, stopBtn, nameInput, descInput, timerDisplay) {
    clearInterval(task.interval);
    task.isRunning = false;
    task.isPaused = false;
    task.auditTrail.push(`Stopped at ${getTimestamp()}`);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    nameInput.disabled = false;
    descInput.disabled = false;
}

function deleteTask(taskId, card) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        clearInterval(task.interval);
        task.auditTrail.push(`Deleted at ${getTimestamp()}`);
        tasks = tasks.filter(t => t.id !== taskId);
        card.remove();
    }
}

function exportToPDF() {
    const doc = new jsPDF();
    doc.text("Task Tracker Report", 10, 10);
    let y = 20;

    tasks.forEach((task, index) => {
        doc.text(`Task ${index + 1}: ${task.name}`, 10, y);
        y += 10;
        doc.text(`Description: ${task.description}`, 10, y);
        y += 10;
        doc.text(`Total Duration: ${formatTime(task.totalTime)}`, 10, y);
        y += 10;
        doc.text("Audit Trail:", 10, y);
        y += 10;
        task.auditTrail.forEach(entry => {
            doc.text(`- ${entry}`, 15, y);
            y += 10;
        });
        y += 10;
    });

    doc.save(`task_report_${new Date().toISOString().split('T')[0]}.pdf`);
}

createTaskBtn.addEventListener('click', createTaskCard);
exportBtn.addEventListener('click', exportToPDF);