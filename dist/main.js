console.log("Hello, from main.js");

// Our global variables

// The complete list of todos available to us
let todos = [];

// Keep track of what's been written in our inputs
let owner = "";
let todo = "";

// Select the HTML element that we start of with by default
// that is our inputs, submit button, the list in which we want
// to render our todos, the loading message and a placeholder for
// any potential errors we want to inform the end user of.
const ownerInput = document.getElementById("owner");
const todoInput = document.getElementById("task");
const button = document.getElementById("submit");
const list = document.getElementById("todos");
const loadingMessage = document.getElementById("loading");
const errorMessage = document.getElementById("error");

/**
 * @name createTodo
 * @description Creates a todo item in our backend
 */
const createTodo = async () => {
	// Fetch returns a Promise. Sometime in the future this will resolve. Javascript can do
	// other things (like rendering the UI) in the meanwhile and come back later to check if
	// the Promise resolved.
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
	// Again, await to resolve the JSON from the body of the response
	const body = await res.json();
	// If we recieve anything but a 20x (200 etc.) of some sort throw an error
	if (!res.ok) {
		throw new Error(body.error);
	}
	const greeting = body.message; // "Hello, test"
	document.getElementById("heading").innerHTML = greeting;

	// Empty inputs
	ownerInput.value = "";
	todoInput.value = "";
	// Empty values in memory
	owner = "";
	todo = "";
	// Rerender the todo list
	renderTodos();
};

/**
 * @name getTodos
 * @description Gets a list of todos
 */
const getTodos = async () => {
	// When fetching, if we don't provide an option object as the second parameter
	// it default to method as GET.
	// fetch("/todos", { method: 'GET' }) is the same as what we've written bellow.
	// When we want to GET we don't provide an option object.
	const res = await fetch("/todos");
	const body = await res.json();

	// If we recieve a status code that's anything but a 20x (200 etc.) throw an error
	if (!res.ok) {
		throw new Error(body.error);
	}
	// We overwrite the todos array with our new value
	todos = body;
	// We DO NOT rerender the list here because we use this function inside of the renderTodos function
};

/**
 * @name updateChecked
 * @description Updates checked for todo by id
 */
const updateChecked = async (event) => {
	// Here we wanted to do a PUT request so we added a second option object with the
	// property method set to PUT. Since this endpoint is just a toggle true/false we
	// don't need to provide any additional data.
	const res = await fetch(`/todo/checked/${event.target.id}`, {
		method: "PUT",
	});
	const body = res.json();
	// If we recieve a status code that's anything but a 20x (200 etc.) throw an error
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
	// This time we wanted to update a priority that ha 3 states, 1st, 2nd and 3rd.
	// That means that we need to provide a body to our options object. The body is
	// just a text string but we want it to be a text string representing the JSON
	// of our object containing a property prio.
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
	// If we recieve a status code that's anything but a 20x (200 etc.) throw an error
	if (!res.ok) {
		throw new Error(body.error);
	}
	// We rerender the todo list to reflect the updated state
	renderTodos();
};

/**
 * @name deleteTodo
 * @description Deletes todo by id
 */
const deleteTodo = async (event) => {
	// To send a delete request we provide a options object with the property method set to DELETE.
	await fetch(`/todo/delete/${event.target.id}`, {
		method: "DELETE",
	});
	// We rerender the list to reflect the new state
	renderTodos();
};

const createLiNoDataAvailable = () => {
	const container = document.createElement("li");
	container.textContent = "No todos available. Please create one!";
	return container;
};

// By creating isolated functions for each section of our list item
// we're able to compartmentalize each section in to it's own scope.
// This means that we can reson more clearly about the code of each
// section. Now easy is relative but easier than if we had all this
// logic running in one huge function.

// The input element needs a few things. For one it needs a container element,
// i.e. the div element that wrapps it. Then we need to set the type of the input
// so that our browser knows to render a checkbox. We want to set the id so that
// we can use that id when executing the updateChecked function to know which
// todo we should toggle the done state for.
//
// Finally we want to add an event listener and return the container now containing
// our input[type=checkbox] element with its corresponding event listener.
//
// This is essentially what we do for all of our elements in the todo list. Now if we
// want to add another element we have a code structure to follow in how to do so.
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

// Now we want to add a text node with owner and the todo. If the checkbox is set to true
// and the todo is done we want to give the item a strike through marking it as done.
const createTextNodeColumn = (item) => {
	const container = document.createElement("div");
	container.textContent = `${item.owner} - ${item.todo}`;
	if (item.checked) {
		container.style.textDecoration = "line-through";
	} else {
		container.style.textDecoration = "none";
	}
	return container;
};

// Here we add the delete button and if you've followed in the comments this far
// it should be fairly straight forward in understanding what this does.
const createDeleteButtonColumn = (id) => {
	const container = document.createElement("div");
	const button = document.createElement("button");
	button.id = id;
	button.innerText = "X";

	container.appendChild(button);

	container.addEventListener("click", deleteTodo);

	return container;
};

// Now here it gets a bit trickier. We want to render a drop down using the browser
// native select element.
const createPrioDropdown = (item) => {
	const container = document.createElement("div");
	const dropdown = document.createElement("select");
	dropdown.id = item.id;
	// Most things up to this point have been familiar but now there's an array.
	// We can assume it represents our various priority levels 1, 2 and 3.
	const prioArr = [1, 2, 3];
	for (prio of prioArr) {
		// when creating a select element we get a HTMLSelectElement in return. This element
		// has support for a Collection of Option. To add a <option> element we can go:
		// const option = document.createElement("option");
		// option.value = "some value";
		// option.textContent = "Some text";
		// dropdown.appendChild(option);
		//
		// or... you guessed it. We can use the Option class and add to our dropdown
		// using the options collection that exports a method add. They do the same thing.
		// See: https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement/Option
		dropdown.options.add(new Option(prio, prio));
	}
	// To set which value to display we have to set the value here, corresponding to the
	// value which we set in the Option. If we do it prior to creating the options list our
	// select element doesn't know which value corresponds to which option element (because there are none)
	dropdown.value = item.prio; // Sets the default value of the select dropdown to our value from the backend
	dropdown.addEventListener("change", updatePrio); // Add an event listener
	container.appendChild(dropdown);
	return container;
};

// Check the HTML content in your browser
// We created a li element, inside of it we have four div elements.
// Each of these div elements have a checkbox, a priority drop down, the name and task
// followed by the button, in that order.
const createLiElementRow = (item) => {
	const container = document.createElement("li");
	container.appendChild(createCheckBoxColumn(item));
	container.appendChild(createPrioDropdown(item));
	container.appendChild(createTextNodeColumn(item));
	container.appendChild(createDeleteButtonColumn(item.id));
	return container;
};

// We've not talked too much about sort but I want you to understand just one
// thing here. It's that there's several different ways of sorting things in programming
// which will all give you the same result – a sorted list of some type.
// To see a visualisation of various sorting algorithm check this video out:
// https://www.youtube.com/watch?v=kPRA0W1kECg
// What you need to understand is that some sorting algorithm are better suited for some
// type of data. Also different browsers may use different algorithms.
// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
//
// We're not implementing a custom algorithm here we're just telling the sort function what to sort
// on in our object. We want to sort based on priority so we tell it to compare and sort using prio.
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

// This function is very central to our rendering of the application
const renderTodos = async () => {
	try {
		// Remember that in getTodos we don't run renderTodos since it's being
		// called inside renderTodos already.
		await getTodos();
		// We need to empty the list otherwise we will just create duplicates
		list.innerHTML = "";

		// If there are no todos in our array it has a length of 0 evaluating to false
		// if it does have items we will render them.
		if (todos.length) {
			loadingMessage.remove(); // By default there's a loading message. Remove that.
			// loop through the sorted list of todos for each iteration assing current item to
			// the variable nameItem.
			for (nameItem of sortTodosByPrio()) {
				const listElement = createLiElementRow(nameItem); // Call our function to create a list element
				list.appendChild(listElement); // Append the list element to our ul list
			}
		} else {
			// If not data was available i.e. if the todos array is empty
			const el = createLiNoDataAvailable(); // Render the "not available"" message
			list.appendChild(el); // Append it to our ul list
		}
	} catch (error) {
		errorMessage.textContent = error.message; // If there's an error of any type write it to our error field
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

// While last thing in the code this is actually amongst the first that exectues.
// Once the DOM tree has loaded and the users has recieved the entire DOM structure
// javascript fires the event "DOMContentLoaded". By listening to it we can make sure
// that we only start executing our javascript once the entire DOM tree is rendered.
// If we don't do this we risk that part of the DOM isn't available and some of our
// selectors might return null.
// For example if our ul list isn't rendered upon execution we can't select it and
// assign it to `list` meaning we aren't able to render any todos.
document.addEventListener("DOMContentLoaded", renderTodos);
