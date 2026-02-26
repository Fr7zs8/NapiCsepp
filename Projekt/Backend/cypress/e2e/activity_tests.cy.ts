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

  it("GET - /napicsepp/activities - 403 - Returns error when token is missing", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/activities",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body).to.eq("Token szükséges");
    });
  });

  it("GET - /napicsepp/activities - 401 - Returns error when token is invalid", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/activities",
      headers: {
        "x-access-token": "invalid_token",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body).to.eq("Az auth nem sikerült!");
    });
  });

  it("GET - /napicsepp/activities - 401 - Returns error when token is corrupted", () => {
    const corruptedToken = token.slice(0, -5) + "abcde";

    cy.request({
      method: "GET",
      url: "/napicsepp/activities",
      headers: {
        "x-access-token": corruptedToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
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

  it("GET - /napicsepp/activities/habits - 403 - Returns error when token is missing", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/activities/habits",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body).to.eq("Token szükséges");
    });
  });

  it("GET - /napicsepp/activities/habits - 401 - Returns error when token is invalid", () => {
    cy.request({
      method: "GET",
      url: "/napicsepp/activities/habits",
      headers: {
        "x-access-token": "invalid_token",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body).to.eq("Az auth nem sikerült!");
    });
  });

  it("GET - /napicsepp/activities/habits - 401 - Returns error when token is corrupted", () => {
    const corruptedToken = token.slice(0, -6) + "xxxxxx";

    cy.request({
      method: "GET",
      url: "/napicsepp/activities/habits",
      headers: {
        "x-access-token": corruptedToken,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
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

  it("DELETE - /napicsepp/activities/:id - 200 - Successfully deletes an existing activity", () => {
    cy.request({
      method: "POST",
      url: `/napicsepp/activities`,
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `${token}`,
      },
      body: {
        activity_name: "Delete Test Activity",
        activity_type_name: "Házimunka",
        activity_difficulty_name: "Könnyű",
        activity_start_date: "2026-02-24",
        activity_end_date: "2026-02-24",
        progress_counter: 0,
        activity_achive: 0,
      },
    }).then(() => {
      cy.request({
        method: "GET",
        url: `/napicsepp/activities`,
        headers: {
          "x-access-token": `${token}`,
        },
      }).then((getRes) => {
        const createdActivity = getRes.body.find(
          (a: any) => a.activity_name === "Delete Test Activity",
        );

        expect(createdActivity).to.exist;

        cy.request({
          method: "DELETE",
          url: `/napicsepp/activities/${createdActivity.activity_id}`,
          headers: {
            "x-access-token": `${token}`,
          },
        }).then((deleteRes) => {
          expect(deleteRes.status).to.eq(200);
          expect(deleteRes.body).to.eq("Sikeres törlés.");
        });
      });
    });
  });

  it("DELETE - /napicsepp/activities/:id - 404 - Returns error when activity does not exist", () => {
    cy.request({
      method: "DELETE",
      url: `/napicsepp/activities/999999`,
      headers: {
        "x-access-token": `${token}`,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq("Az activity nem található.");
    });
  });

  it("DELETE - /napicsepp/activities/:id - 400 - Returns error for invalid (non-numeric) ID", () => {
    cy.request({
      method: "DELETE",
      url: `/napicsepp/activities/abc`,
      headers: {
        "x-access-token": `${token}`,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq("Nem megfelelő az activity ID.");
    });
  });

  it("DELETE - /napicsepp/activities/:id - 400 - Returns error for null ID", () => {
    cy.request({
      method: "DELETE",
      url: `/napicsepp/activities/null`,
      headers: {
        "x-access-token": `${token}`,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq("Nem megfelelő az activity ID.");
    });
  });

  it("DELETE - /napicsepp/activities/:id - 401 - Returns error when token is invalid", () => {
    cy.request({
      method: "DELETE",
      url: `/napicsepp/activities/1`,
      headers: {
        "x-access-token": `invalid_token`,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body).to.eq("Az auth nem sikerült!");
    });
  });

  it("DELETE - /napicsepp/activities/:id - 404 - Returns error for negative ID", () => {
    cy.request({
      method: "DELETE",
      url: `/napicsepp/activities/-1`,
      headers: {
        "x-access-token": `${token}`,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 404]);
    });
  });

  it("PUT - /napicsepp/activities/:id - 200 - Successfully updates an existing activity", () => {
    cy.request({
      method: "POST",
      url: `/napicsepp/activities`,
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `${token}`,
      },
      body: {
        activity_name: "Update Test Activity",
        activity_type_name: "Házimunka",
        activity_difficulty_name: "Könnyű",
        activity_start_date: "2026-02-24",
        activity_end_date: "2026-02-24",
        progress_counter: 0,
        activity_achive: 0,
      },
    }).then(() => {
      cy.request({
        method: "GET",
        url: `/napicsepp/activities`,
        headers: {
          "x-access-token": `${token}`,
        },
      }).then((getRes) => {
        const activity = getRes.body.find(
          (a: any) => a.activity_name === "Update Test Activity",
        );

        cy.request({
          method: "PUT",
          url: `/napicsepp/activities/${activity.activity_id}`,
          headers: {
            "Content-Type": "application/json",
            "x-access-token": `${token}`,
          },
          body: {
            activity_name: "Updated Activity Name",
            progress_counter: 5,
          },
        }).then((putRes) => {
          expect(putRes.status).to.eq(200);
          expect(putRes.body).to.eq("Sikeres módosítás!");
        });
      });
    });
  });

  it("PUT - /napicsepp/activities/:id - 400 - Returns error for invalid (non-numeric) ID", () => {
    cy.request({
      method: "PUT",
      url: `/napicsepp/activities/abc`,
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `${token}`,
      },
      body: { activity_name: "Test" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq("Nem megfelelő az activity ID.");
    });
  });

  it("PUT - /napicsepp/activities/:id - 400 - Returns error when no update data is provided", () => {
    cy.request({
      method: "PUT",
      url: `/napicsepp/activities/1`,
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `${token}`,
      },
      body: {},
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq("Nincs módosítandó adat.");
    });
  });

  it("PUT - /napicsepp/activities/:id - 404 - Returns error when activity does not exist", () => {
    cy.request({
      method: "PUT",
      url: `/napicsepp/activities/999999`,
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `${token}`,
      },
      body: {
        activity_name: "Does not matter",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq("Nincs ilyen activity!");
    });
  });

  it("PUT - /napicsepp/activities/:id - 404 - Returns error when activity type does not exist", () => {
    cy.request({
      method: "PUT",
      url: `/napicsepp/activities/1`,
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `${token}`,
      },
      body: {
        activity_type_name: "NonExistingType",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  it("PUT - /napicsepp/activities/:id - 404 - Returns error when difficulty does not exist", () => {
    cy.request({
      method: "PUT",
      url: `/napicsepp/activities/1`,
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `${token}`,
      },
      body: {
        activity_difficulty_name: "NonExistingDifficulty",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  it("PUT - /napicsepp/activities/:id - 401 - Returns error when token is invalid", () => {
    cy.request({
      method: "PUT",
      url: `/napicsepp/activities/1`,
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `invalid_token`,
      },
      body: {
        activity_name: "Unauthorized update",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body).to.eq("Az auth nem sikerült!");
    });
  });
});
