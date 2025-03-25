const { jsPDF } = window.jspdf;

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let sessionStartTime = parseInt(localStorage.getItem('sessionStartTime'), 10);
let userName = localStorage.getItem('userName') || '';
let sessionTimerInterval = null;

const sessionTimerEl = document.getElementById('sessionTimer');
const taskSection = document.getElementById('taskSection');
const selectedDateEl = document.getElementById('selectedDate');
const taskList = document.getElementById('taskList');
const addTaskBtn = document.getElementById('addTaskBtn');
const exportBtn = document.getElementById('exportBtn');
const backBtn = document.getElementById('backBtn');

const urlParams = new URLSearchParams(window.location.search);
const selectedDate = urlParams.get('date') || localStorage.getItem('selectedDate');

// Predefined schedule for 2025
const schedule = {
    "24/03/2025": [
        { name: "SM media messages", description: "Promote kefir benefits on social media" },
        { name: "Mailer: Product launch", description: "Announce new kefir product via email" },
        { name: "Posts: Workshop", description: "Share kefir workshop details" },
        { name: "Posts: Product Launch", description: "Post about kefir product launch" },
        { name: "Facebook/Google Ad", description: "Run kefir health ads" },
        { name: "Create SM content", description: "Plan 2 weeks of kefir/gut health content" },
        { name: "Load MK starter product", description: "Add kefir starter to website" }
    ],
    "25/03/2025": [
        { name: "Check website speed", description: "Optimize site for kefir sales" },
        { name: "Monitor Analytics", description: "Track kefir product engagement" },
        { name: "Check website uptime", description: "Ensure kefir site is live" },
        { name: "Update plugins", description: "Update site plugins for security" },
        { name: "Test checkout", description: "Test kefir purchase process" },
        { name: "Check broken links", description: "Fix links on kefir pages" },
        { name: "Update SEO", description: "Boost kefir-related keywords" },
        { name: "Monthly newsletter", description: "Send kefir health tips" },
        { name: "Blog", description: "Write about kefir and gut health" },
        { name: "Develop content calendar", description: "Plan kefir SM/email content" }
    ],
    "26/03/2025": [
        { name: "Update product listings", description: "Update kefir stock/pricing" },
        { name: "Update calendar", description: "Add kefir events" },
        { name: "Load special products", description: "Add kefir specials" },
        { name: "Compile analytics", description: "Report on kefir sales/traffic" }
    ],
    "28/03/2025": [
        { name: "Weekly feedback", description: "Review kefir campaign progress" }
    ]
};

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}

function getTimestamp() {
    return new Date().toLocaleString();
}

function updateSessionTimer() {
    if (sessionStartTime) {
        const now = Date.now();
        const elapsed = Math.floor((now - sessionStartTime) / 1000);
        sessionTimerEl.textContent = `Session Time: ${formatTime(elapsed)}`;
    }
}

function createTaskCard(taskData = {}, date) {
    const taskId = Date.now() + Math.random();
    const task = {
        id: taskId,
        name: taskData.name || '',
        description: taskData.description || '',
        date: date,
        totalTime: 0,
        isRunning: false,
        isPaused: false,
        isDeleted: false,
        interval: null,
        lastPauseStart: null,
        auditTrail: [`Created at ${getTimestamp()} by ${userName}`]
    };
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    const card = document.createElement('div');
    card.className = 'task-card';
    card.id = `task-${taskId}`;
    card.innerHTML = `
        <input type="text" class="task-name" placeholder="Task Name" value="${task.name}" required>
        <textarea class="task-desc" placeholder="Task Description" required>${task.description}</textarea>
        <div class="timer-controls">
            <button class="start-btn">Start</button>
            <button class="pause-btn" disabled>Pause</button>
            <button class="stop-btn" disabled>Stop</button>
            <button class="reschedule-btn">Reschedule</button>
            <button class="delete-btn">Delete</button>
        </div>
        <div class="timer">00:00:00</div>
    `;

    const startBtn = card.querySelector('.start-btn');
    const pauseBtn = card.querySelector('.pause-btn');
    const stopBtn = card.querySelector('.stop-btn');
    const rescheduleBtn = card.querySelector('.reschedule-btn');
    const deleteBtn = card.querySelector('.delete-btn');
    const timerDisplay = card.querySelector('.timer');
    const nameInput = card.querySelector('.task-name');
    const descInput = card.querySelector('.task-desc');

    startBtn.addEventListener('click', () => startTimer(task, startBtn, pauseBtn, stopBtn, nameInput, descInput, timerDisplay));
    pauseBtn.addEventListener('click', () => pauseTimer(task, pauseBtn));
    stopBtn.addEventListener('click', () => stopTimer(task, startBtn, pauseBtn, stopBtn, nameInput, descInput, timerDisplay));
    rescheduleBtn.addEventListener('click', () => rescheduleTask(task, card));
    deleteBtn.addEventListener('click', () => deleteTask(taskId, card));

    return card;
}

function startTimer(task, startBtn, pauseBtn, stopBtn, nameInput, descInput, timerDisplay) {
    if (task.isDeleted) return;
    if (!nameInput.value || !descInput.value) {
        alert('Please enter a task name and description.');
        return;
    }
    task.name = nameInput.value;
    task.description = descInput.value;
    task.isRunning = true;
    task.isPaused = false;
    task.auditTrail.push(`Started at ${getTimestamp()} by ${userName}`);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    nameInput.disabled = true;
    descInput.disabled = true;

    task.interval = setInterval(() => {
        if (task.isRunning && !task.isPaused) {
            task.totalTime++;
            timerDisplay.textContent = formatTime(task.totalTime);
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }, 1000);
}

function pauseTimer(task, pauseBtn) {
    if (task.isDeleted) return;
    task.isPaused = !task.isPaused;
    if (task.isPaused) {
        task.lastPauseStart = Date.now();
        task.auditTrail.push(`Paused at ${getTimestamp()} by ${userName}`);
    } else {
        const pauseDuration = Math.floor((Date.now() - task.lastPauseStart) / 1000);
        task.auditTrail.push(`Resumed at ${getTimestamp()} (Paused for ${formatTime(pauseDuration)}) by ${userName}`);
        task.lastPauseStart = null;
    }
    pauseBtn.textContent = task.isPaused ? 'Resume' : 'Pause';
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function stopTimer(task, startBtn, pauseBtn, stopBtn, nameInput, descInput, timerDisplay) {
    if (task.isDeleted) return;
    clearInterval(task.interval);
    task.isRunning = false;
    task.isPaused = false;
    task.auditTrail.push(`Stopped at ${getTimestamp()} (Total Duration: ${formatTime(task.totalTime)}) by ${userName}`);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    nameInput.disabled = false;
    descInput.disabled = false;
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function rescheduleTask(task, card) {
    if (task.isDeleted) return;
    const newDate = prompt('Enter new date (DD/MM/YYYY):', task.date);
    if (newDate && /^\d{2}\/\d{2}\/\d{4}$/.test(newDate)) {
        const [day, month, year] = newDate.split('/').map(Number);
        if (year === 2025 && month >= 1 && month <= 12 && day >= 1 && day <= new Date(year, month, 0).getDate()) {
            task.date = newDate;
            task.auditTrail.push(`Rescheduled to ${newDate} by ${userName}`);
            if (task.date !== selectedDate) {
                card.remove();
            }
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
        } else {
            alert('Invalid date. Please use DD/MM/YYYY format within 2025.');
        }
    }
}

function deleteTask(taskId, card) {
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.isDeleted) {
        clearInterval(task.interval);
        task.isRunning = false;
        task.isPaused = false;
        task.isDeleted = true;
        task.auditTrail.push(`Deleted at ${getTimestamp()} by ${userName}`);
        card.remove();
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

function renderTasks() {
    taskList.innerHTML = '';
    selectedDateEl.textContent = selectedDate || 'Select a Date';
    if (selectedDate) {
        const dayTasks = tasks.filter(task => task.date === selectedDate && !task.isDeleted);
        if (schedule[selectedDate]) {
            schedule[selectedDate].forEach(taskData => {
                if (!dayTasks.some(t => t.name === taskData.name && t.description === taskData.description)) {
                    const card = createTaskCard(taskData, selectedDate);
                    taskList.appendChild(card);
                }
            });
        }
        dayTasks.forEach(task => {
            const card = createTaskCard(task, selectedDate);
            taskList.appendChild(card);
        });
    }
}

function exportToPDF() {
    const doc = new jsPDF();
    
    doc.setFillColor(76, 175, 80);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(`Numesa Task Tracker (${userName})`, 10, 12);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    const sessionDuration = sessionStartTime ? formatTime(Math.floor((Date.now() - sessionStartTime) / 1000)) : '00:00:00';
    doc.text(`Generated on: ${getTimestamp()} | Session Duration: ${sessionDuration}`, 10, 25);

    let y = 35;
    const dayTasks = tasks.filter(task => task.date === selectedDate);
    if (selectedDate && dayTasks.length > 0) {
        doc.setFontSize(14);
        doc.setFillColor(224, 242, 233);
        doc.rect(10, y - 6, 190, 10, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text(selectedDate, 12, y);
        y += 10;

        dayTasks.forEach((task, index) => {
            doc.setFontSize(12);
            doc.setFillColor(249, 249, 249);
            doc.rect(10, y - 5, 190, 10, 'F');
            doc.setTextColor(0, 0, 0);
            doc.text(`Task ${index + 1}: ${task.name}${task.isDeleted ? ' (Deleted)' : ''}`, 12, y);
            y += 10;

            doc.setFontSize(10);
            doc.text(`Description: ${task.description}`, 12, y);
            y += 7;
            doc.text(`Total Duration: ${formatTime(task.totalTime)}`, 12, y);
            y += 10;

            doc.setFontSize(11);
            doc.text("Audit Trail:", 12, y);
            y += 7;
            doc.setFontSize(9);
            task.auditTrail.forEach(entry => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(`- ${entry}`, 15, y);
                y += 6;
            });
            y += 10;
        });
    }

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, 190, 290);

    doc.save(`numesa_task_report_${new Date().toISOString().split('T')[0]}_${userName}.pdf`);
    clearInterval(sessionTimerInterval);
}

if (sessionStartTime) {
    sessionTimerInterval = setInterval(updateSessionTimer, 1000);
}

renderTasks();

addTaskBtn.addEventListener('click', () => {
    if (selectedDate) {
        const card = createTaskCard({}, selectedDate);
        taskList.appendChild(card);
    } else {
        alert('Please select a date first.');
    }
});

exportBtn.addEventListener('click', exportToPDF);

backBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});