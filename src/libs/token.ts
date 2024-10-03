import { createJWT, validateJWT } from "oslo/jwt";
import { TimeSpan } from "oslo";

const getSecret = async () => {
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(process.env.TOKEN_SECRET);
  return uint8Array.buffer as ArrayBuffer;
};

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
