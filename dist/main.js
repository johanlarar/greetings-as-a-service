console.log("Hello, from main.js");

let firstName = "test!!!";

const getMessage = async () => {
	const res = await fetch(`/hello/${firstName}`);
	const body = await res.json();
	const greeting = body.message; // "Hello, test"
	document.getElementById("heading").innerHTML = greeting;
};

const input = document.getElementById("your_name");
const button = document.getElementById("submit");
button.addEventListener("click", () => {
	getMessage();
});

input.addEventListener("change", (event) => {
	const inputValue = event.target.value;
	firstName = inputValue;
});
