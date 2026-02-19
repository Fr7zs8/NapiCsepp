/// <reference types="cypress" />

describe("Activities végpontok tesztelése", () => {
  it("HAbitok lekérése helyesen", () => {
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
