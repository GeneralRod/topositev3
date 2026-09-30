# Supabase (accounts)

Project `topografiewereld` (id `xjzapefnqfmwudchwvhl`, Frankfurt, gratis plan). Het moet
gratis blijven.

- `migrations/`: de database (tabel `progress`, één rij voortgang per account).
- `templates/`: Nederlandse teksten voor de mails die Supabase verstuurt.

## Instellingen in het Supabase-dashboard

Deze stappen doet de eigenaar zelf op [supabase.com/dashboard](https://supabase.com/dashboard),
project `topografiewereld`.

### 1. Adressen van de site (Authentication → URL Configuration)

Zonder dit sturen de links in de mails je naar een verkeerd adres.

- **Site URL:** `https://topografiewereld.netlify.app`
- **Redirect URLs** (elk apart toevoegen):
  - `https://topografiewereld.netlify.app/**`
  - `https://deploy-preview-*--topografiewereld.netlify.app/**`
  - `http://localhost:5173/**`

### 2. Mails versturen (Authentication → Emails → SMTP Settings)

De ingebouwde mail van Supabase mailt alleen naar leden van je eigen Supabase-team, en maar een
paar per uur. Voor echte spelers is een gratis maildienst nodig, bijvoorbeeld Brevo (gratis tot
300 mails per dag):

1. Maak een gratis account op [brevo.com](https://www.brevo.com).
2. Voeg bij **Senders** het e-mailadres toe waar de mails vandaan komen en bevestig het.
3. Maak bij **SMTP & API → SMTP** een SMTP-sleutel.
4. Zet in Supabase **Enable custom SMTP** aan en vul in: host `smtp-relay.brevo.com`, poort
   `587`, gebruikersnaam en wachtwoord (de SMTP-sleutel) van Brevo, en als afzender het adres uit
   stap 2 met naam `Topografiewereld`.

Let op: mails vanaf een gewoon Gmail-adres komen soms bij ongewenste mail terecht. Een eigen
domein helpt daartegen, maar kost geld; dat kan later altijd nog.

### 3. Nederlandse mails (Authentication → Emails → Templates)

Kan pas na stap 2. Kopieer onderwerp en tekst uit `templates/`:

| Template in Supabase | Onderwerp                      | Bestand                      |
| -------------------- | ------------------------------ | ---------------------------- |
| Confirm signup       | Bevestig je account            | `templates/bevestigen.html`  |
| Reset password       | Kies een nieuw wachtwoord      | `templates/wachtwoord.html`  |
| Change email address | Bevestig je nieuwe e-mailadres | `templates/nieuw-email.html` |
