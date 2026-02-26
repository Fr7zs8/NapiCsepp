/// <reference types="cypress" />

describe("Testing difficulty endpoints", () => {
  beforeEach(() => {
    cy.task("resetDb");
  });
  let token: string;

  before(() => {
    cy.login().then((t) => {
      token = t;
    });
  });

  it("GET - /napicsepp/difficulties - 200 - Returns all difficulties", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/difficulties",
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.greaterThan(0);

      expect(res.body[0]).to.have.property("difficulty_id");
      expect(res.body[0]).to.have.property("difficulty_name");
    });
  });
});
