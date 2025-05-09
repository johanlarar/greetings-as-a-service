import express from "express";
import path, { dirname } from "node:path";
import fs from "node:fs";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";
const __dirname = path.resolve();

const app = express();

const fileName = path.join(__dirname, "data", "name.json");

app.use(express.static(path.join(__dirname, "dist")));
app.use(bodyParser.json());

app.post("/hello/:firstName", (req, res) => {
	console.log(req.body.lastName);
	const file = fs.readFileSync(fileName, {
		encoding: "utf-8",
		flag: "r+",
	});
	const data = JSON.parse(file);

	data.push({
		id: uuidv4(),
		firstName: req.params.firstName,
		lastName: req.body.lastName,
	});

	fs.writeFileSync(fileName, JSON.stringify(data));
	res.send({ message: `Hello, ${req.params.firstName}` });
});

app.get("/names", (req, res) => {
	res.sendFile(fileName);
});

app.delete("/delete/:id", (req, res) => {
	const id = req.params.id;
	const file = fs.readFileSync(fileName, {
		encoding: "utf-8",
		flag: "r+",
	});
	const data = JSON.parse(file);

	const newData = data.filter((d) => d.id !== req.params.id);
	fs.writeFileSync(fileName, JSON.stringify(newData));

	res.send(newData);
});

app.listen(3000, () => {
	console.log("Server started");
});
