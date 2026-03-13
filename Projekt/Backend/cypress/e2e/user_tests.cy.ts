/// <reference types="cypress" />

describe("Testing User endpoints", () => {
  beforeEach(() => {
    cy.task("resetDb");
  });

  let adminToken: string;
  let moderatorToken: string;
  let userToken: string;

  before(() => {
    cy.login("admin@gmail.com", "admin123").then((t) => {
      adminToken = t;
    });

    cy.login("dcba@gmail.com", "jelszo").then((t) => {
      moderatorToken = t;
    });

    cy.login("abcd@gmail.com", "1234").then((t) => {
      userToken = t;
    });
  });

  it("POST - /login - 200 - Successful login", () => {
    cy.request({
      method: "POST",
      url: "/napicsepp/login",
      body: { email: "abcd@gmail.com", password: "1234" },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("token");
    });
  });

  it("POST - /login - 401 - Wrong credentials", () => {
    cy.request({
      method: "POST",
      url: "/napicsepp/login",
      body: { email: "abcd@gmail.com", password: "wrongpass" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body.message).to.eq("Rossz az email vagy a jelszó");
    });
  });

  it("GET - /profile - 200 - Returns user info", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/profile",
      headers: { "x-access-token": userToken },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body[0]).to.have.property("user_id");
      expect(res.body[0]).to.have.property("username");
      expect(res.body[0]).to.have.property("email");
      expect(res.body[0]).to.have.property("language");
      expect(res.body[0]).to.have.property("role");
      expect(res.body[0]).to.have.property("register_date");
    });
  });

  it("GET - /users - 200 - Moderator/Admin can get all users", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/users",
      headers: { "x-access-token": moderatorToken },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      expect(res.body[0]).to.have.property("user_id");
      expect(res.body[0]).to.have.property("username");
      expect(res.body[0]).to.have.property("email");
      expect(res.body[0]).to.have.property("language");
      expect(res.body[0]).to.have.property("role");
      expect(res.body[0]).to.have.property("register_date");
    });
  });

  it("GET - /users - 403 - Regular user cannot get all users", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/users",
      headers: { "x-access-token": userToken },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body.message).to.eq("Csak a moderátor kérheti le!");
    });
  });

  it("POST - /regisztrate - 201 - Successfully register a new user", () => {
    const newUser = {
      username: "NewUser",
      email: "newuser@gmail.com",
      password: "12345",
      language: "hu",
    };

    cy.request({
      method: "POST",
      url: "/napicsepp/regisztrate",
      body: newUser,
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.eq("Sikeres adatrögzítés!");
    });
  });

  it("POST - /regisztrate - 409 - Duplicate email", () => {
    cy.request({
      method: "POST",
      url: "/napicsepp/regisztrate",
      body: {
        username: "User2",
        email: "abcd@gmail.com",
        password: "12345",
        language: "hu",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(409);
      expect(res.body.message).to.eq("Az email cím már használatban van");
    });
  });

  it("GET - /moderators - 200 - Admin can retrieve moderators", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/moderators",
      headers: { "x-access-token": adminToken },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      expect(res.body[0]).to.have.property("user_id");
      expect(res.body[0]).to.have.property("username");
      expect(res.body[0]).to.have.property("email");
      expect(res.body[0]).to.have.property("language");
      expect(res.body[0]).to.have.property("role");
      expect(res.body[0]).to.have.property("register_date");
    });
  });

  it("GET - /moderators - 403 - Non-admin cannot retrieve moderators", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/moderators",
      headers: { "x-access-token": moderatorToken },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body.message).to.eq("Csak az admin kérheti le.");
    });
  });

  it("PUT - /users/:id - 200 - Admin can update user", () => {
    const updatedData = {
      username: "updatedUser",
      language: "en",
      role: "moderator",
    };

    cy.request({
      method: "PUT",
      url: "/napicsepp/users/3",
      headers: { "x-access-token": adminToken },
      body: updatedData,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.eq("Sikeres modositás!");
    });
  });

  it("PUT - /users/:id - 200 - Moderator can update user", () => {
    const updatedData = {
      language: "hu",
    };

    cy.request({
      method: "PUT",
      url: "/napicsepp/users/3",
      headers: { "x-access-token": moderatorToken },
      body: updatedData,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.eq("Sikeres modositás!");
    });
  });

  it("PUT - /users/:id - 403 - Regular user cannot update user", () => {
    cy.request({
      method: "PUT",
      url: "/napicsepp/users/3",
      headers: { "x-access-token": userToken },
      body: { username: "hack" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body.message).to.eq("Nincs jogosultságod szerkeszteni!");
    });
  });

  it("PUT - /users/:id - 400 - No data to update", () => {
    cy.request({
      method: "PUT",
      url: "/napicsepp/users/3",
      headers: { "x-access-token": adminToken },
      body: {},
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq("Nincs frissítendő adat!");
    });
  });

  it("PUT - /users/:id - 404 - User does not exist", () => {
    cy.request({
      method: "PUT",
      url: "/napicsepp/users/999999",
      headers: { "x-access-token": adminToken },
      body: { username: "valami" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq("Nincs ilyen user!");
    });
  });

  it("DELETE - /users/:id - 404 - Returns error if user does not exist", () => {
    cy.request({
      method: "DELETE",
      url: "/napicsepp/users/999999",
      headers: { "x-access-token": moderatorToken },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq("Az user nem található.");
    });
  });

  it("DELETE - /users/:id - 200 - Moderator can delete user", () => {
    const newUser = {
      username: "deleteMe",
      email: "deleteme@gmail.com",
      password: "12346",
      language: "hu",
    };

    cy.request("POST", "/napicsepp/regisztrate", newUser).then(() => {
      cy.request({
        method: "DELETE",
        url: "/napicsepp/users/4",
        headers: { "x-access-token": moderatorToken },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.eq("Sikeres törlés.");
      });
    });
  });
});
