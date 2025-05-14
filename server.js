import express from "express";
import path, { dirname } from "node:path";
import fs from "node:fs";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";
const __dirname = path.resolve();

const app = express();

const fileName = path.join(__dirname, "data", "name.json");

/**
 * @description This function opens a file in the file system containing JSON and loads the JSON into memory
 * @return {object} The JSON structure defined in data/name.json
 * @notice data/name.json needs to be manually initialized with at least "[]" i.e. an empty array
 */
function readJsonFile() {
	const file = fs.readFileSync(fileName, {
		encoding: "utf-8", // Encoding is turning information into a format that a computer can understand.
		flag: "r+", // Notice this flag https://nodejs.org/api/fs.html#file-system-flags
	});
	return JSON.parse(file);
}

/**
 * @description Writes an object as JSON to a file in the file system
 * @param {object} The object that is to be written
 */
function wrtieToJsonFile(data) {
	fs.writeFileSync(fileName, JSON.stringify(data));
}

app.use(express.static(path.join(__dirname, "dist")));
app.use(bodyParser.json());

/**
 * @description A custom error object, extends Error
 */
class ValidationError extends Error {
	constructor(message) {
		super(message);
		this.name = "ValidationError";
	}
}

/**
 * @description This enpoint creates (C in CRUD) a todo.
 */
app.post("/todo", (req, res) => {
	try {
		if (!req.body.owner) {
			throw new ValidationError("Missing owner of todo");
		}
		if (!req.body.todo) {
			throw new ValidationError("Missing task");
		}
		const data = readJsonFile();

		data.push({
			id: uuidv4(),
			checked: false,
			prio: 3,
			owner: req.body.owner,
			todo: req.body.todo,
		});

		wrtieToJsonFile(data);

		res.send({ message: `Hello, ${req.body.owner}` });
	} catch (error) {
		// `error` is a class. Defaults to the built in javascript class Error
		// We can extend Error to create our own custom error handling

		// We always log the error to the backend. We log it as JSON so it can be machine parse later on.
		console.error(JSON.stringify({ error: error.message, fn: "/todo" }));
		// At the next line we're checking if `error` is an instance of ValidationError
		// which is our custom error defined above.
		if (error instanceof ValidationError) {
			// If `error` is an instance of ValidationError then we know more of what type of error it is
			// we know that we can safely present the error to the end user without risking to give away
			// implementation details (a security risk) or confusing the end user with error messages designed
			// for us as developers.

			// We send the status code 400 (Bad Request) because it was something wrong with their request.
			// Maybe they forgot to subit at owner or a todo
			res.status(400).send({ error: error.message });
		} else {
			// If it was not a ValidationError it was any other type of error and we provide the end user
			// with a "friendly" error message (meaning not an error message design for us a as engineers)
			// We use 500 (Internal Server Error) as the error code. This can be useful for support.
			res.status(500).send({ error: "Unable to write new names" });
		}
	}
});

/**
 * @description This endpoint reads (R in CRUD) a list of todos
 */
app.get("/todos", (req, res) => {
	try {
		const data = readJsonFile(); // We read and load in our JSON structure from the file system to memory
		res.send(data); // We send that to the end user. We haven't specified status code so it will be 200 (OK)
	} catch (error) {
		console.log(JSON.stringify({ error: error.message, fn: "/names" }));
		res.status(500).send({ error: "Unable to load names" });
	}
});

/**
 * @description This endpoints updates (U in CRUD) the checked state of a todo by id
 */
app.put("/todo/checked/:id", (req, res) => {
	try {
		// `map` create a new array from a given array, in our case the data from our json file.
		// If it does, we update it. We simply toggle it by setting it to the opposite of what it was
		// set to before. If it was checked (i.e. if it was true) we set it to "not true" which is false
		// therefor if it was false we set it to "not false" which is true. This create a toggle between
		// the two states checked or unchecked.
		// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

		const data = readJsonFile().map((data) => {
			if (data.id === req.params.id) {
				data.checked = !data.checked;
			}
			return data;
		});
		wrtieToJsonFile(data); // We now write our entire data structure to our file system
		// We use filter to return a new array which consist of only the items in which our return resulted in true
		// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
		res.json(data.filter((d) => d.id === req.params.id));
	} catch (error) {
		console.log(error);
		res
			.status(500)
			.send({ error: "Unable to update done. Try again later..." });
	}
});

/**
 * @description This endpoint updates (U in CRUD) a priority of a todo by id
 */
app.put("/todo/prio/:id", (req, res) => {
	try {
		if (req.body.prio > 3) {
			throw new ValidationError("Prio can't be larger than 3"); // Throw our custom error
		}
		// `map` create a new array from a given array, in our case the data from our json file.
		// If it does, we update it. We simply toggle it by setting it to the opposite of what it was
		// set to before. If it was checked (i.e. if it was true) we set it to "not true" which is false
		// therefor if it was false we set it to "not false" which is true. This create a toggle between
		// the two states checked or unchecked.
		// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
		const data = readJsonFile().map((data) => {
			if (data.id === req.params.id) {
				data.prio = Number.parseInt(req.body.prio);
			}
			return data;
		});
		// Write to file system
		wrtieToJsonFile(data);
		// We use filter to return a new array which consist of only the items in which our return resulted in true
		// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
		res.json(data.filter((d) => d.id === req.params.id));
	} catch (error) {
		console.error(
			JSON.stringify({ error: error.message, fn: "/todo/prio/:id" }),
		);
		if (error instanceof ValidationError) {
			res.status(400).send({ error: error.message });
		} else {
			res
				.status(500)
				.send({ error: "Unable to update prio. Try again later..." });
		}
	}
});

/**
 * @description This endpoint deletes (D in CRUD) a todo by id
 */
app.delete("/todo/delete/:id", (req, res) => {
	try {
		// By using filter we can now return all the object in which the id is not the same as the id
		// we've provided as param. This returns a new array containing everything BUT the item we want
		// to delete.
		// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
		const data = readJsonFile().filter((d) => d.id !== req.params.id);

		wrtieToJsonFile(data);
		res.send(data);
	} catch (error) {}
});

app.listen(3000, () => {
	console.log("Server started");
});
