const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index.js");
chai.use(chaiHttp);
const should = chai.should();

describe("API Endpoints", () => {
  // Test for GET /
  it("GET / should return the README", async () => {
    const res = await chai.request(app).get("/");
    res.should.have.status(200);
  });

  // Test for GET /users
  it("GET /users should get all users", async () => {
    const res = await chai.request(app).get("/users");
    res.should.have.status(200);
    res.body.should.be.a("array");
  });

  // Test for POST /new-user
  it("POST /new-user should create a new user", async () => {
    const user = {
      name: "Test User",
      email: "test@example.com",
      skills: [{ skill: "JavaScript", rating: 5 }],
    };
    const res = await chai.request(app).post("/users/new-user").send(user);
    res.should.have.status(200);
    res.body.should.be.a("object");
    res.body.should.have.property("name").eql("Test User");
  });

  // Test for GET /users/:id
  it("GET /users/id/:id should get a specific user", async () => {
    const id = "65d11500d9b1a62b5393efd6";
    const res = await chai.request(app).get(`/users/id/${id}`);
    res.should.have.status(200);
    res.body.should.be.a("object");
    res.body.should.have.property("_id").eql(id);
  });

  // Test for PUT /users/:id
  it("PUT /users/id/:id should update a specific user", async () => {
    const id = "65d11500d9b1a62b5393efd6";
    const user = {
      name: "Updated User",
      email: "updated@example.com",
      skills: [{ skill: "Python", rating: 5 }],
    };
    const res = await chai.request(app).put(`/users/id/${id}`).send(user);
    res.should.have.status(200);
    res.body.should.be.a("object");
    res.body.should.have.property("name").eql("Updated User");
  });
});
