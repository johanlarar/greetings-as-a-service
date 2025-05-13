import express from "express";
import path, { dirname } from "node:path";
import fs from "node:fs";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";
const __dirname = path.resolve();

const app = express();

const fileName = path.join(__dirname, "data", "name.json");

function readJsonFile() {
	const file = fs.readFileSync(fileName, {
		encoding: "utf-8",
		flag: "r+",
	});
	return JSON.parse(file);
}

function wrtieToJsonFile(data) {
	fs.writeFileSync(fileName, JSON.stringify(data));
}

app.use(express.static(path.join(__dirname, "dist")));
app.use(bodyParser.json());

app.post("/hello/:firstName", (req, res) => {
	const data = readJsonFile();

	data.push({
		id: uuidv4(),
		checked: false,
		firstName: req.params.firstName,
		lastName: req.body.lastName,
	});

	wrtieToJsonFile(data);

	res.send({ message: `Hello, ${req.params.firstName}` });
});

app.get("/names", (req, res) => {
	res.sendFile(fileName);
});

app.delete("/delete/:id", (req, res) => {
	const data = readJsonFile().filter((d) => d.id !== req.params.id);

	wrtieToJsonFile(data);
	res.send(data);
});

app.put("/name/:id", (req, res) => {
	const data = readJsonFile().map((data) => {
		if (data.id === req.params.id) {
			data.checked = true;
		}
		return data;
	});
	wrtieToJsonFile(data);
	res.json(data.filter((d) => d.id === req.params.id));
});

app.listen(3000, () => {
	console.log("Server started");
});
