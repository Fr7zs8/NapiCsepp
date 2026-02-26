/// <reference types="cypress" />

// ═══════════════════════════════════════════════════════════
// Admin oldal – Felhasználókezelés (AdminView)
// ═══════════════════════════════════════════════════════════

describe('Admin oldal – Jogosultság ellenőrzés', () => {
  it('1 - Nem admin felhasználó nem fér hozzá', () => {
    cy.visitProtected('/admin');
    cy.contains('Hozzáférés megtagadva').should('be.visible');
  });

  it('2 - Vissza a főoldalra gomb megjelenik jogosulatlan esetben', () => {
    cy.visitProtected('/admin');
    cy.get('.back-btn').should('contain.text', 'Vissza a főoldalra');
  });

  it('3 - Vissza gomb navigál a főoldalra', () => {
    cy.visitProtected('/admin');
    cy.get('.back-btn').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});

describe('Admin oldal – Felhasználókezelés (admin jogosultság)', () => {
  beforeEach(() => {
    cy.visitProtectedAsAdmin('/admin');
  });

  // ── Alap megjelenés ──────────────────────────────────

  it('4 - Admin oldal betöltődik', () => {
    cy.get('.admin-view').should('be.visible');
  });

  it('5 - Fejléc "Felhasználókezelés" szöveget mutat', () => {
    cy.get('.admin-header h1').should('contain.text', 'Felhasználókezelés');
  });

  it('6 - Alcím megjelenik', () => {
    cy.get('.admin-subtitle').should('contain.text', 'Felhasználók kezelése');
  });

  // ── Statisztikai kártyák ──────────────────────────────

  it('7 - Négy statisztikai kártya megjelenik', () => {
    cy.get('.admin-stats-grid .admin-stat-card').should('have.length', 4);
  });

  it('8 - Összes felhasználó szám helyes (4 mock user)', () => {
    cy.get('.admin-stat-card.stat-total .stat-number').should('contain.text', '4');
  });

  it('9 - Admin szám helyes (1)', () => {
    cy.get('.admin-stat-card.stat-admin .stat-number').should('contain.text', '1');
  });

  it('10 - Moderátor szám helyes (1)', () => {
    cy.get('.admin-stat-card.stat-moderator .stat-number').should('contain.text', '1');
  });

  it('11 - Felhasználó szám helyes (2)', () => {
    cy.get('.admin-stat-card.stat-user .stat-number').should('contain.text', '2');
  });

  // ── Keresés és szűrés ──────────────────────────────────

  it('12 - Keresőmező megjelenik', () => {
    cy.get('.admin-search-input').should('exist');
  });

  it('13 - Keresés név alapján szűr', () => {
    cy.get('.admin-search-input').type('John');
    cy.get('.admin-table tbody .user-row').should('have.length', 1);
    cy.get('.admin-table tbody').should('contain.text', 'JohnDoe');
  });

  it('14 - Keresés email alapján szűr', () => {
    cy.get('.admin-search-input').type('mod@');
    cy.get('.admin-table tbody .user-row').should('have.length', 1);
    cy.get('.admin-table tbody').should('contain.text', 'ModUser');
  });

  it('15 - Üres keresés "Nincs találat" üzenetet mutat', () => {
    cy.get('.admin-search-input').type('neminletezo12345');
    cy.get('.admin-table tbody').should('contain.text', 'Nincs találat');
  });

  it('16 - Szerepkör szűrő megjelenik', () => {
    cy.get('.admin-filter-select').should('exist');
  });

  it('17 - Admin szűrő csak admint mutat', () => {
    cy.get('.admin-filter-select').select('admin');
    cy.get('.admin-table tbody .user-row').should('have.length', 1);
    cy.get('.admin-table tbody').should('contain.text', 'TestUser');
  });

  it('18 - User szűrő 2 felhasználót mutat', () => {
    cy.get('.admin-filter-select').select('user');
    cy.get('.admin-table tbody .user-row').should('have.length', 2);
  });

  // ── Táblázat ──────────────────────────────────────────

  it('19 - Felhasználó táblázat megjelenik', () => {
    cy.get('.admin-table').should('be.visible');
  });

  it('20 - Táblázat fejléc 5 oszloppal', () => {
    cy.get('.admin-table thead th').should('have.length', 5);
  });

  it('21 - Felhasználónevek megjelennek a táblázatban', () => {
    cy.get('.admin-table tbody').should('contain.text', 'TestUser');
    cy.get('.admin-table tbody').should('contain.text', 'ModUser');
    cy.get('.admin-table tbody').should('contain.text', 'NormalUser');
  });

  it('22 - Email címek megjelennek', () => {
    cy.get('.admin-table tbody').should('contain.text', 'test@test.hu');
    cy.get('.admin-table tbody').should('contain.text', 'mod@test.hu');
  });

  it('23 - Szerepkör badge-ek megjelennek', () => {
    cy.get('.role-badge').should('have.length.gte', 1);
  });

  it('24 - Felhasználó avatar megjelenik (első betű)', () => {
    cy.get('.user-avatar').first().should('contain.text', 'T');
  });

  // ── Műveletek ─────────────────────────────────────────

  it('25 - Szerkesztés gomb megjelenik minden sorban', () => {
    cy.get('.admin-table .edit-btn').should('have.length.gte', 1);
  });

  it('26 - Törlés gomb megjelenik minden sorban', () => {
    cy.get('.admin-table .delete-btn').should('have.length.gte', 1);
  });

  // ── Szerkesztés popup ─────────────────────────────────

  it('27 - Szerkesztés gomb kattintás popupot nyit', () => {
    cy.get('.admin-table .edit-btn').first().click();
    cy.get('.admin-popup-overlay').should('be.visible');
    cy.get('.admin-popup').should('be.visible');
  });

  it('28 - Szerkesztés popup fejléc helyes', () => {
    cy.get('.admin-table .edit-btn').first().click();
    cy.get('.popup-header h2').should('contain.text', 'Felhasználó szerkesztése');
  });

  it('29 - Szerkesztés popup felhasználónév mező kitöltve', () => {
    cy.get('.admin-table .edit-btn').first().click();
    cy.get('.popup-form input[type="text"]').should('not.have.value', '');
  });

  it('30 - Szerkesztés popup email mező kitöltve', () => {
    cy.get('.admin-table .edit-btn').first().click();
    cy.get('.popup-form input[type="email"]').should('not.have.value', '');
  });

  it('31 - Szerkesztés popup szerepkör választó megjelenik', () => {
    cy.get('.admin-table .edit-btn').first().click();
    cy.get('.popup-form select').should('exist');
  });

  it('32 - Szerkesztés popup Mégse gomb bezárja', () => {
    cy.get('.admin-table .edit-btn').first().click();
    cy.get('.popup-cancel-btn').click();
    cy.get('.admin-popup-overlay').should('not.exist');
  });

  it('33 - Szerkesztés popup X gomb bezárja', () => {
    cy.get('.admin-table .edit-btn').first().click();
    cy.get('.popup-close-btn').click();
    cy.get('.admin-popup-overlay').should('not.exist');
  });

  it('34 - Szerkesztés popup overlay kattintás bezárja', () => {
    cy.get('.admin-table .edit-btn').first().click();
    cy.get('.admin-popup-overlay').click({ force: true });
    cy.get('.admin-popup').should('not.exist');
  });

  it('35 - Szerkesztés popup Mentés gomb PUT kérést küld', () => {
    cy.get('.admin-table .edit-btn').first().click();
    cy.get('.popup-save-btn').click();
    cy.wait('@updateProfile');
  });

  // ── Törlés popup ──────────────────────────────────────

  it('36 - Törlés gomb kattintás törlés popupot nyit', () => {
    cy.get('.admin-table .delete-btn').first().click();
    cy.get('.admin-popup-overlay').should('be.visible');
    cy.get('.delete-popup').should('be.visible');
  });

  it('37 - Törlés popup fejléc helyes', () => {
    cy.get('.admin-table .delete-btn').first().click();
    cy.get('.delete-header h2').should('contain.text', 'Felhasználó törlése');
  });

  it('38 - Törlés popup figyelmeztetés megjelenik', () => {
    cy.get('.admin-table .delete-btn').first().click();
    cy.get('.delete-body').should('contain.text', 'Biztosan törölni');
    cy.get('.delete-subtext').should('contain.text', 'nem vonható vissza');
  });

  it('39 - Törlés popup Mégse gomb bezárja', () => {
    cy.get('.admin-table .delete-btn').first().click();
    cy.get('.popup-cancel-btn').click();
    cy.get('.admin-popup-overlay').should('not.exist');
  });

  it('40 - Törlés popup megerősítés DELETE kérést küld', () => {
    cy.get('.admin-table .delete-btn').first().click();
    cy.get('.popup-delete-confirm-btn').click();
    cy.wait('@deleteUser');
  });

  // ── Lapozás ───────────────────────────────────────────

  it('41 - Lapozás szekció megjelenik', () => {
    cy.get('.admin-pagination').should('be.visible');
  });

  it('42 - Sorok oldalanként választó megjelenik', () => {
    cy.get('.rows-select').should('exist');
  });

  it('43 - Lapozás darabszám információ megjelenik', () => {
    cy.get('.pagination-count').should('contain.text', 'felhasználóból');
  });

  it('44 - Lapozás gombok megjelennek', () => {
    cy.get('.pagination-controls .page-btn').should('have.length.gte', 3);
  });

  // ── Sor kattintás → User stats ────────────────────────

  it('45 - Felhasználó sorra kattintás a user stats oldalra navigál', () => {
    cy.get('.user-row').first().click();
    cy.url().should('include', '/admin/user/');
  });
});

// ═══════════════════════════════════════════════════════════
// Admin – Felhasználó statisztikák (UserStatsView)
// ═══════════════════════════════════════════════════════════

describe('Admin – Felhasználó statisztikák oldal', () => {
  beforeEach(() => {
    cy.visitProtectedAsAdmin('/admin/user/1');
  });

  it('46 - User stats oldal betöltődik', () => {
    cy.get('.admin-view').should('be.visible');
  });

  it('47 - Vissza gomb megjelenik', () => {
    cy.get('.back-btn').should('contain.text', 'Vissza');
  });

  it('48 - Vissza gomb navigál az admin oldalra', () => {
    cy.get('.back-btn').click();
    cy.url().should('include', '/admin');
  });

  it('49 - Felhasználó profil kártya megjelenik', () => {
    cy.get('.user-profile-card').should('be.visible');
  });

  it('50 - Felhasználó neve megjelenik', () => {
    cy.get('.user-profile-card h1').should('contain.text', 'TestUser');
  });

  it('51 - Email megjelenik', () => {
    cy.get('.user-profile-card').should('contain.text', 'test@test.hu');
  });

  it('52 - Szerepkör badge megjelenik', () => {
    cy.get('.user-profile-card .role-badge').should('exist');
  });

  it('53 - Avatar első betűt mutat', () => {
    cy.get('.user-profile-avatar-large').should('contain.text', 'T');
  });

  it('54 - Négy statisztikai kártya megjelenik', () => {
    cy.get('.user-stats-grid .user-stat-card').should('have.length', 4);
  });

  it('55 - Összes tevékenység szám megjelenik', () => {
    cy.get('.user-stat-card.card-total .user-stat-number').should('contain.text', '10');
  });

  it('56 - Teljesített szám megjelenik', () => {
    cy.get('.user-stat-card.card-completed .user-stat-number').should('contain.text', '6');
  });

  it('57 - Teljesítési arányok szekció megjelenik', () => {
    cy.contains('Teljesítési arányok').should('be.visible');
  });

  it('58 - Progress bar megjelenik', () => {
    cy.get('.progress-bar-track').should('exist');
    cy.get('.progress-bar-fill').should('exist');
  });

  it('59 - Napi és heti teljesítés százalék megjelenik', () => {
    cy.get('.completion-percent').should('have.length', 2);
  });

  it('60 - Nehézségi eloszlás szekció megjelenik', () => {
    cy.contains('Nehézségi eloszlás').should('be.visible');
    cy.get('.difficulty-grid .difficulty-card').should('have.length', 3);
  });

  it('61 - Könnyű nehézség szám helyes', () => {
    cy.get('.diff-easy .diff-count').should('contain.text', '3');
  });

  it('62 - Közepes nehézség szám helyes', () => {
    cy.get('.diff-medium .diff-count').should('contain.text', '5');
  });

  it('63 - Nehéz nehézség szám helyes', () => {
    cy.get('.diff-hard .diff-count').should('contain.text', '2');
  });

  it('64 - Heti összesítés szekció megjelenik', () => {
    cy.contains('Heti összesítés').should('be.visible');
    cy.get('.weekly-summary .weekly-item').should('have.length', 3);
  });

  it('65 - Heti arány százalék megjelenik', () => {
    cy.get('.weekly-summary').should('contain.text', '%');
  });
});
