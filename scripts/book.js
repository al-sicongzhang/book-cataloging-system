document.addEventListener("DOMContentLoaded", () => {
  const bookDetail = document.getElementById("bookDetail");
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");
  const bookVolumeId = localStorage.getItem("selectedBookId");

  if (!bookVolumeId) {
    bookDetail.innerHTML = "<p>No book selected.</p>";
    return;
  }
  let isbn = "";
  fetch(`https://www.googleapis.com/books/v1/volumes/${bookVolumeId}`)
  .then(res => res.json())
  .then(book => {
   const info = book.volumeInfo;
   const title = info.title || "No Title";
   const authors = info.authors ? info.authors.join(", ") : "Unknown";
   const description = info.description || "No description.";
   const thumbnail = info.imageLinks?.thumbnail || 'https://via.placeholder.com/128x180?text=No+Image';
   const publishedDate = info.publishedDate || "Unknown";
   isbn = info.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier
   || info.industryIdentifiers?.find(id => id.type === "ISBN_10")?.identifier
   || "Unknown";

   const pageCount = info.pageCount || "Unknown";
   const categories = info.categories ? info.categories.join(", ") : "Unknown";

   bookDetail.innerHTML = `
     <div class="book-detail-card">
       <img src="${thumbnail}" alt="Cover" />
       <h2>${title}</h2>
       <p><strong>Author:</strong> ${authors}</p>
       <p><strong>Published:</strong> ${publishedDate}</p>
       <p><strong>ISBN:</strong> ${isbn}</p>
       <p><strong>Page Count:</strong> ${pageCount}</p>
       <p><strong>Category:</strong> ${categories}</p>
       <p><strong>Description:</strong><br>${description}</p>
       <button id="addBtn">Add to My List</button>
       <section id="commentSection">
         <h3>Leave a Comment</h3>
         <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
           <label for="userRating">Rating:</label>
           <input type="number" id="userRating" min="1" max="5" placeholder="Rating (1-5)" />
         </div>
         <p>Comment:</p>
         <textarea id="userComment" rows="4" placeholder="Your comment..."></textarea>
         <button id="submitReview">Create/Edit Review</button>
       </section>
     </div>
   `;
    // Add to My List Button
    document.getElementById("addBtn").onclick = () => {
          const token = localStorage.getItem("token");

          if(!token){
            alert("You need to login first.");
            return;
          }

          const book={
            isbn:isbn,
            title:title,
            author:authors,
            image_url: thumbnail
          };

          fetch("http://localhost:3000/api/userlist/add",{
            method:"POST",
            headers:{
              "Content-Type":"application/json",
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
          }).catch(err => {
            console.error("Add book error:", err);
            alert("Failed to add book: " + err.message);
          });
    };
    // Submit Review Button
    document.getElementById("submitReview").onclick=async()=>{
          if (!token) {
            alert("You need to log in to leave a review.");
            return;
          }
          const rating = document.getElementById("userRating").value.trim();
          const comment = document.getElementById("userComment").value.trim();

          if (!rating && !comment) {
            alert("Please enter a comment or rating.");
            return;
          }

          try {
            // fetch add. Once user enter review, add book to mylist automaticlly
            const book = {
              isbn,
              title,
              author: authors,
              image_url: thumbnail,
            };
            await fetch("http://localhost:3000/api/userlist/add", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(book),
            });

            // fetch reviews
            const res = await fetch("http://localhost:3000/api/reviews/addOrUpdate", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ isbn, rating, comment }),
            });

            const data = await res.json();
            if (data.status === "success") {
              alert("Review submitted!");
            } else {
              alert("Review failed: " + data.message);
            }
          }catch (err) {
            console.error("Submit review error:", err);
            alert("Something went wrong: " + err.message);
          }      
    };
    // show existing review
    if (token && isbn !== "Unknown") {
        const token = localStorage.getItem("token");
      
        fetch("http://localhost:3000/api/reviews/getall", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data.status === "success" && Array.isArray(data.data)) {
              const ownReview = data.data.find(r => r.isbn === isbn);
              if (ownReview) {
                document.getElementById("userRating").value = ownReview.rating || "";
                document.getElementById("userComment").value = ownReview.comment || "";
              }
            }
          })
          .catch(err => {
            console.error("Error fetching existing review:", err);
          });
    }
  });
});