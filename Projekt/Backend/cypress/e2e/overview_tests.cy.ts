/// <reference types="cypress" />

describe("Testing overview endpoints", () => {
  beforeEach(() => {
    cy.task("resetDb");
  });
  let token: string;

  before(() => {
    cy.login().then((t) => {
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
    cy.loginWithEmptyUser().then((emptyToken) => {
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
});
