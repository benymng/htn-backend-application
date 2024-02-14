# htn-backend-application

## File Structure

- `index.js`: This is the main entry point for the application. It sets up the Express server, connects to the MongoDB database, and defines the API endpoints.
- `addUsers.js`: This script reads user data from a JSON file and sends POST requests to the `/new-user` endpoint to add each user to the database.
- `models/user.js`: This file defines the Mongoose schemas for the User and Skill models.
- `config/key.js`: This file exports the MongoDB connection string.
- `data.json`: This file contains user data in JSON format.
- `package.json`: This file lists the project dependencies and defines the `start` script.
- `vercel.json`: This file is used by Vercel for deployment configuration.

## API Endpoints

- `GET /users`: Returns a list of all users, sorted by creation date in descending order.
- `GET /user/id/:id`: Returns the user with the specified ID.
- `GET /user/username/:username`: Returns the user with the specified username.
- `PUT /user/:id`: Updates the user with the specified ID and returns the updated user.
- `POST /new-user`: Adds a new user and returns the added user.
- `GET /num-users-with-skill/:skill`: Returns the number of users with the specified skill.
- `GET /skills`: Returns a list of all skills, optionally filtered by minimum and maximum frequency.

## Environment Variables

- `DB_URI_PASSWORD`: The password for the MongoDB database.