# Hack the North Backend Challenge README

Hosted API: [Hack the North Backend Challenge](https://htn-backend-challenge.benjaminng.ca/).

## Overview

This application is designed with MongoDB, Express, Node, and PineconeDB to address the challenges of managing users and skills, with an additional focus on group formation and management during the hackathon. 

## Getting Started

To begin interacting with the API, follow these steps:

- **Accessing the API:**
  - The easiest way to begin exploring the endpoints is to use the above Vercel link! This will direct you to the project's README page which from there, you can easily navigate to various endpoints, such as /users, by altering the URL. This particular endpoint retrieves all user data from the pre-populated mock database.
  - If you want to run locally, from within the repository you can also use `npm start` to start the server with Nodemon on your localhost.

- **Running Unit Tests:**
  - The project includes a some basic unit tests for functionality verification using Chai.js and Mocha. To run these tests:
    1. Clone the repository to your local machine.
    2. In the project directory, install the necessary dependencies by executing `npm install` in your terminal.
    3. Run the tests by executing `npm test`. This will initiate the test suite, allowing you to verify that the API operates as expected.


## Group Formation Explanation

One of the challenges that I wanted to tackle in my API is the problem of finding compatible team members in hackathons, particularly for newcomers who may have limited skillsets and want to work with others that have similar skills as them. This was the inspiration for the development of a system that facilitates the formation of groups based on similarities in skills and interests! By leveraging a vector database, this system significantly improves the efficiency of matching participants. Although currently focused on finding teammates for the hackathon, this feature is easily extendible to matching mentors, sponsors and friends. 🙂

### Group Formation Steps:

1. **Vector Representation**

   - Each user's skills are represented as a high-dimensional vector. This vector is a numerical representation of the user's skills, where each dimension corresponds to a specific skill (1 means that the user has that skill and 0 means that the user does not).

2. **Insertion into Pinecone**

   - When a new user is added via the `/new-user` endpoint, their skills vector is inserted into Pinecone which stores their user ID and a vector (like [0, 1, 1, 0, ...]). The assumption for this is that there are a set number of skills which we deem as key metrics to match users together. This is done using Pinecone's `upsert` method, which either inserts a new vector or updates an existing one.

3. **Similarity Search**

   - When a new group is to be formed, a similarity search using the Euclidean distance is performed in Pinecone to find users with similar skills. This is done using Pinecone's `query` method, which returns the IDs of the most similar vectors in the database.

4. **Group Formation**
   - The users corresponding to the most similar vectors are grouped together. This is done in the `/groups/create-group` endpoint, which creates a new group with the given users.

## Design Choices

One of the decisions I had to make when designing the API was how to separate the skills from the users. Originally, I had the skills as part of the user model but I ultimately decided to create a separate model for the flexibility of querying the skills. This was eventually helpful with the group formation portion of the project because I was able to query the number of skills and form the vector accordingly. Additionally, by creating a separate table for the skills, additional metrics are able to be tracked such as the number of users with certain skills. In the context of a hackathon, I thought that this would be helpful for event planning and narrowing down what workshops would be most relevant to the participants!

Another design choice I made was to use MongoDB instead of a traditional SQL database and using REST instead of GraphQL. The database decision was primarily influenced by the flexibility and development speed that MongoDB provides. For a hackathon backend I thought that this was the best decision because of the constantly evolving data requirements, importance of streamlined development process and because the data requirement is limited to a relatively small size (number of entries is limited by the number of attendees). This thought process was also the reason why I decided against using a GraphQL backend, as I didn't deem the number of user properties to be enough to require efficient data retrieval for specific properties.


## File Structure

- **`index.js`**: Main application entry point. Initializes the Express server and MongoDB connection.
- **`scripts/addUsers.js`**: Script to add users from a JSON file to the database via the `/new-user` endpoint.
- **`models/`**:
  - `user.js`: Defines the User and Skill Mongoose schema.
  - `group.js`: Defines the Group Mongoose schema.
- **`config/key.js`**: Contains the MongoDB connection string.
- **`data.json`**: Mock User data in JSON format.
- **`vercel.json`**: Configuration for Vercel deployment.
- **`routes/`**:
  - `users.js`: Routes for user-related operations.
  - `groups.js`: Routes for group-related operations.
  - `skills.js`: Routes for skill-related operations.
- **`test/api.test.js`**: API endpoint tests.

## API Endpoints

### Users

- **GET `/users`**: Fetch all users, sorted by creation date (descending).
- **GET `/users/id/:id`**: Fetch a user by ID.
- **GET `/users/username/:username`**: Fetch a user by username.
- **GET `/users/insert/:id`**: Insert a user based on their ID into the vector database.
- **GET `/users/insertAll`**: Insert all users into the vector database.
- **DEL `/users/:id`**: Delete a user by ID.
- **PUT `/users/:id`**: Update a user by ID.
- **POST `/new-user`**: Add a new user.

### Groups

- **GET `/groups/`**: Fetch all groups.
- **GET `/groups/:id`**: Fetch a group by ID.
- **GET `/groups/:groupName`**: Fetch a group by their group name.
- **GET `/groups/groupIndividual/:id`**: Create a group for a particular user.
- **GET `/groups/group-ungrouped-users`**: Create groups for all users that don't have a group yet.
- **GET `/groups/ungrouped-users`**: Fetch all users that don't have a group yet.
- **POST `/groups`**: Create a new group.

### Skills

- **GET `/skills`**: Fetch all skills, with optional filtering by frequency.
- **GET `/skills/count/:skill`**: Fetch the number of users with a specific skill.

## Environment Variables

- **`DB_URI_PASSWORD`**: MongoDB database password.
- **`PORT`**: The port that the server is running on.
- **`PINECONE_API_KEY`**: The API key for PineconeDB.


