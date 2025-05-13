console.log("Hello, from main.js");

let firstName = "";
let lastName = "";
let nameList = [];

const firstNameInput = document.getElementById("first_name");
const lastNameInput = document.getElementById("last_name");
const button = document.getElementById("submit");
const list = document.getElementById("name-list");
const loadingMessage = document.getElementById("loading");
const errorMessage = document.getElementById("error");

const setName = async () => {
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

const createLiNoDataAvailable = () => {
	const container = document.createElement("li");
	container.textContent = "No data available";
	return container;
};

const createCheckBoxColumn = (item) => {
	const container = document.createElement("div");
	const checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.id = item.id;
	checkbox.checked = item.checked;

	container.appendChild(checkbox);

	checkbox.addEventListener("click", (event) => {
		console.log(`Checkbox with id: ${id} was clicked`);
	});

	return container;
};

const createTextNodeColumn = (item) => {
	const container = document.createElement("div");
	container.textContent = `${item.firstName} ${item.lastName}`;
	return container;
};

const createDeleteButtonColumn = (id) => {
	const container = document.createElement("div");
	const button = document.createElement("button");
	button.id = nameItem.id;
	button.innerText = "X";

	container.appendChild(button);

	container.addEventListener("click", deleteName);

	return container;
};

const createLiElementRow = (item) => {
	const container = document.createElement("li");
	container.appendChild(createCheckBoxColumn(item));
	container.appendChild(createTextNodeColumn(item));
	container.appendChild(createDeleteButtonColumn(item.id));
	return container;
};

const renderNamesList = async (event) => {
	// await new Promise((resolve) => setTimeout(resolve, 2000));
	await getNames();
	list.innerHTML = "";
	if (!nameList.length) {
		const el = createLiNoDataAvailable();
		list.appendChild(el);
	} else {
		loadingMessage.remove();
		for (nameItem of nameList) {
			const listElement = createLiElementRow(nameItem);

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

const handleEnter = (event, nameType) => {
	if (event.key === "Enter") {
		if (nameType === "firstName") {
			setNewFirstName(event);
		}
		if (nameType === "lastName") {
			setNewLastName(event);
		}
		if (!firstName) {
			error.innerText = "Inget första namn satt";
			return;
		}
		if (!lastName) {
			error.innerText = "Inget efternamn satt";
			return;
		}
		error.innerText = "";
		setName();
	}
};

button.addEventListener("click", setName);

firstNameInput.addEventListener("change", setNewFirstName);
lastNameInput.addEventListener("change", setNewLastName);

firstNameInput.addEventListener("keypress", (event) =>
	handleEnter(event, "firstName"),
);

lastNameInput.addEventListener("keypress", (event) =>
	handleEnter(event, "lastName"),
);

document.addEventListener("DOMContentLoaded", renderNamesList);
