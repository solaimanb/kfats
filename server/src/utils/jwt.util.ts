import jwt, {
  SignOptions,
  Secret,
  JsonWebTokenError,
  TokenExpiredError,
  NotBeforeError,
} from "jsonwebtoken";
import { config } from "../config";
import { JWTPayload } from "../types/auth.types";
import { AuthenticationError } from "./error.util";

export const signToken = (payload: Omit<JWTPayload, "iat" | "exp">) => {
  const options: SignOptions = {
    expiresIn: parseInt(config.jwt.expiresIn, 10) || "7d",
  };
  return jwt.sign(payload, config.jwt.secret as Secret, options);
};

export const verifyToken = async (token: string): Promise<JWTPayload> => {
  try {
    const decoded = await new Promise<JWTPayload>((resolve, reject) => {
      jwt.verify(token, config.jwt.secret as Secret, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded as JWTPayload);
      });
    });
    return decoded;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new AuthenticationError("Token has expired");
    }
    if (error instanceof JsonWebTokenError) {
      throw new AuthenticationError("Invalid token");
    }
    if (error instanceof NotBeforeError) {
      throw new AuthenticationError("Token not yet valid");
    }
    throw new AuthenticationError("Token verification failed");
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  const decoded = jwt.decode(token);
  if (!decoded) return null;

  // Validate the shape of the decoded token
  const payload = decoded as JWTPayload;
  if (!payload.id || !payload.roles || !payload.email) {
    return null;
  }

  return payload;
};
