# NapiCsepp Projekt

Egy Docker konténerben futtatható full-stack alkalmazás (frontend + backend + adatbázis).

---

## 🚀 Gyors indítás (Dockerrel)

### 1. Előfeltételek

A futtatáshoz szükséges:

- Docker Desktop (legújabb stabil verzió)
- Git

> Megjegyzés: Node.js csak lokális fejlesztéshez kell, Docker használatakor nem szükséges.

---

### 2. Projekt letöltése

```bash
git clone https://github.com/Fr7zs8/NapiCsepp.git
cd NapiCsepp/Projekt
```

---

### 3. Alkalmazás indítása

```bash
docker compose up --build
```

- Az első indítás több percet is igénybe vehet.
- A Docker automatikusan letölti és felépíti a szükséges konténereket.

---

### 4. Elérhető szolgáltatások

Sikeres indítás után:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/napicsepp
- MySQL adatbázis: localhost:3306

---

### 5. Alkalmazás leállítása

```bash
docker compose down
```

---

## Tesztelés

### Backend egységtesztek (Jest)

```bash
npm run test
```

---

### E2E tesztek (Cypress)

Az alkalmazásnak futnia kell Dockerrel!

#### Headless mód:

```bash
npx cypress run
```

#### Interaktív mód (ajánlott fejlesztéshez):

```bash
npx cypress open
```

---

## Fejlesztői megjegyzések

- A Docker biztosítja az egységes fejlesztői környezetet
- Nem szükséges külön adatbázis vagy backend konfiguráció
- A frontend automatikusan újratölt fejlesztés közben

---

## Készítők

Evbuomwan Abigél Osaretin és Sipos Fruzsina
