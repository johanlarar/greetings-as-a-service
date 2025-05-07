console.log("Hello, from main.js");

let firstName = "";
const listOfNames = [];

const input = document.getElementById("your_name");
const button = document.getElementById("submit");
const list = document.getElementById("name-list");
const loadingMessage = document.getElementById("loading");

const getMessage = async () => {
	const res = await fetch(`/hello/${firstName}`);
	const body = await res.json();
	const greeting = body.message; // "Hello, test"
	document.getElementById("heading").innerHTML = greeting;
};

const getMessages = async () => {
	const res = await fetch("/data");
	const names = await res.json();
	for (n of names) {
		listOfNames.push(n);
	}
};

const loadMessages = async (event) => {
	// await new Promise((resolve) => setTimeout(resolve, 2000));
	await getMessages();
	if (!listOfNames.length) {
		const el = document.createElement("li");
		el.innerHTML = "No available data";
		list.appendChild(el);
	} else {
		loadingMessage.remove();
		for (n of listOfNames) {
			const el = document.createElement("li");
			el.innerHTML = n.name;
			list.appendChild(el);
		}
	}
};

button.addEventListener("click", () => {
	getMessage();
});

input.addEventListener("change", (event) => {
	const inputValue = event.target.value;
	firstName = inputValue;
});

document.addEventListener("DOMContentLoaded", loadMessages);
