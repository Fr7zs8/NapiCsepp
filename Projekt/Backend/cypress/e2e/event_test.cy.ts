/// <reference types="cypress" />

describe("Testing event endpoints", () => {
  beforeEach(() => {
    cy.task("resetDb");
  });
  let token: string;

  before(() => {
    cy.login().then((t) => {
      token = t;
    });
  });

  it("GET - /napicsepp/events - 200 - Returns events for authenticated user", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/events",
      headers: {
        "x-access-token": `${token}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");

      if (res.body.length > 0) {
        expect(res.body[0]).to.have.property("event_id");
        expect(res.body[0]).to.have.property("event_name");
        expect(res.body[0]).to.have.property("event_start_time");
        expect(res.body[0]).to.have.property("event_end_time");
      }
    });
  });

  it("GET - /napicsepp/events - 403 - Returns error when token is missing", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/events",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body).to.eq("Token szükséges");
    });
  });

  it("GET - /napicsepp/events - 401 - Returns error when token is invalid", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/events",
      headers: {
        "x-access-token": "invalid_token",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body).to.eq("Az auth nem sikerült!");
    });
  });

  it("GET - /napicsepp/events - 401 - Returns error when token is corrupted", () => {
    const corruptedToken = token.slice(0, -5) + "abcde";

    cy.request({
      method: "GET",
      url: "/napicsepp/events",
      headers: {
        "x-access-token": corruptedToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it("POST - /napicsepp/events - 200 - Successfully creates a new event", () => {
    cy.request({
      method: "POST",
      url: "/napicsepp/event",
      headers: { "x-access-token": `${token}` },
      body: {
        event_name: "Cypress Test Event",
        event_start_time: "2026-02-26 10:00:00",
        event_end_time: "2026-02-26 12:00:00",
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.eq("Sikeres adatrögzítés!");
    });
  });

  it("POST - /napicsepp/events - 400 - Fails when body data is missing", () => {
    cy.request({
      method: "POST",
      url: "/napicsepp/event",
      headers: { "x-access-token": `${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq("Hiányzó event adat.");
    });
  });
});
