document.addEventListener("DOMContentLoaded", function () {
  const jobId = document.body.dataset.jobId;

  // Delete job
  document
    .getElementById("delete-job-btn")
    .addEventListener("click", function () {
      if (confirm("Are you sure you want to delete this job?")) {
        fetch(`/jobs/${jobId}`, { method: "DELETE" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              window.location.href = "/jobs";
            } else {
              alert("Failed to delete job");
            }
          })
          .catch((error) => console.error("Error:", error));
      }
    });

  // Link notes
  document
    .getElementById("link-notes-btn")
    .addEventListener("click", function () {
      // Implement link notes functionality
    });

  // Add comment
  document
    .getElementById("comment-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const content = this.content.value;
      fetch(`/jobs/${jobId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            addCommentToList(data.comment);
            this.reset();
          } else {
            alert("Failed to add comment");
          }
        })
        .catch((error) => console.error("Error:", error));
    });

  function addCommentToList(comment) {
    const commentsList = document.getElementById("comments-list");
    const commentElement = document.createElement("div");
    commentElement.className = "comment";
    commentElement.innerHTML = `
            <p>${comment.content}</p>
            <small>${new Date(comment.createdAt).toLocaleString()}</small>
        `;
    commentsList.appendChild(commentElement);
  }

  // Load initial data
  loadLinkedNotes();
  loadComments();
});

function loadLinkedNotes() {
  // Implement loading linked notes
}

function loadComments() {
  // Implement loading comments
}
