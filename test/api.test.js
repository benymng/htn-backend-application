const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index.js');
chai.use(chaiHttp);
const should = chai.should();

describe("API Endpoints", () => {
    // Test for GET /
    it("GET / should return 'Hello World!'", async () => {
        const res = await chai.request(app).get('/');
        res.should.have.status(200);
        res.text.should.be.eql('Hello World!');
    });

    // Test for GET /users
    it("GET /users should get all users", async () => {
        const res = await chai.request(app).get('/users');
        res.should.have.status(200);
        res.body.should.be.a('array');
    });

    // Test for POST /new-user
    it("POST /new-user should create a new user", async () => {
        const user = {
            name: "Test User",
            email: "test@example.com",
            skills: [{ skill: "JavaScript", rating: 5 }]
        };
        const res = await chai.request(app).post('/new-user').send(user);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('name').eql('Test User');
    });
});
