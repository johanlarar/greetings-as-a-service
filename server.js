import express from "express";
import path, { dirname } from "node:path";
import fs from "node:fs";
const __dirname = path.resolve();

const app = express();

const fileName = path.join(__dirname, "data", "name.json");

app.use(express.static(path.join(__dirname, "dist")));

app.get("/hello/:name", (req, res) => {
	const file = fs.readFileSync(fileName, {
		encoding: "utf-8",
		flag: "r+",
	});
	const data = JSON.parse(file);

	data.push({ name: req.params.name });

	fs.writeFileSync(fileName, JSON.stringify(data));
	res.send({ message: `Hello, ${req.params.name}` });
});

app.get("/data", (req, res) => {
	res.sendFile(fileName);
});

app.listen(3000, () => {
	console.log("Server started");
});

