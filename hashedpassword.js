import bcrypt from "bcrypt";

const password = "Cook@123";

const hashedPassword = await bcrypt.hash(password, 10);

console.log("Original Password:", password);
console.log("Hashed Password:", hashedPassword);