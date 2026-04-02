document.addEventListener('DOMContentLoaded', () => {
    // Load saved settings
    const usernameInput = document.getElementById('username-input');
    const majorInput = document.getElementById('major-input');
    const avatarInput = document.getElementById('avatar-input');
    const dailyGoalInput = document.getElementById('daily-goal-input');
    const saveBtn = document.getElementById('save-btn');

    if(usernameInput) usernameInput.value = localStorage.getItem('username') || '';
    if(majorInput) majorInput.value = localStorage.getItem('major') || '';
    if(avatarInput) avatarInput.value = localStorage.getItem('avatar') || '';
    if(dailyGoalInput) dailyGoalInput.value = localStorage.getItem('dailyGoal') || '60';

    // Save settings
    if(saveBtn) {
        saveBtn.addEventListener('click', () => {
            if(usernameInput) localStorage.setItem('username', usernameInput.value);
            if(majorInput) localStorage.setItem('major', majorInput.value);
            if(avatarInput) localStorage.setItem('avatar', avatarInput.value);
            if(dailyGoalInput) localStorage.setItem('dailyGoal', dailyGoalInput.value);
            
            alert('Settings saved successfully!');
        });
    }
});