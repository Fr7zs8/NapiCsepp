/// <reference types="cypress" />

describe("Testing Type endpoints", () => {
  beforeEach(() => {
    cy.task("resetDb");
  });
  let token: string;

  before(() => {
    cy.login("abcd@gmail.com", "1234").then((t) => {
      token = t;
    });
  });

  it("GET - /napicsepp/types - 200 - Returns all types", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/types",
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.greaterThan(0);

      expect(res.body[0]).to.have.property("type_id");
      expect(res.body[0]).to.have.property("type_name");
    });
  });
});
