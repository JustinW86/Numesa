const { jsPDF } = window.jspdf;

let tasks = [];
const dayContainer = document.getElementById('dayContainer');
const exportBtn = document.getElementById('exportBtn');

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Predefined schedule (March 24-28, 2025)
const schedule = {
    "Monday": [
        { name: "SM media messages", description: "Promote kefir benefits on social media" },
        { name: "Mailer: Product launch", description: "Announce new kefir product via email" },
        { name: "Posts: Workshop", description: "Share kefir workshop details" },
        { name: "Posts: Product Launch", description: "Post about kefir product launch" },
        { name: "Facebook/Google Ad", description: "Run kefir health ads" },
        { name: "Create SM content", description: "Plan 2 weeks of kefir/gut health content" },
        { name: "Load MK starter product", description: "Add kefir starter to website" }
    ],
    "Tuesday": [
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
    "Wednesday": [
        { name: "Update product listings", description: "Update kefir stock/pricing" },
        { name: "Update calendar", description: "Add kefir events" },
        { name: "Load special products", description: "Add kefir specials" },
        { name: "Compile analytics", description: "Report on kefir sales/traffic" }
    ],
    "Thursday": [],
    "Friday": [
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

function createTaskCard(taskData = {}, day) {
    const taskId = Date.now() + Math.random();
    const task = {
        id: taskId,
        name: taskData.name || '',
        description: taskData.description || '',
        day: day,
        totalTime: 0,
        isRunning: false,
        isPaused: false,
        isDeleted: false,
        interval: null,
        lastPauseStart: null,
        auditTrail: [`Created at ${getTimestamp()}`]
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
    if (task.isDeleted) return;
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
    if (task.isDeleted) return;
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
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.isDeleted) {
        clearInterval(task.interval);
        task.isRunning = false;
        task.isPaused = false;
        task.isDeleted = true;
        task.auditTrail.push(`Deleted at ${getTimestamp()}`);
        card.remove();
    }
}

function createDaySection(day) {
    const section = document.createElement('div');
    section.className = 'day-section';
    section.innerHTML = `<h2>${day}</h2><div class="task-list" id="${day.toLowerCase()}-tasks"></div><button class="add-task-btn" id="add-${day.toLowerCase()}">Add Task</button>`;
    
    const taskList = section.querySelector(`#${day.toLowerCase()}-tasks`);
    const addBtn = section.querySelector(`#add-${day.toLowerCase()}`);

    // Load scheduled tasks
    if (schedule[day]) {
        schedule[day].forEach(taskData => {
            const card = createTaskCard(taskData, day);
            taskList.appendChild(card);
        });
    }

    addBtn.addEventListener('click', () => {
        const card = createTaskCard({}, day);
        taskList.appendChild(card);
    });

    dayContainer.appendChild(section);
}

function exportToPDF() {
    const doc = new jsPDF();
    
    doc.setFillColor(0, 123, 255);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Kefir Gut Health Tracker - Numesa", 10, 12);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Generated on: ${getTimestamp()}`, 10, 25);

    let y = 35;
    daysOfWeek.forEach(day => {
        const dayTasks = tasks.filter(task => task.day === day);
        if (dayTasks.length > 0) {
            doc.setFontSize(14);
            doc.setFillColor(46, 125, 50);
            doc.rect(10, y - 6, 190, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text(day, 12, y);
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
            y += 5;
        }
    });

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, 190, 290);

    doc.save(`kefir_task_report_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Initialize day sections
daysOfWeek.forEach(day => createDaySection(day));
exportBtn.addEventListener('click', exportToPDF);