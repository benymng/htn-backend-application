# Hack the North Backend Challenge README

## Overview

In this application, I am using MongoDB, Express, Node and PineconeDB. In addition to the key functionality outlined in the challenge description for managing users and skills, I have created matching endpoints to handle group formationd during the hackathon.

## Group Formation Explanation
One of the most common challenges especially for new hackers is the difficulty in finding a group of other students with similar interests, skills and skill level. Oftentimes, hackers are randomly assigned to other students and each of them want to utilize different tech stacks or have disparate interests. As a result, large compromises often must be made by one or more of the members in a team. Although this is an inevitable problem with all group projects, my goal was to find a better way to create groups which minimizes discrepencies between the skills between hackers. For the sake of demonstrating the functionality, I have done the matching based on the skills provided in the mock data provided, however, these same endpoints can easily be extended to include the interests, skill level and other key metrics for matching students. By leveraging a vector database, the matching of students is done drastically more efficiently than a traditional database and allows for a better matching of students based on their similarity. Moreover, the vector database can easily be extended to match mentors, friends or sponsors to students which would undoubtably improve the overall hackathon experience!

### Steps:
1. **Vector Representation**
   - Each user's skills are represented as a high-dimensional vector. This vector is a numerical representation of the user's skills, where each dimension corresponds to a specific skill (1 means that the user has that skill and 0 means that the user does not).

2. **Insertion into Pinecone**
   - When a new user is added via the `/new-user` endpoint, their skills vector is inserted into Pinecone. This is done using Pinecone's `upsert` method, which either inserts a new vector or updates an existing one.

3. **Similarity Search**
   - When a new group is to be formed, a similarity search using the Euclidean distance is performed in Pinecone to find users with similar skills. This is done using Pinecone's `query` method, which returns the IDs of the most similar vectors in the database.

4. **Group Formation**
   - The users corresponding to the most similar vectors are grouped together. This is done in the `/groups/create-group` endpoint, which creates a new group with the given users.


## File Structure

- **`index.js`**: Main application entry point. Initializes the Express server and MongoDB connection.
- **`addUsers.js`**: Script to add users from a JSON file to the database via the `/new-user` endpoint.
- **`models/`**:
  - `user.js`: Defines the User and Skill Mongoose schema.
  - `group.js`: Defines the Group Mongoose schema.
- **`config/key.js`**: Contains the MongoDB connection string.
- **`data.json`**: User data in JSON format.
- **`vercel.json`**: Configuration for Vercel deployment.
- **`routes/`**:
  - `users.js`: Routes for user-related operations.
  - `groups.js`: Routes for group-related operations.
  - `skills.js`: Routes for skill-related operations.
- **`test/api.test.js`**: API endpoint tests.

## API Endpoints

### Users

- **GET `/users`**: Fetch all users, sorted by creation date (descending).
- **GET `/user/id/:id`**: Fetch a user by ID.
- **GET `/user/username/:username`**: Fetch a user by username.
- **PUT `/user/:id`**: Update a user by ID.
- **POST `/new-user`**: Add a new user.

### Groups

- **POST `/groups`**: Create a new group.
- **GET `/groups/:id`**: Fetch a group by ID.

### Skills

- **GET `/skills`**: Fetch all skills, with optional filtering by frequency.
- **GET `/num-users-with-skill/:skill`**: Fetch the number of users with a specific skill.

## Environment Variables

- **`DB_URI_PASSWORD`**: MongoDB database password.
