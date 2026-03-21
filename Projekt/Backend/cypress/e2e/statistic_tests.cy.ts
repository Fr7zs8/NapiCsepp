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

    cy.login("emptytest@gmail.com", "1234").then((t) => {
      userToken = t;
    });
  });
  it("GET- /napicsepp/system-stats - 200 - Returns system statistics for moderator", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/system-stats",
      headers: {
        "x-access-token": moderatorToken,
      },
    }).then((res) => {
      expect(res.body[0]).to.have.property("total_users");
      expect(res.body[0]).to.have.property("total_activity_today");
      expect(res.body[0]).to.have.property("total_activity");
      expect(res.body[0]).to.have.property("total_habits");
    });
  });

  it("GET - /napicsepp/system-stats - 405 - Returns error if user is not moderator", () => {
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

  it("GET - /napicsepp/system-stats - 403 - Returns error when token is missing", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/system-stats",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body).to.eq("Token szükséges");
    });
  });

  it("GET - /napicsepp/system-stats - 401 - Returns error when token is invalid", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/system-stats",
      headers: {
        "x-access-token": "invalid_token",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body).to.eq("Az auth nem sikerült!");
    });
  });

  it("GET - /napicsepp/stats - 200 - Returns user profile statistics", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/stats",
      headers: {
        "x-access-token": userToken,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      expect(res.body[0]).to.have.property("total_activity");
      expect(res.body[0]).to.have.property("completed");
      expect(res.body[0]).to.have.property("daily_tasks_count");
      expect(res.body[0]).to.have.property("monthly_events_count");
      expect(res.body[0]).to.have.property("hard_tasks");
      expect(res.body[0]).to.have.property("middle_tasks");
      expect(res.body[0]).to.have.property("easy_tasks");
      expect(res.body[0]).to.have.property("weekly_tasks");
      expect(res.body[0]).to.have.property("weekly_tasks_completed");
    });
  });

  it("GET- /napicsepp/stats - 200 - Returns error if user has no statistics", () => {
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

  it("GET - /napicsepp/system-stats - 403 - Returns error when token is missing", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/stats",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body).to.eq("Token szükséges");
    });
  });

  it("GET - /napicsepp/system-stats - 401 - Returns error when token is invalid", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/stats",
      headers: {
        "x-access-token": "invalid_token",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body).to.eq("Az auth nem sikerült!");
    });
  });

  it("GET - /napicsepp/stats/:id - 200 - Moderator can retrieve another user's profile statistics", () => {
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

  it("GET - /napicsepp/stats/:id - 403 - Regular user cannot retrieve another user's statistics", () => {
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
