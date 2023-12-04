/*
 * Author: Igor, John, Sherali, Khamdam
 * Date: 12/06/2023
 * Class: CSC 337
 * Instructor: Benjamin Dicken
 *
 * Description: This script is responsible for setting up
 * the client side of the Recipe Sharing application.
 * Allowing the client to send requests to create users,
 * login etc.
 */


document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('userForm');
  if (loginForm) {
     /**
      * Description: Sets up an event listener for the login form. On form submission,
      * it sends the user's credentials to the server for authentication. If 
      * successful, redirects to the home page, else displays an error message.
      *
      * Parameters: None
      * Return: None
     */
      loginForm.addEventListener('submit', function(event) {
          event.preventDefault();
          const username = document.getElementById('usernameLogin').value;
          const password = document.getElementById('passwordLogin').value;

          fetch('/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password }),
              credentials: 'same-origin'
          })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  localStorage.setItem("username", username);
                  localStorage.setItem('sessionId', data.sessionId);
                  window.location.href = '/home.html';
              } else {
                  alert('Login failed: ' + data.message);
              }
          })
          .catch(error => {
              console.error('Error:', error);
          });
      });
  }

  const createAccountForm = document.getElementById('createForm');
  if (createAccountForm) {
      /**
       * Description: Sets up an event listener for the account creation form. 
       * On submission, it sends the new account's details to the server. If account
       * creation is successful, redirects to the login page,
       * otherwise displays an error message.
       *
       * Parameters: None
       * Return: None
       */
      createAccountForm.addEventListener('submit', function(event) {
          event.preventDefault();
          const username = document.getElementById('usernameCreate').value;
          const password = document.getElementById('passwordCreate').value;

          fetch('/create-account', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
          })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  alert('Account created successfully!');
                  window.location.href = '/signin.html';
              } else {
                  alert('Account creation failed: ' + data.message);
              }
          })
          .catch(error => {
              console.error('Error:', error);
          });
      });
  }
});

const logoutButton = document.getElementById('logout');
if (logoutButton) {
    logoutButton.addEventListener('click', function() {
        fetch('/logout', {
            method: 'POST',
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to the login page or index page after successful logout
                window.location.href = '/index.html';
            } else {
                alert('Logout failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
}


document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('commentForm');

  form.onsubmit = function(e) {
      e.preventDefault();

      const recipeId = 'someRecipeId'; // Replace with actual recipe ID
      const commentText = document.getElementById('commentText').value;
      const username = localStorage.getItem("username"); // Replace with the username from the user's session

      const data = {
          username: username,
          text: commentText
      };

      fetch(`/recipe/comment/${recipeId}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
          console.log('Success:', data);
          // Handle success - maybe clear the form or show a success message
      })
      .catch((error) => {
          console.error('Error:', error);
          // Handle errors here, such as displaying an error message
      });
  };
  showComments();
});

function displayComments(comments) {
  const commentsContainer = document.getElementById('commentsContainer');
  commentsContainer.innerHTML = '';  // Clear the tab for comments

  comments.forEach(comment => {
      const commentElement = document.createElement('div');
      commentElement.className = 'comment';
      commentElement.innerHTML = `<strong>${comment.username}:</strong> ${comment.text}`;
      commentsContainer.appendChild(commentElement);
  });
}

function showComments() {
  const recipeId = 'someRecipeId'; // Replace with actual recipe ID

  fetch(`/recipe/comments/${recipeId}`)
      .then(response => response.json())
      .then(data => {
          console.log('Comments:', data);
          displayComments(data);
      })
      .catch(error => {
          console.error('Error fetching comments:', error);
      });
}


function searchRecipe() {
  let keyword = document.getElementById("searchInput").value;
  let url = "/search/recipe/" + keyword;

  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((objects) => {
      populateRecipes(objects);
    })
    .catch((error) => {
      console.log(error);
  });
}

/*
  This function creates posts depending on the filters, 
  or it will be implmented when the program started running.
*/
function populateRecipes(objects) {
  let recipeTab = document.getElementById("recipe-feed");
  recipeTab.innerHTML = "";  // Clear all existing contents

  objects.forEach((item) => {
    const newRecipePost = document.createElement('article');
    newRecipePost.className = 'recipe-post';

    // Image data should be added
    const imageElement = document.createElement('img');
    imageElement.src = item.image;
    imageElement.alt = item.title;
    imageElement.className = 'recipe-image';

    // Create recipe contents
    const contentElement = document.createElement('div');
    contentElement.className = 'recipe-content';
    contentElement.innerHTML = `<h2>${item.title}</h2><p>${item.content}</p>`;

    // Create like button
    const likeButton = document.createElement('button');
    likeButton.id = 'heartBtn';
    likeButton.innerHTML = '<i class="fas fa-heart"></i> ' + item.likes; // Amount of like should be added
    likeButton.onclick = function () {
      incrementLike();
    };

    // Create button for showing comments
    const commentButton = document.createElement('button');
    commentButton.id = 'commentBtn';
    commentButton.innerHTML = '<i class="far fa-comment"></i>';
    commentButton.onclick = function () {
      openCommentModal();
    };

    // Add elements into article tag
    newRecipePost.appendChild(imageElement);
    newRecipePost.appendChild(contentElement);
    newRecipePost.appendChild(likeButton);
    newRecipePost.appendChild(commentButton);

    // Add created article to recipe-feed section
    document.getElementById('recipe-feed').appendChild(newRecipePost);
  });
}

function incrementLike() {
  const recipeId = "your_recipe_id"; // Replace with the actual recipe ID
  const userId = localStorage.getItem("username");

  fetch(`/recipe/like/${recipeId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId: userId }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to increment like');
    }
    return response.json();
  })
  .then(data => {
    console.log(data.message);
    
    const likeCountElement = document.getElementById('likeCount');
    likeCountElement.textContent = data.likes;
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });
}

// Comment tab
function openCommentModal() {
  document.getElementById('commentModal').style.display = 'flex';
}

function closeCommentModal() {
  document.getElementById('commentModal').style.display = 'none';
}

function applyFilter() {
  const mealButtons = document.getElementsByName('meal');
  let selectedMeal = '';
  mealButtons.forEach(button => {
    if (button.checked) {
      selectedMeal = button.value;
    }
  });

  if (selectedMeal !== "Default") {
    let url = '/recipes/category/' + selectedMeal;
    fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((objects) => {
        populateItems(objects);
      })
      .catch((error) => {
        console.log(error);
    });
  } else {
    const sortButtons = document.getElementsByName('sort');
    let selectedSort = '';
    sortButtons.forEach(button => {
      if (button.checked) {
        selectedSort = button.value;
      }
    });

    if (selectedSort === "Most Likes") {
      fetch('/recipes/most-liked')
        .then((response) => {
          return response.json();
        })
        .then((objects) => {
          populateItems(objects);
        })
        .catch((error) => {
          console.log(error);
      });
    } else if (selectedSort === "User Liked") {
      let username = localStorage.getItem("username");
      let url = '/recipes/liked-by/' + username;

      fetch(url)
        .then((response) => {
          return response.json();
        })
        .then((objects) => {
          populateItems(objects);
        })
        .catch((error) => {
          console.log(error);
      });
    }
  }

  // Filtering with server side code
}

function showUserPost() {
  let username = localStorage.getItem("username");  // When logged in, username should be stored in local storage
  let url = "/get/recipe/" + username;

  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((objects) => {
      populateItems(objects);
    })
    .catch((error) => {
      console.log(error);
    });
}

function showRecipes() {
  fetch("/get/recipes/")
    .then((response) => {
      return response.json();
    })
    .then((objects) => {
      populateItems(objects);
    })
    .catch((error) => {
      console.log(error);
  });
}

showRecipes();