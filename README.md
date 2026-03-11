# 15mart

Ovo je jednostavna web aplikacija koja omogućava korisnicima da zakazuju termine, a administratorima da upravljaju uslugama i pregledaju sva zakazivanja.

## Funkcionalnosti

Aplikacija se sastoji iz tri glavna dela:

### 1. Glavna strana (Pregled zakazivanja)
- Pregled svih zakazanih termina
- Jasno označavanje da li je termin **proknjižen** (plaćen) ili ne
- Filtriranje i pretraga termina
- Pregled detalja o svakom terminu (ime klijenta, usluga, datum, vreme, cena...)

### 2. Panel sa uslugama
- Lista svih dostupnih usluga za zakazivanje
- Pregled cena i trajanja usluga
- Jednostavan prikaz za korisnike prilikom zakazivanja

### 3. Admin panel (Upravljanje uslugama)
- Dodavanje novih usluga (naziv, cena, trajanje, opis)
- Izmena postojećih usluga
- Brisanje usluga
- Zaštićen pristup (samo za administratore)

## Tehnologije

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js
- **Baza podataka:** MySQL

## Instalacija

1. Kloniraj repozitorijum:
   ```bash
    git clone https://github.com/korisnik/zakazivanje-termina.git

2. Pripremi za rad:
    npm run ready

3. Pokreni aplikaciju:
    node server.js