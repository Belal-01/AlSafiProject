import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const secretKey = process.env.SESSION_SECRET || "default_secret_key_for_development_only";
const encodedKey = new TextEncoder().encode(secretKey);

type ApiTokenPayload = {
  userId: string;
  role: "admin";
};

export async function createApiToken(payload: ApiTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(encodedKey);
}

export async function verifyApiToken(token: string) {
  const { payload } = await jwtVerify(token, encodedKey, {
    algorithms: ["HS256"],
  });

  if (payload.role !== "admin" || typeof payload.userId !== "string") {
    return null;
  }

  return {
    userId: payload.userId,
    role: payload.role,
  };
}

export async function requireApiAuth(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    return null;
  }

  try {
    return await verifyApiToken(token);
  } catch {
    return null;
  }
}
