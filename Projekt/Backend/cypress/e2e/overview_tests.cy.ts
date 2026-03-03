/// <reference types="cypress" />

describe("Testing overview endpoints", () => {
  beforeEach(() => {
    cy.task("resetDb");
  });
  let token: string;

  before(() => {
    cy.login("abcd@gmail.com", "1234").then((t) => {
      token = t;
    });
  });

  it("GET - /napicsepp/overview - 200 - Returns overview data", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/overview",
      headers: { "x-access-token": `${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.greaterThan(0);
    });
  });

  it("GET - /napicsepp/overview - 200 - Returns empty array for user with no data", () => {
    cy.login("emptytest@gmail.com", "1234").then((emptyToken) => {
      cy.request({
        method: "GET",
        url: "/napicsepp/overview",
        headers: {
          "x-access-token": emptyToken,
        },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.eq(0);
      });
    });
  });

  it("GET - /napicsepp/overview - 403 - Returns error when token is missing", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/overview",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body).to.eq("Token szükséges");
    });
  });

  it("GET - /napicsepp/overview - 401 - Returns error when token is invalid", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/overview",
      headers: {
        "x-access-token": "invalid_token",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body).to.eq("Az auth nem sikerült!");
    });
  });
});
