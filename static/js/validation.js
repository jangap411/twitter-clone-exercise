let form = document.getElementById("loginForm");
let password = document.getElementById("password");
let username = document.getElementById("user");

form.addEventListener("submit", validate());

function validate() {
  //validates the form input fields
  console.log("validates form before submitting");
}

function setFocus() {
  //sets the focus to the create new post tab
  console.log("..... setting focus .....");
}
