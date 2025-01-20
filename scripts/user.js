// Load saved data on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        document.getElementById('name-display').textContent = profile.name || 'Alexa Rawles';
        document.getElementById('email-display').textContent = profile.email || 'alexarawles@gmail.com';
        if (profile.avatar) {
            document.getElementById('avatar').src = profile.avatar;
        }
        if (profile.location) {
            document.getElementById('location-display').textContent = profile.location;
        }
        
        // Load game statistics
        document.getElementById('wins').textContent = profile.wins || 0;
        document.getElementById('losses').textContent = profile.losses || 0;
        document.getElementById('draws').textContent = profile.draws || 0;
    }
});




function showAlert(message) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.classList.add('show');
    setTimeout(() => {
        alert.classList.remove('show');
    }, 3000);
}

function toggleEdit() {
    const displayMode = document.getElementById('display-mode');
    const editMode = document.getElementById('edit-mode');
    const nameInput = document.getElementById('name-input');
    const emailInput = document.getElementById('email-input');

    if (displayMode.style.display !== 'none') {
        nameInput.value = document.getElementById('name-display').textContent;
        emailInput.value = document.getElementById('email-display').textContent;
        displayMode.style.display = 'none';
        editMode.style.display = 'block';
    } else {
        displayMode.style.display = 'block';
        editMode.style.display = 'none';
    }
}

function saveProfile() {
    const name = document.getElementById('name-input').value;
    const email = document.getElementById('email-input').value;
    
    document.getElementById('name-display').textContent = name;
    document.getElementById('email-display').textContent = email;
    
    const profile = getStoredProfile();
    profile.name = name;
    profile.email = email;
    
    localStorage.setItem('userProfile', JSON.stringify(profile));
    toggleEdit();
    showAlert('Profile updated successfully!');
}

function getStoredProfile() {
    return JSON.parse(localStorage.getItem('userProfile') || '{"wins":0,"losses":0,"draws":0}');
}

async function activateCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();

        const canvas = document.createElement('canvas');
        canvas.width = 96;
        canvas.height = 96;
        canvas.getContext('2d').drawImage(video, 0, 0, 96, 96);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        document.getElementById('avatar').src = imageDataUrl;
        
        stream.getTracks().forEach(track => track.stop());
        
        const profile = getStoredProfile();
        profile.avatar = imageDataUrl;
        localStorage.setItem('userProfile', JSON.stringify(profile));
        
        showAlert('Profile picture updated successfully!');
    } catch (error) {
        showAlert('Failed to access camera. Please check permissions.');
    }
}

function getLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = `📍 ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
                document.getElementById('location-display').textContent = location;
                
                const profile = getStoredProfile();
                profile.location = location;
                localStorage.setItem('userProfile', JSON.stringify(profile));
                
                showAlert('Location updated successfully!');
            },
            () => {
                showAlert('Failed to get location. Please check permissions.');
            }
        );
    } else {
        showAlert('Geolocation is not supported by your browser.');
    }
}




// Function to update game statistics (call this when a game ends)
function updateGameStats(result) {
    const profile = getStoredProfile();
    if (result === 'win') profile.wins = (profile.wins || 0) + 1;
    if (result === 'loss') profile.losses = (profile.losses || 0) + 1;
    if (result === 'draw') profile.draws = (profile.draws || 0) + 1;
    
    localStorage.setItem('userProfile', JSON.stringify(profile));
    
    // Update display
    document.getElementById('wins').textContent = profile.wins;
    document.getElementById('losses').textContent = profile.losses;
    document.getElementById('draws').textContent = profile.draws;
}