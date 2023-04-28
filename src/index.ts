import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;
const prisma = new PrismaClient();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
	const { message } = req.body;

	if (!message)
		return res.status(400).send({
			message: "No message provided",
		});

	res.send({ message });
});

app.get("/snacks", async (req: Request, res: Response) => {
	const { snack } = req.query;

	if (!snack) return res.status(400).send({ error: "Snack is required" });

	const snacks = await prisma.snack.findMany({
		where: {
			snack: {
				equals: snack as string,
			},
		},
	});

	res.send(snacks);
});

app.get("/orders/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const order = await prisma.order.findUnique({
		where: {
			id: +id,
		},
	});

	if (!order) return res.status(404).send({ error: "Order not found" });

	res.send(order);
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
