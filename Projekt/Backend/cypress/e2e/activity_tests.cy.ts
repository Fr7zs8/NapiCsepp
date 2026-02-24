/// <reference types="cypress" />

describe("Testing Activity endpoints", () => {
  beforeEach(() => {
    cy.task("resetDb");
  });
  let token: string;

  before(() => {
    cy.login().then((t) => {
      token = t;
    });
  });

  it("Correct retrieval of tasks", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/activities",
      headers: {
        "x-access-token": `${token}`,
      },
    }).then((resp) => {
      expect(resp.status).to.eq(200);
      expect(resp.body).to.be.an("array");
      expect(resp.body.length).to.be.greaterThan(0);
      expect(resp.body[0]).to.have.property("activity_id");
      expect(resp.body[0]).to.have.property("activity_name");
      expect(resp.body[0]).to.have.property("type_name");
      expect(resp.body[0]).to.have.property("difficulty_name");
      expect(resp.body[0]).to.have.property("activity_achive");
      expect(resp.body[0]).to.have.property("activity_start_date");
      expect(resp.body[0]).to.have.property("activity_end_date");
      expect(resp.body[0]).to.have.property("progress_counter");
    });
  });

  it("404 - user has no activities", () => {
    cy.loginWithEmptyUser().then((token) => {
      cy.request({
        method: "GET",
        url: "/napicsepp/activities",
        headers: { "x-access-token": token },
        failOnStatusCode: false,
      }).then((resp) => {
        expect(resp.status).to.eq(404);
        expect(resp.body.message).to.contain("activity");
      });
    });
  });

  it("Correct retrieval of tasks with no token", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/activities",
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.eq(403);
      expect(resp.body).to.not.be.an("array");
    });
  });

  it("Correct retrieval of habits", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/activities/habits",
      headers: {
        "x-access-token": `${token}`,
      },
    }).then((resp) => {
      expect(resp.status).to.eq(200);
    });
  });

  it("Correct retrieval of habitsvwith no token", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/activities/habits",
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.eq(403);
    });
  });
});
