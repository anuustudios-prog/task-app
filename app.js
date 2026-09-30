const taskInput = document.getElementById('taskInput');
const taskTime = document.getElementById('taskTime');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const statusText = document.getElementById('connection-status');

let tasks = JSON.parse(localStorage.getItem('dailyTasks')) || [];

// Notification අවසර ඉල්ලීම (Browser එක මඟින් මතක් කර දීමට)
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

window.onload = function() {
    renderTasks();
    updateConnectionStatus();
    checkTaskReminders();
    // හැම මිනිත්තුවකට වරක් වෙලාව චෙක් කරමින් නෝටිෆිකේෂන් යැවීම
    setInterval(checkTaskReminders, 60000);
}

// අලුත් වැඩක් එකතු කිරීම
addBtn.addEventListener('click', function() {
    const text = taskInput.value.trim();
    const time = taskTime.value;

    if (text === "") {
        alert("කරුණාකර වැඩක නමක් ඇතුළත් කරන්න!");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        time: time || "Not set",
        completed: false
    };

    tasks.push(newTask);
    saveAndRender();
    taskInput.value = "";
    taskTime.value = "";
});

// වැඩ ලැයිස්තුව ස්ක්‍රීන් එකේ පෙන්වීම
function renderTasks() {
    taskList.innerHTML = "";
    if (tasks.length === 0) {
        taskList.innerHTML = "<p style='text-align:center; color:#888;'>අදට වැඩ කිසිවක් නැත! 🎉</p>";
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');

        li.innerHTML = `
            <div class="task-info">
                <span>${task.text}</span>
                <span class="task-time">⏰ ${task.time}</span>
            </div>
            <div class="task-actions">
                <button class="complete-btn" onclick="toggleTask(${task.id})">${task.completed ? 'Undo' : 'Done'}</button>
                <button onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// වැඩක් සම්පූර්ණ කළ විට (Complete / Undo)
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveAndRender();
}

// වැඩක් මකා දැමීම
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

// LocalStorage වල සේව් කර නැවත ඩිස්ප්ලේ කිරීම
function saveAndRender() {
    localStorage.setItem('dailyTasks', JSON.stringify(tasks));
    renderTasks();
}

// නියමිත වෙලාවට වැඩක් මඟ හැරුණහොත් Notification එකක් පෙන්වීම
function checkTaskReminders() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    tasks.forEach(task => {
        if (!task.completed && task.time === currentTime) {
            if (Notification.permission === "granted") {
                new Notification("Task Reminder! ⏰", {
                    body: `අද කරන්න නියමිත වැඩක් තියෙනවා: "${task.text}"`,
                    icon: "https://cdn-icons-png.flaticon.com/512/2921/2921222.png"
                });
            }
        }
    });
}

// ඔන්ලයින්/ඔෆ්ලයින් ස්ටේටස් පරීක්ෂාව
function updateConnectionStatus() {
    if (navigator.onLine) {
        statusText.innerText = "Status: Online 🟢 (Ready)";
        statusText.style.color = "green";
    } else {
        statusText.innerText = "Status: Offline 🔴 (Working Locally)";
        statusText.style.color = "orange";
    }
}
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
