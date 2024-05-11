const request = require("supertest");
const app = require("../server");

describe("Contact List API Endpoints", () => {
  it("should create a new contact", async () => {
    const res = await request(app).post("/contacts").send({
      name: "Biswa",
      phoneNumber: "123456",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toEqual(true);
    expect(res.body.data.name).toEqual("Biswa");
    expect(res.body.data.phoneNumber).toEqual("123456");
  });
});
