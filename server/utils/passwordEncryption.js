import crypto from "crypto";

const ENCRYPTION_KEY = process.env.PASSWORD_ENCRYPTION_KEY;
const ALGORITHM = "aes-256-cbc";

const getKey = () => {
  return crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
};

export const encryptPassword = (password) => {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

export const decryptPassword = (encryptedPassword) => {
  if (!encryptedPassword || !encryptedPassword.includes(":")) {
    throw new Error("Invalid encrypted password");
  }
  const key = getKey();
  const [ivHex, encrypted] = encryptedPassword.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
