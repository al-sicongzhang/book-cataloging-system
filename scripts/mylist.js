document.addEventListener("DOMContentLoaded", async() => {
  const container = document.getElementById("BookListContainer");
  const user_id = localStorage.getItem("user_id");


  document.getElementById("ratingFilter").addEventListener("change", () => {
    const selected = document.getElementById("ratingFilter").value;
    fetchBooks(1);
  });

// get all book info array
  let currentPage = 1;
  const limit = 5;
  let allBooks = [];
  async function fetchBooks(page=1) {
  const token = localStorage.getItem("token");
  const rating = document.getElementById("ratingFilter").value;

  const res= await fetch(`http://localhost:3000/api/userlist/get?page=${page}&limit=${limit}&rating=${rating}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

    const data= await res.json();
    if (data.status === "success") {
        const books = data.data;
        currentPage = data.page;

        if (!window.userReviews || page === 1) {
          window.userReviews = await fetchReviews();
        }

        books.forEach(book => {
          const matchedReview = userReviews.find(r => r.isbn === book.isbn);
          book.rating = matchedReview?.rating ?? null;
          book.comment = matchedReview?.comment ?? "";
        });

        renderList(books); 
        renderPagination(data.page, data.totalPages);
      } else {
        console.error("Failed to fetch:", data.message);
      }
  }

  //get user's review array
  let userReviews = await fetchReviews();
  async function fetchReviews() {
    const token=localStorage.getItem("token");

    const res =await fetch("http://localhost:3000/api/reviews/getall",{
      headers:{Authorization: `Bearer ${token}`},
  });
  const data = await res.json();
  if (data.status === "success") {
    return data.data; // return review array
  } else {
    console.error("Failed to fetch reviews:", data.message);
    return [];
  }
}
  
//show other's review
  function renderReviews(reviews, div) {
    const reviewsContainer = document.createElement("div");
    reviewsContainer.className = "reviews-container";

    reviews.forEach((review) => {
      const reviewDiv = document.createElement("div");
      reviewDiv.className = "review";

      reviewDiv.innerHTML = `
        <p><strong>User:</strong> ${review.username}</p>
        <p><strong>Rating:</strong> ${review.rating}</p>
        <p><strong>Comment:</strong> ${review.comment}</p>
      `;
      reviewsContainer.appendChild(reviewDiv);
    });

    div.appendChild(reviewsContainer);
  }

  function renderPagination(currentPage, totalPages) {
    const container = document.getElementById("pagination");
    container.innerHTML = "";
  
    if (currentPage > 1) {
      const prevBtn = document.createElement("button");
      prevBtn.textContent = "« Prev";
      prevBtn.className = "page-btn";
      prevBtn.onclick = () => fetchBooks(currentPage - 1);
      container.appendChild(prevBtn);
    }
  
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = "page-btn";
      if (i === currentPage) {
        btn.disabled = true;
        btn.classList.add("active-page");
      }
      btn.onclick = () => fetchBooks(i);
      container.appendChild(btn);
    }
  
    if (currentPage < totalPages) {
      const nextBtn = document.createElement("button");
      nextBtn.textContent = "Next »";
      nextBtn.className = "page-btn";
      nextBtn.onclick = () => fetchBooks(currentPage + 1);
      container.appendChild(nextBtn);
    }
  }

  async function renderList(books) {
    container.innerHTML = "";

    books.forEach(book => {
      const div = document.createElement("div");
      div.className = "book-card";
      const rating = book.rating ?? "";
      const comment = book.comment ?? "";
      
      div.innerHTML = `
        <div class="book-card-columns">
          <div class="book-card-left-column">
            <img src="${book.image_url}" alt="Cover" />
            <button class="edit-review-btn">Create/Edit Review</button>
            <button class="remove-btn" data-isbn="${book.isbn}">Remove From My List</button>
          </div>

          <div class="book-card-right-column">
            <h3>${book.title}</h3>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>Published:</strong> ${book.publish_date}</p>
            <hr>

            <div class="review-display">
            <p><strong>Rating:</strong> ${rating}</p>
            <p><strong>Comment:</strong> ${comment}</p>
            </div>
            <div class="review-edit" style="display:none;">
              <label>Rating:</label>
              <input type="number" min="1" max="5" class="edit-rating" value="${rating}" /><br/>
              <div class="edit-commit-label">
                <label>Comment:</label>
              </div>
              <textarea class="edit-comment">${comment}</textarea><br/>

              <button class="save-review-btn"
                data-isbn="${book.isbn}">Save
              </button>
              <button class="delete-review-btn"
                data-isbn="${book.isbn}">
                Delete Review You Created
              </button>
              <button class="cancel-edit-btn">Cancel</button>
            </div>
          </div>
        </div>
      `;    
      container.appendChild(div);
    });
  }

  document.addEventListener("click", async (e) => {
    //Delete book from my list
    if (e.target.classList.contains("remove-btn")) {
      const isbn = e.target.dataset.isbn;
      const token = localStorage.getItem("token");

      if (!token) {
        alert("You need to log in.");
        return;
      }
      
      try {
        const res = await fetch("http://localhost:3000/api/userlist/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isbn }), 
        });
  
        const data = await res.json();
        if (data.status === "success") {
          alert("Book removed.");
          fetchBooks(); 
        } else {
          alert("Error: " + data.message);
        }
      }catch (err) {
        console.error("Delete failed:", err);
      }
    } 
    //Edit book
    if (e.target.classList.contains("edit-review-btn")) {
      const card = e.target.closest(".book-card");
      card.querySelector(".review-display").style.display = "none";
      card.querySelector(".review-edit").style.display = "block";
      //show delete review button after click edit button
      const deleteBtn = card.querySelector(".delete-review-btn");
      if (deleteBtn) {
        deleteBtn.style.display = "block";
      }
      card.querySelector(".remove-btn").style.display = "none";
      card.querySelector(".edit-review-btn").style.display = "none";
    }
    //cancel button inside edit
    if (e.target.classList.contains("cancel-edit-btn")) {
      const card = e.target.closest(".book-card");
      card.querySelector(".review-display").style.display = "block";
      card.querySelector(".review-edit").style.display = "none";
  
      // back to page
      card.querySelector(".remove-btn").style.display = "block";
      card.querySelector(".edit-review-btn").style.display = "block";
      const deleteBtn = card.querySelector(".delete-review-btn");
      if (deleteBtn) {
        deleteBtn.style.display = "none";
      }
    }
    // save review button inside edit
    if (e.target.classList.contains("save-review-btn")) {
      const btn = e.target;
      const card = btn.closest(".book-card");
      const isbn = btn.dataset.isbn;

      const rating = parseInt(card.querySelector(".edit-rating").value);
      const comment = card.querySelector(".edit-comment").value;
  
      const token= localStorage.getItem("token");
  
      try{
        const res = await fetch("http://localhost:3000/api/reviews/addOrUpdate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isbn, rating, comment }),
        })
          const data= await res.json();
          if (data.status === "success") {
              alert("Review updated!");
              userReviews = await fetchReviews();
              fetchBooks(); // reflesh page
            } else {
              alert("Error: " + (data.message || "Unable to update review."));
            }
      }catch (err) {
        console.error("Edit error:", err);
        alert("Error updating the review.");
      }
    }
    //delete review button inside edit
    if (e.target.classList.contains("delete-review-btn")) {
      const btn = e.target;
      const card = btn.closest(".book-card");
      const isbn = btn.dataset.isbn;
      const token= localStorage.getItem("token");

      if (!confirm("Are you sure you want to delete this review?")) return;

      try{
        const res = await fetch("http://localhost:3000/api/reviews/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isbn }),
        })
        const data = await res.json();
        if (data.status === "success") {
          alert("review deleted");
          userReviews = await fetchReviews();
          fetchBooks(); 
        } else {
          alert("Error: " + data.message);
        }
      }catch (err) {
        console.error("Delete failed:", err);
      }
    }
  });

  fetchBooks(1);
});
