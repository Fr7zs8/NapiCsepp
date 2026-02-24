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

  it("GET - /napicsepp/activities - 200 - Correct retrieval of tasks", () => {
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

  it("GET - /napicsepp/activities - 404 - user has no activities", () => {
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

  it("GET - /napicsepp/activities/habits - 404 - Correct retrieval of habits", () => {
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

  it("GET - /napicsepp/activities/habits - 404 - user has no activities", () => {
    cy.loginWithEmptyUser().then((token) => {
      cy.request({
        method: "GET",
        url: "/napicsepp/activities/habits",
        headers: { "x-access-token": token },
        failOnStatusCode: false,
      }).then((resp) => {
        expect(resp.status).to.eq(404);
        expect(resp.body.message).to.contain("habit");
      });
    });
  });

  it("POST - /napicsepp/activities - 201 - Successfully uploads a new activity", () => {
    cy.request({
      method: "GET",
      url: `napicsepp/activities`,
      headers: {
        "x-access-token": `${token}`,
      },
    }).then((res) => {
      const originalCount = res.body.length;

      cy.request({
        method: "POST",
        url: `napicsepp/activities`,
        body: {
          activity_name: "Mosogatás",
          activity_type_name: "Házimunka",
          activity_difficulty_name: "Könnyű",
          activity_start_date: "2026-02-24",
          activity_end_date: "2026-02-24",
          progress_counter: 0,
          activity_achive: 0,
        },
        headers: {
          "Content-Type": "application/json",
          "x-access-token": `${token}`,
        },
      }).then((postRes) => {
        expect(postRes.status).to.eq(201);
        expect(postRes.body).to.eq("Sikeres adatrögzítés!");

        cy.request({
          method: "GET",
          url: `napicsepp/activities`,
          headers: {
            "x-access-token": `${token}`,
          },
        }).then((res2) => {
          const newCount = res2.body.length;
          expect(newCount).to.eq(originalCount + 1);
        });
      });
    });
  });

  it("POST - /napicsepp/activities - Fails with invalid userId", () => {
    cy.request({
      method: "POST",
      url: `/napicsepp/activities`,
      headers: {
        "Content-Type": "application/json",
        "x-access-token": "invalid_token",
      },
      body: {
        activity_name: "Takarítás",
        activity_type_name: "Házimunka",
        activity_difficulty_name: "Könnyű",
        activity_start_date: "2026-02-24",
        activity_end_date: "2026-02-24",
        progress_counter: 0,
        activity_achive: 0,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body).to.eq("Az auth nem sikerült!");
    });
  });

  it("POST - /napicsepp/activities - Fails with missing type", () => {
    cy.request({
      method: "POST",
      url: `/napicsepp/activities`,
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `${token}`,
      },
      body: {
        activity_name: "Takarítás",
        activity_type_name: "Nem létező típus",
        activity_difficulty_name: "Könnyű",
        activity_start_date: "2026-02-24",
        activity_end_date: "2026-02-24",
        progress_counter: 0,
        activity_achive: 0,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq("Nincs ilyen típus");
    });
  });

  it("POST - /napicsepp/activities - Fails with missing difficulty", () => {
    cy.request({
      method: "POST",
      url: `/napicsepp/activities`,
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `${token}`,
      },
      body: {
        activity_name: "Takarítás",
        activity_type_name: "Házimunka",
        activity_difficulty_name: "Nem létező nehézség",
        activity_start_date: "2026-02-24",
        activity_end_date: "2026-02-24",
        progress_counter: 0,
        activity_achive: 0,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq("Nincs ilyen nehézség");
    });
  });

  // it("Fails with missing activity data", () => {
  //   cy.request({
  //     method: "POST",
  //     url: `/napicsepp/activities`,
  //     headers: {
  //       "Content-Type": "application/json",
  //       "x-access-token": `${token}`,
  //     },
  //     failOnStatusCode: false,
  //   }).then((res) => {
  //     expect(res.status).to.eq(404);
  //     expect(res.body).to.eq("Hiányzó activity adat.");
  //   });
  // });

  // it("Fails with too long activity name", () => {
  //   const longName = "a".repeat(300);
  //   cy.request({
  //     method: "POST",
  //     url: `/napicsepp/activities`,
  //     headers: {
  //       "Content-Type": "application/json",
  //       "x-access-token": `${token}`,
  //     },
  //     body: {
  //       activity_name: longName,
  //       activity_type_name: "Házimunka",
  //       activity_difficulty_name: "Nem létező nehézség",
  //       activity_start_date: "2026-02-24",
  //       activity_end_date: "2026-02-24",
  //       progress_counter: 0,
  //       activity_achive: 0,
  //     },
  //     failOnStatusCode: false,
  //   }).then((res) => {
  //     expect(res.status).to.eq(404);
  //   });
  // });

  // it("Fails with negative progress_counter", () => {
  //   cy.request({
  //     method: "POST",
  //     url: `/napicsepp/activities`,
  //     headers: {
  //       "Content-Type": "application/json",
  //       "x-access-token": `${token}`,
  //     },
  //     body: {
  //       activity_name: "Takarítás",
  //       activity_type_name: "Házimunka",
  //       activity_difficulty_name: "Nem létező nehézség",
  //       activity_start_date: "2026-02-24",
  //       activity_end_date: "2026-02-24",
  //       progress_counter: 0,
  //       activity_achive: -1,
  //     },
  //     failOnStatusCode: false,
  //   }).then((res) => {
  //     expect(res.status).to.eq(404);
  //   });
  // });

  // it("Fails if start_date > end_date", () => {
  //   cy.request({
  //     method: "POST",
  //     url: `/napicsepp/activities`,
  //     headers: {
  //       "Content-Type": "application/json",
  //       "x-access-token": `${token}`,
  //     },
  //     body: {
  //       activity_name: "Takarítás",
  //       activity_type_name: "Házimunka",
  //       activity_difficulty_name: "Nem létező nehézség",
  //       activity_start_date: "2026-02-24",
  //       activity_end_date: "2026-02-23",
  //       progress_counter: 0,
  //       activity_achive: 0,
  //     },
  //     failOnStatusCode: false,
  //   }).then((res) => {
  //     expect(res.status).to.eq(404);
  //   });
  // });
});
