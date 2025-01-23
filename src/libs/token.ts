import { createJWT, validateJWT } from "oslo/jwt";
import { TimeSpan } from "oslo";

const getSecret = async () => {
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(process.env.TOKEN_SECRET);
  return uint8Array.buffer as ArrayBuffer;
};

// EXPLANATION:
// Using TextEncoder to encode the TOKEN_SECRET because in older Oslo.js (oslo/jwt)
// the process of setting the secret was not straightforward,
// it had to be made into an ArrayBuffer not a string,
// the docs is still at https://oslo.js.org/reference/jwt
// In the newest version, it's called @oslojs/jwt (with an @ symbol) but the docs is less clear
// If it feels a bit complicated, just replace this using jsonwebtoken + @types/jsonwebtoken packages

export const createToken = async (userId: string) => {
  const secret = await getSecret();

  try {
    const jwt = await createJWT(
      "HS256",
      secret,
      {}, // payload
      {
        subject: userId,
        expiresIn: new TimeSpan(1, "d"),
        includeIssuedTimestamp: true,
      }
    );

    return jwt;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const validateToken = async (token: string) => {
  const secret = await getSecret();

  try {
    const decodedToken = await validateJWT("HS256", secret, token);
    return decodedToken;
  } catch (error) {
    console.info("Failed token validation attempt");
    return null;
  }
};
