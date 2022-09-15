import { JWT_SECRET } from "../config";
import jwt from "jsonwebtoken";

class JwtService {
  static sign(payload, expiry = "300s", secret = JWT_SECRET) {
    return jwt.sign(payload, secret, { expiresIn: expiry });
  }

  static verify(token, secret = JWT_SECRET) {
    return jwt.verify(token, secret);
  }
}

export default JwtService;

// jwt toker are not modifiable and they are not encrypted
// 300s = 5 minutes
