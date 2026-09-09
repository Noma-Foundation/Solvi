
import { createHmac } from "node:crypto";

function encode(value) {
	return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export function generateJWT(payload, secret, algorithm = "HS256") {
	if (algorithm !== "HS256") {
		throw new Error("Unsupported JWT algorithm");
	}

	const header = encode({ alg: algorithm, typ: "JWT" });
	const body = encode(payload);
	const content = `${header}.${body}`;
	const signature = createHmac("sha256", secret)
		.update(content)
		.digest("base64url");

	return `${content}.${signature}`;
}
