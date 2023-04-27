import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
	const { message } = req.body;

	if (!message)
		return res.status(400).send({
			message: "No message provided",
		});

	res.send({ message });
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
