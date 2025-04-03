import express from "express";
import {
  getUsers,
  registerController,
  loginController,
  verifyEmail,
  resendVerificationEmail,
  updateProfileController,
} from "../../controllers/user.controller";
import validateBody from "../../middlewares/validation/auth.validation";
import authValidationSchema from "../../validator/auth/authSchema";
import authMiddleware from "../../middlewares/JWT/auth.middleware";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The user id generated from MongoDB once the user is initialized.
 *         name:
 *           type: string
 *           description: The user's name with a minimum length of 3 and a maximum length of 50.
 *           minLength: 3
 *           maxLength: 50
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address.
 *         password:
 *           type: string
 *           minLength: 6
 *           maxLength: 30
 *           description: The user's password.
 *         language:
 *           type: string
 *           description: The user's language preference (e.g., "en", "zn", etc.).
 *         mobile:
 *           type: string
 *           description: The user's mobile number (optional).
 *         description:
 *           type: string
 *           description: User's personal description (optional).
 *       required:
 *         - _id
 *         - name
 *         - email
 *         - password
 *         - language
 *
 * /users:
 *   get:
 *     summary: Retrieve the users list
 *     description: Get a list of all users from the database.
 *     responses:
 *       200:
 *         description: This API will return a list of users fetched from the database.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *             example:
 *               - _id: "67c034fbc183306ee4d05163"
 *                 name: "Steven Ren"
 *                 email: "steven@gamil.com"
 *                 language: "en"
 *               - _id: "67c034fbc183306ee4d05161"
 *                 name: "Dior Mou"
 *                 email: "DiorMou@outlook.com"
 *                 language: "zn"
 *       500:
 *         description: Internal server error.
 *
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: User Registration
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - language
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address
 *               password:
 *                 type: string
 *                 description: The user's password
 *               mobile:
 *                 type: string
 *                 description: The user's mobile number (optional)
 *               language:
 *                 type: string
 *                 description: The user's language
 *               selfDescription:
 *                 type: string
 *                 description: The user's self-description (optional)
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message for registration
 *                   example: "Congratulation! Registration Success"
 *                 name:
 *                   type: string
 *                   description: The user's name
 *                   example: "stevenren"
 *       406:
 *         description: Not Acceptable - Invalid data format or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 406
 *                 message:
 *                   type: string
 *                   example: "Invalid email format"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Email must match a valid format", "Password length is not sufficient", "Mobile must match Australia standard"]
 *       409:
 *         description: Conflict - The email is already registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: "This email has already been registered"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Unexpected server issue."]
 *
 * /users/login:
 *   post:
 *     summary: User login
 *     description: This route corresponds to user login
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's registered email address
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: User login successfully with valid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Welcome Back"
 *                 token:
 *                   type: string
 *                   example: "your.jwt.token"
 *       401:
 *         description: User login with invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Invalid email or password."
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *       406:
 *         description: Not Acceptable - Invalid credential format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 406
 *                 message:
 *                   type: string
 *                   example: "Invalid email format"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Email must match a valid format", "Password in wrong format"]
 *
 * /users/update:
 *   patch:
 *     summary: Update user profile
 *     description: This endpoint allows users to update their profile information.
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's name (optional, must be unique)
 *                 minLength: 3
 *                 maxLength: 50
 *               language:
 *                 type: string
 *                 description: The user's language preference (required)
 *                 enum: [en, fr, es, de, zh, it, pt, ru, ja, ko, ar, hi, tr, pl, nl, sv, no, fi, da, cs, ro, el, th, id, ms]
 *               mobile:
 *                 type: string
 *                 description: The user's mobile number (optional, must follow Australian format)
 *                 pattern: "^(?:\\+61|0)4\\d{8}$"
 *               selfDescription:
 *                 type: string
 *                 description: The user's personal description (optional)
 *                 maxLength: 200
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     language:
 *                       type: string
 *                       example: "en"
 *                     mobile:
 *                       type: string
 *                       example: "+61412345678"
 *                     selfDescription:
 *                       type: string
 *                       example: "Software developer based in Sydney"
 *       400:
 *         description: Bad Request - Invalid or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Language field is required"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Language field is required"]
 *       401:
 *         description: Unauthorized - Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Authentication token is missing or invalid"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *       404:
 *         description: Not Found - User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Profile not found"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *       406:
 *         description: Not Acceptable - Invalid data format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 406
 *                 message:
 *                   type: string
 *                   example: "Invalid data format"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Mobile must match Australia standard", "Name must be at least 3 characters long"]
 *       409:
 *         description: Conflict - Username already taken
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: "Username already taken"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Unexpected server issue."]
 */

router.get("/users", getUsers);

router.post(
  "/users/register",
  validateBody(authValidationSchema.register),
  registerController
);

router.post(
  "/users/login",
  validateBody(authValidationSchema.login),
  loginController
);

router.get("/users/verify-email", verifyEmail);
router.post("/users/resend-verification", resendVerificationEmail);
router.patch(
  "/users/update",
  authMiddleware,
  validateBody(authValidationSchema.update),
  updateProfileController
);

export default router;
