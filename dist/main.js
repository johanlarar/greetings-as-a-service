console.log("Hello, from main.js");

let firstName = "";
let lastName = "";
let nameList = [];

const firstNameInput = document.getElementById("first_name");
const lastNameInput = document.getElementById("last_name");
const button = document.getElementById("submit");
const list = document.getElementById("name-list");
const loadingMessage = document.getElementById("loading");

const getName = async () => {
	const res = await fetch(`/hello/${firstName}`, {
		method: "POST",
		body: JSON.stringify({
			lastName,
		}),
		headers: {
			"Content-Type": "application/json",
		},
	});
	const body = await res.json();
	const greeting = body.message; // "Hello, test"
	document.getElementById("heading").innerHTML = greeting;
	renderNamesList();
	firstNameInput.value = "";
	lastNameInput.value = "";
};

const getNames = async () => {
	const res = await fetch("/names");
	const names = await res.json();
	nameList = names;
};

const deleteName = async (event) => {
	await fetch(`/delete/${event.target.id}`, {
		method: "DELETE",
	});
	renderNamesList();
};

const createLiElement = (text) => {
	const el = document.createElement("li");
	el.innerHTML = text;
	return el;
};

const renderNamesList = async (event) => {
	// await new Promise((resolve) => setTimeout(resolve, 2000));
	await getNames();
	list.innerHTML = "";
	if (!nameList.length) {
		const el = createLiElement("No data available");
		list.appendChild(el);
	} else {
		loadingMessage.remove();
		for (nameItem of nameList) {
			const listElement = createLiElement(
				nameItem.firstName + " " + nameItem.lastName,
			);

			const deleteBtn = document.createElement("button");
			deleteBtn.id = nameItem.id;
			deleteBtn.innerText = "X";

			deleteBtn.addEventListener("click", deleteName);

			listElement.appendChild(deleteBtn);
			list.appendChild(listElement);
		}
	}
};

const setNewFirstName = (event) => {
	firstName = event.target.value;
	event.target.value = firstName;
};

const setNewLastName = (event) => {
	lastName = event.target.value;
	event.target.value = lastName;
};

button.addEventListener("click", getName);

firstNameInput.addEventListener("change", setNewFirstName);
lastNameInput.addEventListener("change", setNewLastName);

firstNameInput.addEventListener("keypress", (event) => {
	if (event.key === "Enter") {
		setNewFirstName(event);
		getName();
	}
});

document.addEventListener("DOMContentLoaded", renderNamesList);
