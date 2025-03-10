import express from "express";
import getUsers from "../../controllers/user.controller";

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
 *           description: The user's name. with min lengh of 2 and max lenght of 100
 *           minLength: 2
 *           maxLength: 100
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address.
 *         phone:
 *           type: string
 *           description: The user's phone number.
 *           minLength: 10
 *           maxLength: 10
 *         language:
 *           type: string
 *           description: The user's language preference.
 *       required:
 *         - _id
 *         - name
 *         - email
 *         - phone
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
 *                 phone: "1234567890"
 *                 language: "Chinese"
 *               - _id: "67c034fbc183306ee4d05161"
 *                 name: "Dior Mou"
 *                 email: "DiorMou@outlook.com"
 *                 phone: "12312131231231131321"
 *                 language: "English"
 *       500:
 *         description: Internal server error.
 */
router.get("/users", getUsers);

export default router;
