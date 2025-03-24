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
    const taskId = Date.now();
    const task = {
        id: taskId,
        name: '',
        description: '',
        totalTime: 0,
        isRunning: false,
        isPaused: false,
        interval: null,
        lastPauseStart: null,
        auditTrail: [`Created at ${getTimestamp()}`]
    };
    tasks.push(task); // Push task directly, not { id: taskId, task }

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
    if (task.isPaused) {
        task.lastPauseStart = Date.now();
        task.auditTrail.push(`Paused at ${getTimestamp()}`);
    } else {
        const pauseDuration = Math.floor((Date.now() - task.lastPauseStart) / 1000);
        task.auditTrail.push(`Resumed at ${getTimestamp()} (Paused for ${formatTime(pauseDuration)})`);
        task.lastPauseStart = null;
    }
    pauseBtn.textContent = task.isPaused ? 'Resume' : 'Pause';
}

function stopTimer(task, startBtn, pauseBtn, stopBtn, nameInput, descInput, timerDisplay) {
    clearInterval(task.interval);
    task.isRunning = false;
    task.isPaused = false;
    task.auditTrail.push(`Stopped at ${getTimestamp()} (Total Duration: ${formatTime(task.totalTime)})`);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    nameInput.disabled = false;
    descInput.disabled = false;
}

function deleteTask(taskId, card) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        const task = tasks[taskIndex];
        clearInterval(task.interval);
        task.auditTrail.push(`Deleted at ${getTimestamp()}`);
        tasks.splice(taskIndex, 1); // Remove task from array
        card.remove();
    }
}

function exportToPDF() {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(0, 123, 255);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Task Tracker Report", 10, 12);
    
    // Date
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Generated on: ${getTimestamp()}`, 10, 25);

    let y = 35;
    tasks.forEach((task, index) => {
        // Task Section Header
        doc.setFontSize(12);
        doc.setFillColor(240, 240, 240);
        doc.rect(10, y - 5, 190, 10, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text(`Task ${index + 1}: ${task.name}`, 12, y);
        y += 10;

        // Task Details
        doc.setFontSize(10);
        doc.text(`Description: ${task.description}`, 12, y);
        y += 7;
        doc.text(`Total Duration: ${formatTime(task.totalTime)}`, 12, y);
        y += 10;

        // Audit Trail
        doc.setFontSize(11);
        doc.text("Audit Trail:", 12, y);
        y += 7;
        doc.setFontSize(9);
        task.auditTrail.forEach(entry => {
            if (y > 280) { // Check for page break
                doc.addPage();
                y = 20;
            }
            doc.text(`- ${entry}`, 15, y);
            y += 6;
        });
        y += 10;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, 190, 290);

    doc.save(`task_report_${new Date().toISOString().split('T')[0]}.pdf`);
}

createTaskBtn.addEventListener('click', createTaskCard);
exportBtn.addEventListener('click', exportToPDF);