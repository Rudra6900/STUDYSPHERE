document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const taskDate = document.getElementById('task-date');
    const taskPriority = document.getElementById('task-priority');
    const addBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    // Load tasks
    let tasks = JSON.parse(localStorage.getItem('my-tasks') || '[]');

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            
            // Priority Color
            let pColor = '#10b981'; // Low
            if(task.priority === 'Medium') pColor = '#f59e0b';
            if(task.priority === 'High') pColor = '#ef4444';

            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <div style="display:flex; align-items:center;">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-index="${index}">
                    <div>
                        <div style="font-weight:500;">${task.text}</div>
                        <div style="font-size:12px; color:var(--muted); display:flex; gap:10px; margin-top:4px;">
                            ${task.date ? `<span>📅 ${task.date}</span>` : ''}
                            <span style="color:${pColor}; font-weight:600;">${task.priority || 'Low'}</span>
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button onclick="deleteTask(${index})"><span class="material-symbols-rounded">delete</span></button>
                </div>
            `;
            taskList.appendChild(li);
        });

        // Attach event listeners to checkboxes
        document.querySelectorAll('.task-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const idx = e.target.dataset.index;
                tasks[idx].completed = e.target.checked;
                saveTasks();
                renderTasks();
            });
        });
    }

    function saveTasks() {
        localStorage.setItem('my-tasks', JSON.stringify(tasks));
    }

    window.deleteTask = function(index) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    };

    addBtn.addEventListener('click', () => {
        const text = taskInput.value.trim();
        const date = taskDate.value;
        const priority = taskPriority.value;
        
        if(!text) return;
        tasks.push({ text, date, priority, completed: false });
        taskInput.value = '';
        taskDate.value = '';
        saveTasks();
        renderTasks();
    });

    taskInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') addBtn.click();
    });

    renderTasks();
});