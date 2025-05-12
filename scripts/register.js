document.addEventListener("DOMContentLoaded", function() {
    document.querySelector("form").addEventListener("submit", function(event) {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        const userData ={
            username:document.getElementById("login").value,
            email:document.getElementById("email").value,
            password: document.getElementById("pass").value
        };

        fetch("http://localhost:3000/api/user/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        })

        .then(res => res.json())
        .then(data => {
            console.log("Parsed Data:", data);
            if (data.status === "success") {
                window.location.href = "/pages/index.html";
            } else {
                document.getElementById("errorMessage").textContent = data.message; // Show error message
            }
        })
        .catch(error => console.error("Error:", error));
    });
})

    // Listen to the reset button to clear all error messages
    document.querySelector("form").addEventListener("reset", function() {
        setTimeout(() => {
            document.getElementById("errorMessage").textContent = "";
            document.querySelectorAll(".error-message").forEach(error => error.remove());
            document.querySelectorAll("input").forEach(input => input.style.borderColor = "");
        }, 10);
    });

function validate() {
    let isValid = true;
    
    // Get form fields
    let email = document.getElementById("email");
    let login = document.getElementById("login");
    let password = document.getElementById("pass");
    let confirmPassword = document.getElementById("pass2");
    
    // Email validation
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value)) {
        showError(email, "X Email must be in a valid format (xyz@xyz.xyz)");
        isValid = false;
    } else {
        clearError(email);
    }
    
    // Login validation
    if (login.value.trim() === "" || login.value.length > 20) {
        showError(login, "X Username must be non-empty and less than 20 characters");
        isValid = false;
    } else {
        login.value = login.value.toLowerCase();
        clearError(login);
    }
    
    // Password validation
    if (password.value.length < 8) {
        showError(password, "X Password must be at least 8 characters long");
        isValid = false;
    } else {
        clearError(password);
    }
    
    // Confirm password validation
    if (password.value !== confirmPassword.value || confirmPassword.value === "") {
        showError(confirmPassword, "X Passwords do not match");
        isValid = false;
    } else {
        clearError(confirmPassword);
    }
    
    return isValid;
}



function showError(element, message) {
    let errorContainer = element.closest(".checkbox") || element.parentNode;
    let errorSpan = errorContainer.querySelector(".error-message");

    if (!errorSpan) {
        errorSpan = document.createElement("span");
        errorSpan.classList.add("error-message");
        errorSpan.style.color = "red";
        errorContainer.appendChild(errorSpan);
    }
    errorSpan.textContent = message;
    element.style.borderColor = "red";
    errorSpan.style.color = "red"; 
}


function clearError(element) {
    let errorContainer = element.closest(".checkbox") || element.parentNode;
    let errorSpan = errorContainer.querySelector(".error-message");

    if (errorSpan) {
        errorSpan.remove();
    }
    element.style.borderColor = "";
}