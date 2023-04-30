import { Customer, Order, PrismaClient } from "@prisma/client";

import { CustomerData } from "../interfaces/CustomerData";
import { PaymentData } from "../interfaces/PaymentData";
import { SnackData } from "../interfaces/SnackData";

export default class CheckoutService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = new PrismaClient();
	}

	async process(
		cart: SnackData[],
		customer: CustomerData,
		payment: PaymentData
	) {
		// TODO: "puxar" os dados de snacks do BD
		const snacks = await this.prisma.snack.findMany({
			where: {
				id: {
					in: cart.map((snack) => snack.id),
				},
			},
		});
		// console.log(`snacks`, snacks);

		const snacksInCart = snacks.map<SnackData>((snack) => ({
			...snack,
			price: Number(snack.price),
			quantity: cart.find((item) => item.id === snack.id)?.quantity!,
			subTotal:
				cart.find((item) => item.id === snack.id)?.quantity! *
				Number(snack.price),
		}));
		console.log(`snacksInCart`, snacksInCart);

		// TODO: registrar os dados dos clientes no BD
		const customerCreated = await this.CreateCustomer(customer);
		console.log(`customerCreated`, customerCreated);

		// TODO: criar uma order
		const orderCreated = await this.createOrder(snacksInCart, customerCreated);
		console.log(`orderCreated`, orderCreated);

		// TODO: processar o pagamento
	}

	private async CreateCustomer(customer: CustomerData): Promise<Customer> {
		const customerCreated = await this.prisma.customer.upsert({
			where: { email: customer.email },
			update: customer,
			create: customer,
		});

		return customerCreated;
	}

	private async createOrder(
		snacksInCart: SnackData[],
		customer: Customer
	): Promise<Order> {
		const total = snacksInCart.reduce((acc, snack) => acc + snack.subTotal, 0);

		const orderCreated = await this.prisma.order.create({
			data: {
				total,
				customer: {
					connect: { id: customer.id },
				},
				orderItems: {
					createMany: {
						data: snacksInCart.map((snack) => ({
							snackId: snack.id,
							snack: {
								connect: { id: snack.id },
							},
							quantity: snack.quantity,
							subTotal: snack.subTotal,
						})),
					},
				},
			},
			include: {
				customer: true,
				orderItems: { include: { snack: true } },
			},
		});

		return orderCreated;
	}
}
