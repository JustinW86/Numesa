const { jsPDF } = window.jspdf;

let tasks = [];
const taskContainer = document.getElementById('taskContainer');
const createTaskBtn = document.getElementById('createTaskBtn');
const exportBtn = document.getElementById('exportBtn');

// Predefined schedule based on the document (starting March 24, 2025)
const schedule = {
    "24/03": [
        { name: "SM media messages", description: "Post social media messages" },
        { name: "Mailer: Product launch", description: "Send product launch email" },
        { name: "Posts: Workshop", description: "Create workshop social media posts" },
        { name: "Posts: Product Launch", description: "Create product launch social media posts" },
        { name: "Facebook/Google Ad", description: "Set up FB/Google ad campaign" },
        { name: "Create SM content", description: "Create 2 weeks of content for FB/Insta/LinkedIn/WhatsApp (YouTube, TikTok)" },
        { name: "Load MK starter product", description: "Add MK starter product to website" }
    ],
    "25/03": [
        { name: "Check website speed", description: "Check website for speed, performance" },
        { name: "Monitor Analytics", description: "Review website analytics" },
        { name: "Check website uptime", description: "Ensure no errors or downtime" },
        { name: "Update plugins", description: "Update website plugins" },
        { name: "Test checkout", description: "Test checkout process and payment gateways" },
        { name: "Check broken links", description: "Check for broken links on website" },
        { name: "Update SEO", description: "Update website SEO" },
        { name: "Monthly newsletter", description: "Prepare and send monthly newsletter" },
        { name: "Blog", description: "Write and publish a blog post" },
        { name: "Develop content calendar", description: "Develop monthly content calendar (last Monday)" }
    ],
    "26/03": [
        { name: "Update product listings", description: "Update stock levels and pricing" },
        { name: "Update calendar", description: "Update calendar with events" },
        { name: "Load special products", description: "Load special products as needed" },
        { name: "Compile analytics", description: "Compile weekly analytics reports" }
    ],
    "27/03": [],
    "28/03": [
        { name: "Weekly feedback", description: "Hold weekly feedback meeting" }
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

function createTaskCard(taskData = {}) {
    const taskId = Date.now() + Math.random(); // Unique ID
    const task = {
        id: taskId,
        name: taskData.name || '',
        description: taskData.description || '',
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

    taskContainer.appendChild(card);
    return task;
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

function exportToPDF() {
    const doc = new jsPDF();
    
    doc.setFillColor(0, 123, 255);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Task Tracker Report - Numesa", 10, 12);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Generated on: ${getTimestamp()}`, 10, 25);

    let y = 35;
    tasks.forEach((task, index) => {
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

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, 190, 290);

    doc.save(`task_report_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Load scheduled tasks for the current week on page load
function loadScheduledTasks() {
    const today = new Date().toLocaleDateString('en-GB').split('/').slice(0, 2).join('/'); // e.g., "24/03"
    for (const date in schedule) {
        if (date >= today) { // Only load tasks from today onward
            schedule[date].forEach(taskData => createTaskCard(taskData));
        }
    }
}

createTaskBtn.addEventListener('click', createTaskCard);
exportBtn.addEventListener('click', exportToPDF);

// Load tasks on page load
window.onload = loadScheduledTasks;