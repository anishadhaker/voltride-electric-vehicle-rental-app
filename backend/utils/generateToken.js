import jwt from "jsonwebtoken";

/**
 * Generate a signed JWT token
 * @param {string} id - User MongoDB ObjectId
 * @param {string} role - User role (customer / admin)
 * @returns {string} Signed JWT token string
 */
export const generateToken = (id, role = "customer") => {
  const secret = process.env.JWT_SECRET || "voltride_development_jwt_secret_key_2026";
  return jwt.sign({ id, role }, secret, {
    expiresIn: "30d",
  });
};

export default generateToken;
