console.log("Hello, from main.js");

let owner = "";
let todo = "";
let todos = [];

const ownerInput = document.getElementById("owner");
const todoInput = document.getElementById("task");
const button = document.getElementById("submit");
const list = document.getElementById("todos");
const loadingMessage = document.getElementById("loading");
const errorMessage = document.getElementById("error");

const createTodo = async () => {
	const res = await fetch("/todo", {
		method: "POST",
		body: JSON.stringify({
			owner,
			todo,
		}),
		headers: {
			"Content-Type": "application/json",
		},
	});
	const body = await res.json();
	if (!res.ok) {
		throw new Error(body.error);
	}
	const greeting = body.message; // "Hello, test"
	document.getElementById("heading").innerHTML = greeting;
	renderTodos();
	// Empty inputs
	ownerInput.value = "";
	todoInput.value = "";
	// Empty values in memory
	owner = "";
	todo = "";
};

/**
 * @name getTodos
 * @description Gets a list of todos
 */
const getTodos = async () => {
	const res = await fetch("/todos");
	const body = await res.json();
	if (!res.ok) {
		throw new Error(body.error);
	}
	todos = body;
};

/**
 * @name updateChecked
 * @description Updates checked for todo by id
 */
const updateChecked = async (event) => {
	const res = await fetch(`/todo/checked/${event.target.id}`, {
		method: "PUT",
	});
	const body = res.json();
	if (!res.ok) {
		throw new Error(body.error);
	}
	renderTodos();
};

/**
 * @name updatePrio
 * @description Updates priority for tody by id
 */

const updatePrio = async (event) => {
	const res = await fetch(`/todo/prio/${event.target.id}`, {
		method: "PUT",
		body: JSON.stringify({
			prio: event.target.value,
		}),
		headers: {
			"Content-Type": "application/json",
		},
	});
	const body = res.json();
	if (!res.ok) {
		throw new Error(body.error);
	}
	renderTodos();
};

/**
 * @name deleteTodo
 * @description Deletes todo by id
 */
const deleteTodo = async (event) => {
	await fetch(`/todo/delete/${event.target.id}`, {
		method: "DELETE",
	});
	renderTodos();
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

	checkbox.addEventListener("click", updateChecked);

	return container;
};

const createTextNodeColumn = (item) => {
	const container = document.createElement("div");
	container.textContent = `${item.owner} ${item.todo}`;
	if (item.checked) {
		container.style.textDecoration = "line-through";
	} else {
		container.style.textDecoration = "none";
	}
	return container;
};

const createDeleteButtonColumn = (id) => {
	const container = document.createElement("div");
	const button = document.createElement("button");
	button.id = id;
	button.innerText = "X";

	container.appendChild(button);

	container.addEventListener("click", deleteTodo);

	return container;
};

const createPrioDropdown = (item) => {
	const container = document.createElement("div");
	const dropdown = document.createElement("select");
	dropdown.id = item.id;
	const prioArr = [1, 2, 3];
	for (prio of prioArr) {
		dropdown.options.add(new Option(prio, prio));
	}
	dropdown.value = item.prio;
	dropdown.addEventListener("change", updatePrio);
	container.appendChild(dropdown);
	return container;
};

const createLiElementRow = (item) => {
	const container = document.createElement("li");
	container.appendChild(createCheckBoxColumn(item));
	container.appendChild(createPrioDropdown(item));
	container.appendChild(createTextNodeColumn(item));
	container.appendChild(createDeleteButtonColumn(item.id));
	return container;
};

const sortTodosByPrio = () =>
	todos.sort((a, b) => {
		if (a.prio < b.prio) {
			return -1;
		}
		if (a.prio > b.prio) {
			return 1;
		}

		return 0;
	});

const renderTodos = async (event) => {
	try {
		await getTodos();
		list.innerHTML = "";
		if (!todos.length) {
			const el = createLiNoDataAvailable();
			list.appendChild(el);
		} else {
			loadingMessage.remove();
			for (nameItem of sortTodosByPrio()) {
				const listElement = createLiElementRow(nameItem);
				list.appendChild(listElement);
			}
		}
	} catch (error) {
		errorMessage.textContent = error.message;
	}
};

const handleSetOwner = (event) => {
	owner = event.target.value;
	event.target.value = owner;
};

const handleSetTodo = (event) => {
	todo = event.target.value;
	event.target.value = todo;
};

const handleEnter = (event, nameType) => {
	if (event.key === "Enter") {
		if (nameType === "owner") {
			handleSetOwner(event);
		}
		if (nameType === "todo") {
			handleSetTodo(event);
		}
		if (!owner) {
			error.textContent = "No owner set";
			return;
		}
		if (!todo) {
			error.textContent = "No task set";
			return;
		}
		error.innerText = "";
		createTodo();
	}
};

button.addEventListener("click", createTodo);

ownerInput.addEventListener("change", handleSetOwner);
todoInput.addEventListener("change", handleSetTodo);

ownerInput.addEventListener("keypress", (event) => handleEnter(event, "owner"));

todoInput.addEventListener("keypress", (event) => handleEnter(event, "todo"));

document.addEventListener("DOMContentLoaded", renderTodos);
