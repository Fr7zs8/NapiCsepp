/// <reference types="cypress" />

describe("Testing Statistic endpoints", () => {
  beforeEach(() => {
    cy.task("resetDb");
  });

  let moderatorToken: string;
  let userToken: string;

  before(() => {
    cy.login("dcba@gmail.com", "jelszo").then((t) => {
      moderatorToken = t;
    });

    cy.login("abcd@gmail.com", "1234").then((t) => {
      userToken = t;
    });
  });
    it("GET - 200 - Returns system statistics for moderator", () => {
      cy.request({
        method: "GET",
        url: "/napicsepp/system-stats",
        headers: {
          "x-access-token": moderatorToken,
        },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("array");
      });
    });

    it("GET - 405 - Returns error if user is not moderator", () => {
      cy.request({
        method: "GET",
        url: "/napicsepp/system-stats",
        headers: {
          "x-access-token": userToken,
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(405);
        expect(res.body.message).to.eq("Csak a moderátor kérheti le!");
      });
    });

  it("GET - 200 - Returns user profile statistics", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/stats",
      headers: {
        "x-access-token": userToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      
    });
  });

  it("GET - 200 - Returns error if user has no statistics", () => {
    cy.login("emptytest@gmail.com", "1234").then((token) => {
      cy.request({
        method: "GET",
        url: "/napicsepp/stats",
        headers: { "x-access-token": token },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("array");
      });
    });
  });

  it("GET - 200 - Moderator can retrieve another user's profile statistics", () => {
    cy.request({
      method: "GET",
      url: `/napicsepp/stats/3`,
      headers: {
        "x-access-token": moderatorToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      
    });
  });

  it("GET - 403 - Regular user cannot retrieve another user's statistics", () => {
    cy.request({
      method: "GET",
      url: `/napicsepp/stats/1`,
      headers: {
        "x-access-token": userToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body.message).to.eq("Csak moderátor vagy admin kérheti le!");
    });
  });

  
  });