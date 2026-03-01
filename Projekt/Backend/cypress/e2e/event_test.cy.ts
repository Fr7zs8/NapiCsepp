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

  it("DELETE - /napicsepp/event/:id - 200 - Successfully deletes event", () => {
    // 🔹 1. Először hozzunk létre egy eventet
    cy.request({
      method: "POST",
      url: "/napicsepp/event",
      headers: { "x-access-token": `${token}` },
      body: {
        event_name: "Delete Test Event",
        event_start_time: "2026-02-26 10:00:00",
        event_end_time: "2026-02-26 12:00:00",
      },
    }).then(() => {
      // 🔹 2. Lekérjük az eventeket, hogy megkapjuk az id-t
      cy.request({
        method: "GET",
        url: "/napicsepp/events",
        headers: { "x-access-token": `${token}` },
      }).then((getRes) => {
        const createdEvent = getRes.body.find(
          (e: any) => e.event_name === "Delete Test Event",
        );

        expect(createdEvent).to.exist;

        // 🔹 3. Törlés
        cy.request({
          method: "DELETE",
          url: `/napicsepp/event/${createdEvent.event_id}`,
          headers: { "x-access-token": `${token}` },
        }).then((deleteRes) => {
          expect(deleteRes.status).to.eq(200);
          expect(deleteRes.body).to.eq("Sikeres törlés.");
        });
      });
    });
  });

  it("DELETE - /napicsepp/event/:id - 404 - Event not found", () => {
    cy.request({
      method: "DELETE",
      url: "/napicsepp/event/999999",
      headers: { "x-access-token": `${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq("Nem volt változtatás.");
    });
  });

  it("DELETE - /napicsepp/event/id - 400 - Invalid ID type", () => {
    cy.request({
      method: "DELETE",
      url: "/napicsepp/event/abc",
      headers: { "x-access-token": `${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq("Nem megfelelő az id tipusa!");
    });
  });

  it("PUT - /napicsepp/event/:id - 200 - Successfully updates event", () => {
    // 1️⃣ Létrehozunk egy eventet
    cy.request({
      method: "POST",
      url: "/napicsepp/event",
      headers: { "x-access-token": `${token}` },
      body: {
        event_name: "Update Test Event",
        event_start_time: "2026-02-26 10:00:00",
        event_end_time: "2026-02-26 12:00:00",
      },
    }).then(() => {
      // 2️⃣ Lekérjük az ID-t
      cy.request({
        method: "GET",
        url: "/napicsepp/events",
        headers: { "x-access-token": `${token}` },
      }).then((getRes) => {
        const createdEvent = getRes.body.find(
          (e: any) => e.event_name === "Update Test Event",
        );

        expect(createdEvent).to.exist;

        // 3️⃣ Módosítás
        cy.request({
          method: "PUT",
          url: `/napicsepp/event/${createdEvent.event_id}`,
          headers: { "x-access-token": `${token}` },
          body: {
            event_name: "Updated Event Name",
          },
        }).then((putRes) => {
          expect(putRes.status).to.eq(200);
          expect(putRes.body).to.eq("Sikeres módosítás!");
        });
      });
    });
  });

  it("PUT - /napicsepp/event/:id - 400 - Invalid ID format", () => {
    cy.request({
      method: "PUT",
      url: "/napicsepp/event/abc",
      headers: { "x-access-token": `${token}` },
      body: { event_name: "Test" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq("Hibás formátumú azonosító!");
    });
  });

  it("PUT - /napicsepp/event/:id - 400 - Empty body", () => {
    cy.request({
      method: "PUT",
      url: "/napicsepp/event/1",
      headers: { "x-access-token": `${token}` },
      body: {},
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq("Nem küldte el az adatokat megfelelően!");
    });
  });

  it("PUT - /napicsepp/event/:id - 404 - Event not found", () => {
    cy.request({
      method: "PUT",
      url: "/napicsepp/event/999999",
      headers: { "x-access-token": `${token}` },
      body: { event_name: "Does not exist" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq(
        "Nincs frissítendő mező vagy nem található az esemény!",
      );
    });
  });
});
