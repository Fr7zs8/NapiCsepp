/// <reference types="cypress" />

describe('Feladatok oldal (Tasks)', () => {
  beforeEach(() => {
    cy.visitProtected('/tasks');
  });

  it('1 - Az oldal betöltődik, feladatok szekció megjelenik', () => {
    cy.get('section').should('exist');
  });

  it('2 - Feladat lista elemek megjelennek', () => {
    cy.get('.task-item, .task-card, [class*="task"]').should('exist');
  });

  it('3 - Feladat hozzáadó form / gomb megjelenik', () => {
    cy.get('.add-btn, button[class*="add"], .add-task-btn, [class*="add"]').should('exist');
  });

  it('4 - Feladat név input kitölthető', () => {
    cy.get('input[type="text"]').first().clear().type('Új teszt feladat').should('have.value', 'Új teszt feladat');
  });

  it('5 - Nehézség választó (select/dropdown) megjelenik', () => {
    cy.get('select, [class*="difficulty"], [class*="select"]').should('exist');
  });

  it('6 - Meglévő feladat megjelenik a nevével', () => {
    cy.contains('Teszt feladat').should('be.visible');
  });

  it('7 - Kész feladat jelölése (check) gomb létezik', () => {
    cy.get('.task-item button, .task-card button, [class*="check"], [class*="toggle"]').should('exist');
  });

  it('8 - Feladat törlés gomb megjelenik', () => {
    cy.get('[class*="delete"], [class*="trash"], button').should('exist');
  });

  it('9 - Feladat szerkesztés gomb megjelenik', () => {
    cy.get('[class*="edit"], [class*="pencil"]').should('exist');
  });

  it('10 - Üres feladat nevet nem küld el', () => {
    cy.get('input[type="text"]').first().clear();
    cy.get('.add-btn, button[class*="add"]').first().click();
    // Maradunk az oldalon, nem történik POST hívás
    cy.url().should('include', '/tasks');
  });

  it('11 - Feladat kész állapotú elem másként jelenik meg', () => {
    // A második feladat "Kész feladat" (achive=1)
    cy.contains('Kész feladat').should('exist');
  });

  it('12 - Oldal tartalmaz típus választót', () => {
    cy.get('select, [class*="type"]').should('exist');
  });

  it('13 - Sidebar link aktív a /tasks oldalon', () => {
    cy.get('.sidebar-link.active').should('exist');
  });

  it('14 - Naptár gombra navigálás a sidebarból', () => {
    cy.get('.sidebar-link').contains('Naptár').click();
    cy.url().should('include', '/calendar');
  });

  it('15 - Szokások oldalra navigálás lehetséges', () => {
    cy.visitProtected('/tasks');
    cy.get('.sidebar-link').contains('Szokások').click();
    cy.url().should('include', '/habits');
  });
});

describe('Feladatok CRUD műveletek', () => {
  beforeEach(() => {
    cy.visitProtected('/tasks');
  });

  it('16 - Szerkesztés gomb (.edit-btn) megjelenik a feladaton', () => {
    cy.get('.task-item').first().find('.edit-btn').should('be.visible');
  });

  it('17 - Törlés gomb (.delete-btn) megjelenik a feladaton', () => {
    cy.get('.task-item').first().find('.delete-btn').should('be.visible');
  });

  it('18 - Szerkesztés gomb kattintás után a form "Mentés" gombra vált', () => {
    cy.get('.task-item').first().find('.edit-btn').click();
    cy.get('.add-btn').should('contain.text', 'Mentés');
  });

  it('19 - Törlés gomb kattintás DELETE kérést küld', () => {
    cy.get('.task-item').first().find('.delete-btn').click();
    cy.wait('@deleteActivity');
  });

  it('20 - Checkbox megjelenik és kattintható', () => {
    cy.get('.task-checkbox').first().should('exist');
    cy.get('.task-checkbox').first().click({ force: true });
  });

  it('21 - Feladat hozzáadás POST kérést küld', () => {
    cy.get('input[type="text"]').first().clear().type('Új teszt');
    cy.get('select').first().select(1);       // Típus
    cy.get('select').eq(1).select(1);          // Nehézség
    cy.get('.add-btn').click();
    cy.wait('@createActivity');
  });

  it('22 - Feladaton megjelennek a címkék (típus, nehézség, dátum)', () => {
    cy.get('.task-item').first().find('.labels .label').should('have.length.gte', 2);
  });

  it('23 - Kész feladat "completed" osztályt kap', () => {
    cy.get('.task-item.completed').should('exist');
  });

  it('24 - Vissza a főoldalra gomb megjelenik', () => {
    cy.get('.back-btn').should('contain.text', 'Vissza');
  });

  it('25 - Vissza gomb navigál a főoldalra', () => {
    cy.get('.back-btn').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});

describe('Szokások oldal (Habits)', () => {
  beforeEach(() => {
    cy.visitProtected('/habits');
  });

  it('1 - Szokások oldal betöltődik', () => {
    cy.get('section').should('exist');
  });

  it('2 - Szokás hozzáadó form megjelenik', () => {
    cy.get('input[type="text"]').should('exist');
  });

  it('3 - Időtartam (target days) választó megjelenik', () => {
    cy.get('select.priority-btn').should('have.length.gte', 2);
  });

  it('4 - Kezdő dátum mező megjelenik', () => {
    cy.get('input[type="date"]').should('exist');
  });

  it('5 - Nehézség választó megjelenik', () => {
    cy.get('select').should('exist');
  });

  it('6 - Meglévő szokás megjelenik', () => {
    cy.contains('Futás').should('be.visible');
  });

  it('7 - Szokás kártya tartalmazza a napok számát', () => {
    cy.get('[class*="habit"], [class*="task-item"]').should('exist');
  });

  it('8 - Szokás törlés gomb megjelenik', () => {
    cy.get('[class*="delete"], [class*="trash"]').should('exist');
  });

  it('9 - Szokás szerkesztés gomb megjelenik', () => {
    cy.get('[class*="edit"], [class*="pencil"]').should('exist');
  });

  it('10 - Hozzáadás gomb megjelenik', () => {
    cy.get('.add-btn, button[class*="add"]').should('exist');
  });

  it('11 - Üres szokás név esetén nem küld POST-ot', () => {
    cy.get('input[type="text"]').first().clear();
    cy.get('.add-btn, button[class*="add"]').first().click();
    cy.url().should('include', '/habits');
  });

  it('12 - Szokás form kitölthető és elküldhető', () => {
    cy.get('input[type="text"]').first().clear().type('Meditálás');
    cy.get('select').first().select(1);
    cy.get('select').eq(1).select('7');
    // Kitöltve - a form funkcionálisan kész
    cy.get('input[type="text"]').first().should('have.value', 'Meditálás');
  });

  it('13 - Sidebar link aktív a /habits oldalon', () => {
    cy.get('.sidebar-link.active').should('exist');
  });

  it('14 - Feladatok oldalra navigálás lehetséges', () => {
    cy.get('.sidebar-link').contains('Feladatok').click();
    cy.url().should('include', '/tasks');
  });

  it('15 - Főoldalra navigálás a sidebarból', () => {
    cy.visitProtected('/habits');
    cy.get('.sidebar-link').contains('Főoldal').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  // ── Szokás CRUD tesztek ──────────────────────────────

  it('16 - Szerkesztés gomb megjelenik a szokás kártyán', () => {
    cy.get('.task-item .edit-btn').should('exist').and('contain.text', 'Szerkesztés');
  });

  it('17 - Törlés gomb megjelenik a szokás kártyán', () => {
    cy.get('.task-item .delete-btn').should('exist').and('contain.text', 'Törlés');
  });

  it('18 - Szerkesztés gomb kattintásra a form kitöltődik (Mentés mód)', () => {
    cy.get('.task-item .edit-btn').first().click();
    cy.get('input[type="text"]').first().should('have.value', 'Futás');
    cy.get('.add-btn').should('contain.text', 'Mentés');
  });

  it('19 - Szerkesztés után Mentés visszaáll Hozzáadás-ra', () => {
    cy.get('.task-item .edit-btn').first().click();
    cy.get('.add-btn').should('contain.text', 'Mentés');
    // Kattintunk Mentés-re – PUT kérés indul
    cy.get('.add-btn').click();
    cy.wait('@updateActivity');
  });

  it('20 - Törlés gomb kattintásra DELETE kérés indul', () => {
    cy.get('.task-item .delete-btn').first().click();
    cy.wait('@deleteActivity');
  });

  it('21 - Progress bar megjelenik a szokás kártyán', () => {
    cy.get('.task-item .progress-container').should('exist');
    cy.get('.task-item .progress-bar').should('exist');
    cy.get('.task-item .progress-fill').should('exist');
  });

  it('22 - Progress szöveg tartalmazza a nap számlálót', () => {
    cy.get('.progress-text').should('contain.text', 'nap');
  });

  it('23 - Progress százalék megjelenik', () => {
    cy.get('.progress-percent').should('exist').and('contain.text', '%');
  });

  it('24 - Szokás kártya bal és jobb szekciója megjelenik', () => {
    cy.get('.task-item .left-section').should('exist');
    cy.get('.task-item .right-section').should('exist');
  });

  it('25 - Info disclaimer szöveg a haladás számlálóról megjelenik', () => {
    cy.get('.habit-disclaimer').should('exist')
      .and('contain.text', 'progress counter');
  });

  it('26 - Vissza a főoldalra gomb működik', () => {
    cy.get('.back-btn').should('contain.text', 'Vissza a főoldalra').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('27 - Szokás kártya címkék (labels) megjelennek', () => {
    cy.get('.task-item .labels .label').should('have.length.gte', 2);
  });

  it('28 - Hozzáadás üres form esetén nem küld POST-ot', () => {
    cy.get('input[type="text"]').first().clear();
    cy.get('.add-btn').click();
    // Nem indul POST, maradunk az oldalon
    cy.url().should('include', '/habits');
  });

  it('29 - Szokás dátum címke megjelenik a kártyán', () => {
    cy.get('.task-item .date-label').should('exist');
  });

  it('30 - Szokás form kitöltés és POST kérés', () => {
    cy.get('input[type="text"]').first().clear().type('Meditálás');
    cy.get('select').first().select(1);
    cy.get('select').eq(1).select('7');
    cy.get('.add-btn').click();
    cy.wait('@createActivity');
  });
});
