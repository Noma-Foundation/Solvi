
import { sign } from "hono/jwt";

export function generateJWT(payload, secret, algorithm = "HS256") {
	return sign(payload, secret, algorithm);
}
