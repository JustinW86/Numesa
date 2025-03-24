const { jsPDF } = window.jspdf;

let tasks = [];
let sessionStartTime = null;
let sessionTimerInterval = null;
let userName = '';

const loginSection = document.getElementById('loginSection');
const mainSection = document.getElementById('mainSection');
const loginForm = document.getElementById('loginForm');
const calendarContainer = document.getElementById('calendarContainer');
const taskSection = document.getElementById('taskSection');
const selectedDateEl = document.getElementById('selectedDate');
const taskList = document.getElementById('taskList');
const addTaskBtn = document.getElementById('addTaskBtn');
const exportBtn = document.getElementById('exportBtn');
const sessionTimerEl = document.getElementById('sessionTimer');
let selectedDate = null;

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
    }
}

function renderCalendar() {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    months.forEach((month, index) => {
        const monthEl = document.createElement('div');
        monthEl.className = 'month';
        monthEl.innerHTML = `<h3>${month} 2025</h3><div class="days"></div>`;
        const daysEl = monthEl.querySelector('.days');

        const daysInMonth = new Date(2025, index + 1, 0).getDate();
        const firstDay = new Date(2025, index, 1).getDay();

        for (let i = 0; i < firstDay; i++) {
            daysEl.innerHTML += '<div class="day"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${day.toString().padStart(2, '0')}/${(index + 1).toString().padStart(2, '0')}/2025`;
            const dayEl = document.createElement('div');
            dayEl.className = 'day';
            dayEl.textContent = day;
            dayEl.addEventListener('click', () => {
                selectedDate = dateStr;
                document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
                dayEl.classList.add('selected');
                renderTasks();
            });
            daysEl.appendChild(dayEl);
        }

        calendarContainer.appendChild(monthEl);
    });
}

function renderTasks() {
    taskList.innerHTML = '';
    selectedDateEl.textContent = selectedDate || 'Select a Date';
    if (selectedDate) {
        const dayTasks = tasks.filter(task => task.date === selectedDate);
        if (schedule[selectedDate]) {
            schedule[selectedDate].forEach(taskData => {
                if (!dayTasks.some(t => t.name === taskData.name && t.description === taskData.description)) {
                    const card = createTaskCard(taskData, selectedDate);
                    taskList.appendChild(card);
                }
            });
        }
        dayTasks.forEach(task => {
            if (!task.isDeleted || task.date === selectedDate) {
                const card = createTaskCard(task, selectedDate);
                taskList.appendChild(card);
            }
        });
    }
}

function exportToPDF() {
    const doc = new jsPDF();
    
    doc.setFillColor(0, 123, 255);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(`Kefir Gut Health Tracker - Numesa (${userName})`, 10, 12);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    const sessionDuration = sessionStartTime ? formatTime(Math.floor((Date.now() - sessionStartTime) / 1000)) : '00:00:00';
    doc.text(`Generated on: ${getTimestamp()} | Session Duration: ${sessionDuration}`, 10, 25);

    let y = 35;
    const dayTasks = tasks.filter(task => task.date === selectedDate);
    if (selectedDate && dayTasks.length > 0) {
        doc.setFontSize(14);
        doc.setFillColor(46, 125, 50);
        doc.rect(10, y - 6, 190, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(selectedDate, 12, y);
        y += 10;

        dayTasks.forEach((task, index) => {
            doc.setFontSize(12);
            doc.setFillColor(240, 240, 240);
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

    doc.save(`kefir_task_report_${new Date().toISOString().split('T')[0]}_${userName}.pdf`);
    clearInterval(sessionTimerInterval); // Stop timer on export
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value.trim();
    const surname = document.getElementById('surname').value.trim();
    if (firstName && surname) {
        userName = `${firstName} ${surname}`;
        loginSection.style.display = 'none';
        mainSection.style.display = 'block';
        sessionStartTime = Date.now();
        sessionTimerInterval = setInterval(updateSessionTimer, 1000);
        renderCalendar();
    } else {
        alert('Please enter both first name and surname.');
    }
});

addTaskBtn.addEventListener('click', () => {
    if (selectedDate) {
        const card = createTaskCard({}, selectedDate);
        taskList.appendChild(card);
    } else {
        alert('Please select a date first.');
    }
});

exportBtn.addEventListener('click', exportToPDF);