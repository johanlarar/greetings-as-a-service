console.log("Hello, from main.js");

let firstName = "";
let nameList = [];

const input = document.getElementById("your_name");
const button = document.getElementById("submit");
const list = document.getElementById("name-list");
const loadingMessage = document.getElementById("loading");

const getName = async () => {
	const res = await fetch(`/hello/${firstName}`);
	const body = await res.json();
	const greeting = body.message; // "Hello, test"
	document.getElementById("heading").innerHTML = greeting;
	renderNamesList();
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
			const listElement = createLiElement(nameItem.name);

			const deleteBtn = document.createElement("button");
			deleteBtn.id = nameItem.id;
			deleteBtn.innerText = "X";

			deleteBtn.addEventListener("click", deleteName);

			listElement.appendChild(deleteBtn);
			list.appendChild(listElement);
		}
	}
};

const setNewName = (event) => {
	firstName = event.target.value;
	event.target.value = "";
};

button.addEventListener("click", getName);

input.addEventListener("change", setNewName);

input.addEventListener("keypress", (event) => {
	if (event.key === "Enter") {
		setNewName(event);
		getName();
	}
});

document.addEventListener("DOMContentLoaded", renderNamesList);
