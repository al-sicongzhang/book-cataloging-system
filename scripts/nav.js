document.addEventListener("DOMContentLoaded", () => {
    const navContainer = document.getElementById("navLinks");
    if (!navContainer) return;
  
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const username = localStorage.getItem("username") || "User";
    const currentPage = window.location.pathname.split("/").pop();
    const showBackToHome = currentPage !== "index.html";

    if (isLoggedIn) {
      navContainer.innerHTML = `
        <span class="welcome-text">Hello, ${username}</span>
        <a href="mylist.html">My List</a>
        ${showBackToHome ? `<a href="index.html">Back to Home</a>` : ""}
        <a href="#" id="logoutLink">Log Out</a>

      `;
      
      document.getElementById("logoutLink").addEventListener("click", () => {
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        localStorage.removeItem("user_id");
        localStorage.removeItem("token");
        
        location.reload(); // Refresh page to update UI
      });
    } else {
      navContainer.innerHTML = `
      <a href="#" id="loginLink">Login</a>
      ${showBackToHome ? `<a href="index.html">Back to Home</a>` : ""}
      `;
        const loginLink = document.getElementById("loginLink");
        const loginModal = document.getElementById("loginModal");
        const closeBtn = document.getElementById("closeLogin");
        const loginForm = document.getElementById("loginForm");
        const errorMessage = document.getElementById("errorMessage");

        if (loginLink && loginModal) {
          loginLink.onclick = () => loginModal.style.display = "flex";
        }
      
        if (closeBtn) {
          closeBtn.onclick = () => loginModal.style.display = "none";
        }
      
        window.onclick = (e) => {
          if (e.target === loginModal) {
            loginModal.style.display = "none";
          }
        };
      
        if (loginForm) {
          loginForm.addEventListener("submit", async(e) => {
            e.preventDefault();

            const email = loginForm.loginInput.value.trim();
            const password = loginForm.password.value.trim();

            try{
              // Send login request to the backend
              const res = await fetch("http://localhost:3000/api/user/login",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({email,password})
              
              });
              const data=await res.json();
              if(data.status==="success"){
                localStorage.setItem("loggedIn","true");
                localStorage.setItem("username",data.user.username);// Set the username from the response
                localStorage.setItem("email",data.user.email);// Set the email from the response
                localStorage.setItem("user_id",data.user.user_id); // Set the user_id from the response
                localStorage.setItem("token",data.token);

                loginModal.style.display = "none";
                location.reload();  // Refresh the page after successful login
              } else {
                errorMessage.textContent = data.message; // Show error message from the response
              }

            }catch(err) {
              console.error('Login error:', err);
              errorMessage.textContent = 'An error occurred while processing login request.';
            }
          });
        }
    }
  });
  