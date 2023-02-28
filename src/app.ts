import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User, { IUser } from "./models/User";

dotenv.config({ path: "./.env" });

const MONGO_URL: string = process.env.MONGO_URL || "";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.set("strictQuery", true);
mongoose
	.connect(MONGO_URL)
	.then(() => console.log("Connected to Mongoose"))
	.catch((err) => {
		console.log("Error=======> ", err);
	});
//validations -----------------------------------------------------

function isValidPassword(password: string): boolean {
	const passwordRegex: RegExp =
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
	return passwordRegex.test(password);
}
function isValidEmail(email: string): boolean {
	const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}
function isValidUserName(name: string): boolean {
	const nameRegex: RegExp = /^[a-zA-Z ]{5,30}$/;
	return nameRegex.test(name);
}
//----------------------------------------------------------------
app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/new", async (req, res) => {
	try {
		const user: IUser = req.body.user;
		const { name, email, password } = user || {}; //doubt
		if (!email || email.trim() === "") {
			throw new Error(" user email is required");
		}
		if (!password || password.trim() === "") {
			throw new Error(" user password is required");
		}
		if (!user || name === "") {
			throw new Error(" user name is required");
		}
		console.log(`🚀🚀 -> file: app.ts:27 -> app.post -> user:`, user);

		const existingUser = await User.find({ email: email }); // check if user already exists with this email.

		if (existingUser.length > 0) {
			console.log(
				`🚀🚀 -> file: app.ts:40 -> User.find({email:email}):`,
				existingUser,
				existingUser.length,
			);
			throw new Error(`user with email: ${email} already exists`);
		}

		if (!isValidPassword(password)) {
			throw new Error(
				"Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number",
			);
		}
		if (!isValidEmail(email)) {
			throw new Error("Invalid email address");
		}
		if (!isValidUserName(name)) {
			throw new Error("Invalid Username");
		}
		//user creation (signup)-------------------------------------------
		await User.create({
			name: user.name,
			email: user.email,
			password: user.password,
		});

		const thisUser = await User.find({ email: user.email });
		const msg: string = `Hello ${user.name} user is created , ${thisUser}`;

		res.send(msg);
	} catch (error: any) {
		console.log(`🚀🚀 -> file: app.ts:34 -> app.post -> error:`, error.message);
		res.send({ status: 404, msg: error.message });
	}
});
//----------------------------------------------------------------

//login apis ----------------------------------------------------------------
app.post("/Login", async (req, res) => {
	try {
		const { name, email, password } = req.body.user;
		if (!email || email.trim() === "") {
			throw new Error("Email is required");
		}

		if (!password || password.trim() === "") {
			throw new Error("Password is required");
		}

		const user = (await User.find({ email: email }))[0];
		console.log(user);

		if (!user) {
			throw new Error(`User with email ${email} not found`);
		}

		if (password !== user.password) {
			throw new Error("Invalid password");
		}

		const msg: String = `Hello ${user.name.split(" ")[0]}! Login successful.`;
		res.send({
			status: "success",
			msg,
			data: user,
		});
	} catch (error: any) {
		console.log(`Error: ${error.message}`);
		res.status(400).send({ Status: 404, msg: error.message });
	}
});

//port details ----------------------------------------------------------------
const port = process.env.PORT;
app.listen(port, () => {
	console.log(
		`Server running at http://localhost:${port}, ${process.env.MONGO_URL}`,
	);
});
