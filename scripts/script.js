document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("searchBtn");
    const bookContainer = document.getElementById("bookContainer");

    // Searching
    searchBtn.addEventListener("click", () => {

      const title = document.getElementById("titleSearch").value.trim();
      const author = document.getElementById("authorSearch").value.trim();
      const subject = document.getElementById("subjectSearch").value.trim();
  
      // Create a search query with the selected search fields
      let searchQuery = '';
      if (title) {
        searchQuery += `title:${title} `;
      }
      if (author) {
        searchQuery += `author:${author} `;
      }
      if (subject) {
        searchQuery += `subject:${subject} `;
      }
      searchQuery = searchQuery.trim();
      if (!searchQuery) {
        alert("Please enter at least one search parameter.");
        return;
      }

      document.getElementById("results").style.display = "block"; // show search result
      bookContainer.innerHTML = "";
  
      fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          bookContainer.innerHTML = "";
  
          if (!data.items || data.items.length === 0) {
            bookContainer.innerHTML = "<p>No results found.</p>";
            return;
          }
  
          data.items.forEach(item => {
            const book = item.volumeInfo;
            const bookId = item.id;
  
            const title = book.title || "No Title";
            const authors = book.authors ? book.authors.join(", ") : "Unknown";
            const description = book.description ? book.description.substring(0, 100) + "..." : "No description";
            const thumbnail = book.imageLinks?.thumbnail || 'https://via.placeholder.com/128x180?text=No+Image';
            const publishedDate = book.publishedDate || "Unknown"; 
            const pageCount = book.pageCount || "Unknown";
            const categories = book.categories ? book.categories.join(", ") : "Unknown";

            const isbn = book.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier
            || book.industryIdentifiers?.find(id => id.type === "ISBN_10")?.identifier
            || "Unknown";

            const bookCard = document.createElement("div");
            bookCard.className = "book-card";

            bookCard.setAttribute("data-pagecount", pageCount);
            bookCard.setAttribute("data-category", categories);
            bookCard.setAttribute("data-isbn", isbn);
            bookCard.innerHTML = `
            <div class="book-card-columns">
              <div class="book-left-column">
                <img src="${thumbnail}" alt="Cover" />
                <button class="view-details" data-id="${bookId}">View Details</button>
                <button class="add-mylist" data-id="${bookId}">Add to My List</button>
              </div>
              <div class="book-right-column">
                <h3>${title}</h3>
                <p><strong>Author:</strong> ${authors}</p>
                <p><strong>Published:</strong> ${publishedDate}</p>
                <p>${description}</p>
              </div>
            </div>
          `;
  
            bookContainer.appendChild(bookCard);
          });
  
          // View Details
          document.querySelectorAll(".view-details").forEach(btn => {
            btn.addEventListener("click", (e) => {
              const bookId = e.target.getAttribute("data-id");
              localStorage.setItem("selectedBookId", bookId);
              window.location.href = "book.html";
            });
          });
 
          // Add to My List (After login)
          document.querySelectorAll(".add-mylist").forEach(btn => {
            btn.addEventListener("click", (e) => {
              const token = localStorage.getItem("token");
              if (!token) {
                alert("You have to login first");
                return;
              }
          
              const bookId = e.target.getAttribute("data-id");
              const card = e.target.closest(".book-card");
          
              const title = card.querySelector("h3")?.innerText || "No Title";
              const authors = card.querySelector("p strong")?.nextSibling?.textContent?.trim() || "Unknown";
              const publishedDate = [...card.querySelectorAll("p")][1]?.textContent?.replace("Published:", "").trim() || "Unknown";
              const thumbnail = card.querySelector("img")?.src || '';
              const description = card.querySelector("p")?.innerText || "No description";
              const pageCount = card.getAttribute("data-pagecount") || "Unknown";
              const category = card.getAttribute("data-category") || "Unknown";
              const isbn = card.getAttribute("data-isbn") || "Unknown";          

              const book={
                isbn:isbn,
                title:title,
                author:authors,
                image_url: thumbnail
              };
              fetch("http://localhost:3000/api/userlist/add", {
                method: "POST",
                headers:{
                  "content-Type":"application/json",
                  "Authorization":`Bearer ${token}`
                },
                body:JSON.stringify(book)
              })

              .then(res => res.json())
              .then(data=>{
                if(data.status === "success"){
                  alert("Book added to your collection!");
                }else if(data.status === "already"){
                  alert("This book is already in your collection");
                }else{
                  alert("Something went wrong.");
                }
              }).catch(error => console.error("Error:", error));
            });
          });          
        })
        .catch(err => {
          console.error("Error fetching books:", err);
          bookContainer.innerHTML = "<p>Error loading books. Please try again later.</p>";
        });
    });
  });
  