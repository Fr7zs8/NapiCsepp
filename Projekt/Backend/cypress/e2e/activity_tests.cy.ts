/// <reference types="cypress" />

describe("Testing Activity endpoints", () => {
  it("Correct retrieval of tasks", () => {
    cy.login().then((token) => {
      cy.request({
        method: "GET",
        url: "/napicsepp/activities",
        headers: {
          "x-access-token": `${token}`,
        },
      }).then((resp) => {
        expect(resp.status).to.eq(200);
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
    });
  });

  it("Correct retrieval of habits", () => {
    cy.login().then((token) => {
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
  });
});
