// Function to include header
async function includeHeader() {
    try {
        const response = await fetch('header.html');
        const headerContent = await response.text();
        
        // Insert the header at the beginning of the body
        document.body.insertAdjacentHTML('afterbegin', headerContent);
        
        // Update user information after the header is loaded
        updateUserInfo();
        
        // Add event listeners to login and logout buttons
        setupHeaderButtons();
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

// Function to update user information in the header
function updateUserInfo() {
    const userName = sessionStorage.getItem("userName");
    
    // Get elements - check if they exist first
    const loginButton = document.getElementById("loginBtn");
    const logoutButton = document.getElementById("logoutBtn");
    const userInfoSection = document.getElementById("userInfoSection");
    const userNameElement = document.getElementById("userName");
    const userAvatar = document.getElementById("userAvatar");
    const profileLink = userInfoSection?.querySelector('a');
    
    if (!loginButton || !logoutButton || !userInfoSection) {
        console.error("Header elements not found");
        return;
    }
    
    if (userName) {
        // User is logged in
        loginButton.style.display = "none";
        logoutButton.style.display = "inline-block";
        userInfoSection.style.display = "flex";
        
        // Update the displayed name and avatar
        if (userNameElement) {
            userNameElement.textContent = userName;
        }
        if (userAvatar) {
            userAvatar.textContent = userName.charAt(0).toUpperCase();
        }
        
        // Make sure profile link works
        if (profileLink) {
            profileLink.href = "profile_2.html";
            profileLink.style.cursor = "pointer";
        }
    } else {
        // User is a guest
        loginButton.style.display = "inline-block";
        logoutButton.style.display = "none";
        userInfoSection.style.display = "none";
        
        // Redirect guests to login when clicking profile
        if (profileLink) {
            profileLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = "login.html?redirect=profile_2.html";
            });
        }
    }
}

// Function to set up event listeners for the header buttons
function setupHeaderButtons() {
    const loginButton = document.getElementById("loginBtn");
    const logoutButton = document.getElementById("logoutBtn");
    
    if (loginButton) {
        loginButton.addEventListener("click", function() {
            console.log("Login button clicked");
            window.location.href = "./login.html";
        });
    }
    
    if (logoutButton) {
        logoutButton.addEventListener("click", function() {
            console.log("Logout button clicked");
            sessionStorage.clear();
            window.location.href = "./login.html";
        });
    }
}

// Define global login and logout functions
window.login = function() {
    console.log("Global login function called");
    window.location.href = "./login.html";
};

window.logout = function() {
    console.log("Global logout function called");
    sessionStorage.clear();
    window.location.href = "./login.html";
};

// Add header to page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    includeHeader();
    
    // Extra safety measure - find and attach to login button after a short delay
    setTimeout(function() {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            console.log("Found login button, attaching direct event listener");
            loginBtn.addEventListener('click', function(event) {
                event.preventDefault();
                console.log("Login button clicked from direct event");
                window.location.href = './login.html';
            });
        } else {
            console.log("Login button not found in timeout handler");
        }
    }, 500); // Give the DOM time to fully load
}); 