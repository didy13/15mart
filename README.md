# 15mart

Ovo je jednostavna web aplikacija koja omogućava korisnicima da zakazuju termine, a administratorima da upravljaju uslugama i pregledaju sva zakazivanja.

## Funkcionalnosti

Aplikacija se sastoji iz tri glavna dela:

### 1. Glavna strana - Dashboard
- Pregled svih zakazanih termina
- Jasno označavanje da li je termin **proknjižen** (plaćen) ili ne
- Filtriranje i pretraga termina
- Pregled detalja o svakom terminu (ime klijenta, usluga, datum, vreme, cena...)

### 2. Strana sa uslugama
- Lista svih dostupnih usluga za zakazivanje
- Pregled cena i trajanja usluga
- Jednostavan prikaz za korisnike prilikom zakazivanja

### 3. Strana za majstore
- Lista svih dostupnih majstora
- Mogućnost brisanja i dodavanja novih majstora
- Pregled imena, struke i slike

### 4. Strana za rezervaciju
- Forma za dodavanje nove rezervacije
- Mogućnost biranja majstora, usluge i datuma
- Sve rezervacije se mogu videti na Dashboard-u

## Tehnologije

- **Frontend:** React, HTML, CSS
- **Backend:** Node.js, JavaScript
- **Baza podataka:** MySQL

## Instalacija

1. Kloniraj repozitorijum:
   ```bash
    git clone https://github.com/didy13/15mart.git

2. Pripremi za rad:
    ```bash
    npm run ready

3. Pokreni aplikaciju:
    ```bash
    npm run mart
