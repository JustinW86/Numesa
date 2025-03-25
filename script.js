let currentMonth = 2; // March (0-based index, March 24, 2025)
let userName = '';

const loginSection = document.getElementById('loginSection');
const calendarSection = document.getElementById('calendarSection');
const loginForm = document.getElementById('loginForm');
const calendarContainer = document.getElementById('calendarContainer');
const daysContainer = document.getElementById('daysContainer');
const currentMonthEl = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

function renderCalendar() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthEl.textContent = `${months[currentMonth]} 2025`;

    daysContainer.innerHTML = '';
    const daysInMonth = new Date(2025, currentMonth + 1, 0).getDate();
    const firstDay = new Date(2025, currentMonth, 1).getDay();

    for (let i = 0; i < firstDay; i++) {
        daysContainer.innerHTML += '<div class="day"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${day.toString().padStart(2, '0')}/${(currentMonth + 1).toString().padStart(2, '0')}/2025`;
        const dayEl = document.createElement('div');
        dayEl.className = 'day';
        dayEl.textContent = day;
        dayEl.addEventListener('click', () => {
            localStorage.setItem('selectedDate', dateStr);
            window.location.href = `tasks.html?date=${encodeURIComponent(dateStr)}`;
        });
        daysContainer.appendChild(dayEl);
    }
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value.trim();
    const surname = document.getElementById('surname').value.trim();
    if (firstName && surname) {
        userName = `${firstName} ${surname}`;
        localStorage.setItem('userName', userName);
        localStorage.setItem('sessionStartTime', Date.now());
        loginSection.style.display = 'none';
        calendarSection.style.display = 'block';
        renderCalendar();
    } else {
        alert('Please enter both first name and surname.');
    }
});

prevMonthBtn.addEventListener('click', () => {
    currentMonth = Math.max(0, currentMonth - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentMonth = Math.min(11, currentMonth + 1);
    renderCalendar();
});