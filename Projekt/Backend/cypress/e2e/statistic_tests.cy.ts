// /// <reference types="cypress" />

// describe("Testing Statistic endpoints", () => {
//   beforeEach(() => {
//     cy.task("resetDb");
//   });

//   let token: string;
//   let moderatorToken: string;
//   let userToken: string;

//   before(() => {
//     // moderator login
//     cy.login("moderator@test.com", "password").then((t) => {
//       moderatorToken = t;
//     });

//     // normal user login
//     cy.login("user@test.com", "password").then((t) => {
//       userToken = t;
//     });
//   });

//   describe("GET /systemStatistic", () => {

//     it("Should return 200 and statistics if user is moderator", () => {
//       cy.request({
//         method: "GET",
//         url: "/api/statistic/systemStatistic",
//         headers: {
//           Authorization: `Bearer ${moderatorToken}`,
//         },
//       }).then((res) => {
//         expect(res.status).to.eq(200);
//         expect(res.body).to.be.an("array");
//       });
//     });

//     it("Should return 405 if user is not moderator", () => {
//       cy.request({
//         method: "GET",
//         url: "/api/statistic/systemStatistic",
//         headers: {
//           Authorization: `Bearer ${userToken}`,
//         },
//         failOnStatusCode: false,
//       }).then((res) => {
//         expect(res.status).to.eq(405);
//         expect(res.body.message).to.eq("Csak a moderátor kérheti le!");
//       });
//     });

//     it("Should return 404 if no statistics found", () => {
//       // töröljük a statisztika adatokat
//       cy.task("clearStatistics");

//       cy.request({
//         method: "GET",
//         url: "/api/statistic/systemStatistic",
//         headers: {
//           Authorization: `Bearer ${moderatorToken}`,
//         },
//         failOnStatusCode: false,
//       }).then((res) => {
//         expect(res.status).to.eq(404);
//         expect(res.body.message).to.eq("Nincs egy db statisztika se.");
//       });
//     });

//     it("Should return 500 if database error occurs", () => {
//       // hibás stored procedure szimulálása
//       cy.task("dropSystemStatisticProcedure");

//       cy.request({
//         method: "GET",
//         url: "/api/statistic/systemStatistic",
//         headers: {
//           Authorization: `Bearer ${moderatorToken}`,
//         },
//         failOnStatusCode: false,
//       }).then((res) => {
//         expect(res.status).to.eq(500);
//         expect(res.body.message).to.eq(
//           "Hiba történt a lekérés során."
//         );
//       });
//     });

//   });
// });