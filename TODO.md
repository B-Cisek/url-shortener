 Ocena ogólna

  Backend ma sensowną bazę dla małego MVP:

  - podział na controller/service/repository,
  - PostgreSQL jako trwałe źródło danych,
  - Redis,
  - walidację Zod,
  - centralny error handler,
  - logowanie Pino,
  - unikalność shortCode wymuszoną przez bazę,
  - graceful shutdown dla HTTP i Redis.

  Największy problem architektoniczny: Redis jest obecnie wykorzystywany jako krytyczny generator identyfikatorów, ale nie jako cache dla znacznie częstszego
  przepływu przekierowań.

  ## Najważniejsze Problemy

  ### 1. Produkcyjny build nie uruchamia się

  Build zachowuje aliasy @/, których Node.js nie potrafi rozwiązać:

  Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@/lib'

  Dotyczy między innymi apps/backend/src/modules/urls/services/url.service.ts:1.

  pnpm build przechodzi, ale pnpm --filter @url-shortener/backend start nie działa.

  Naprawa:

  - najprościej zamienić aliasy na importy względne,
  - albo użyć bundlera, np. tsup,
  - ewentualnie wykonywać po buildzie przepisywanie aliasów przez tsc-alias.

  To powinno być pierwszym zadaniem.

  ———

  ### 2. Redis counter może generować kolizje po utracie danych

  Tworzenie linku wygląda obecnie tak:

  Redis INCR -> Base62 -> INSERT PostgreSQL

  Implementacja znajduje się w apps/backend/src/modules/urls/services/url.service.ts:7.

  Jeżeli Redis straci licznik lub zostanie wyczyszczony:

  - INCR zacznie ponownie od 1,
  - aplikacja zacznie generować istniejące kody,
  - każde tworzenie URL-a będzie kończyć się błędem unikalności,
  - aplikacja nie ma mechanizmu synchronizacji countera z bazą.

  AOF zmniejsza ryzyko, ale domyślna synchronizacja nadal może utracić około sekundy zapisów.

  Rekomendacja dla obecnej skali: użyć sekwencji PostgreSQL jako źródła identyfikatorów.

  PostgreSQL nextval -> Base62 -> INSERT

  Sekwencja i dane pozostają wtedy w jednym systemie trwałości.

  Dla dużej skali: osobny Key Generation Service przydzielający aplikacjom zakresy identyfikatorów. Globalny Redis INCR na każde żądanie stanie się pojedynczym
  gorącym kluczem.

  ———

  ### 3. Redirect zawsze trafia do PostgreSQL

  apps/backend/src/modules/urls/controllers/url.controller.ts:28 bezpośrednio odpytuje repository.

  Typowy TinyURL ma znacznie więcej odczytów niż zapisów. Docelowy przepływ powinien wyglądać tak:

  GET /:code
    -> Redis GET url:{code}
    -> cache hit: redirect
    -> cache miss: PostgreSQL
    -> Redis SET z TTL
    -> redirect

  Warto również stosować krótki negative cache dla nieistniejących kodów, aby ograniczyć wielokrotne zapytania o losowe wartości.

  Redis powinien być cache, którego awaria obniża wydajność, ale nie wyłącza przekierowań.

  Obecnie apps/backend/src/index.ts:27 nie uruchomi całej aplikacji bez Redis, mimo że odczyty technicznie go nie potrzebują.

  ———

  ### 4. expiresAt istnieje, ale nie działa

  Kolumna jest zdefiniowana w apps/backend/src/db/schema.ts:124, ale:

  - create DTO nie przyjmuje daty wygaśnięcia,
  - serwis jej nie zapisuje,
  - odczyt jej nie sprawdza,
  - cache nie uwzględnia wygaśnięcia.

  Zapytanie przekierowania powinno uwzględniać:

  WHERE short_code = ?
  AND (expires_at IS NULL OR expires_at > NOW())

  Trzeba też zdecydować, czy wygasły link zwraca 404, czy 410 Gone.

  ———

  ### 5. Controller omija service layer

  Tworzenie korzysta z serwisu, ale redirect wywołuje repository bezpośrednio:

  apps/backend/src/modules/urls/controllers/url.controller.ts:36

  Przez to logika cache, wygaśnięcia, statusu linku i analityki trafiłaby do controllera.

  Lepszy podział:

  controller -> url.service.resolve(code) -> cache/repository
  controller -> url.service.create(dto, user)

  Controller powinien odpowiadać tylko za HTTP: walidację wejścia, status i format odpowiedzi.

  ## Proponowana Architektura

  Client
    |
  Load balancer / reverse proxy
    |
  Express API
    |
    +-- URL service
    |     +-- PostgreSQL: source of truth
    |     +-- Redis: redirect cache
    |
    +-- Auth service / Better Auth
    |
    +-- Async event queue
          +-- click analytics
          +-- abuse detection
          +-- notifications

  ### Create URL flow

  POST /api/v1/urls
  -> validate and normalize URL
  -> check quota/rate limit
  -> allocate unique code
  -> save URL in PostgreSQL
  -> optionally warm Redis cache
  -> return complete short URL

  ### Redirect flow

  GET /:code
  -> validate code
  -> lookup Redis
  -> fallback to PostgreSQL
  -> check status and expiration
  -> cache result
  -> publish click event asynchronously
  -> return 302/307 redirect

  Analityka kliknięć nie powinna blokować przekierowania.

  ## Zmiany API i Modelu Danych

  Zamiast:

  POST /create-url

  lepszy kontrakt:

  POST /api/v1/urls
  GET /api/v1/urls/:id
  DELETE /api/v1/urls/:id
  GET /:code

  Odpowiedź create powinna zawierać więcej niż sam kod:

  {
    "id": "...",
    "shortCode": "00ab12",
    "shortUrl": "https://short.ly/00ab12",
    "longUrl": "https://example.com",
    "expiresAt": null
  }

  Do tabeli urls warto dodać:

  - status: active, disabled, expired,
  - updatedAt,
  - opcjonalny customAlias,
  - opcjonalny redirectType,
  - opcjonalny deletedAt.

  Należy też zdecydować, czy ten sam długi URL:

  - zawsze tworzy nowy kod,
  - czy zwraca istniejący kod użytkownika.

  ## Bezpieczeństwo i Odporność Na Nadużycia

  Priorytetowo warto dodać:

  - rate limiting tworzenia linków per IP i użytkownik,
  - limity dzienne dla anonimowych użytkowników,
  - blokowanie niedozwolonych domen,
  - mechanizm wyłączania zgłoszonych linków,
  - limit rozmiaru JSON,
  - helmet,
  - ochronę przed masowym skanowaniem kodów,
  - nieraportowanie pełnych URL-i w logach, ponieważ mogą zawierać tokeny.

  Sekwencyjne Base62 daje krótkie kody, ale pozwala łatwo enumerować utworzone linki. Jeżeli prywatność jest ważna, lepsze będą losowe kody z retry przy
  konflikcie albo permutacja identyfikatora przed Base62.

  ## Operacyjność

  apps/backend/src/routes.ts:6 sprawdza tylko, czy proces działa. Warto rozdzielić:

  - /health/live – proces działa,
  - /health/ready – PostgreSQL i wymagane zależności są dostępne.

  Dodatkowo:

  - jawny pg.Pool i zamykanie go podczas shutdown,
  - timeout dla graceful shutdown,
  - walidacja zmiennych środowiskowych przez Zod,
  - JSON logs w produkcji zamiast zawsze aktywnego pino-pretty,
  - request ID,
  - metryki: redirect latency, cache hit ratio, DB latency, liczba 404, błędy create.

  Middleware Pino jest obecnie rejestrowany po endpointach Better Auth, więc żądania /api/auth/* nie będą logowane przez pino-http.

  ## Testy

  Aktualne testy pokrywają tylko generatory kodów. Brakuje testów najważniejszych zachowań:

  - create URL,
  - redirect istniejącego linku,
  - redirect wygasłego linku,
  - cache hit/cache miss,
  - zachowanie przy awarii Redis,
  - konflikt shortCode,
  - równoległe tworzenie linków,
  - błędy PostgreSQL.

  Build kompiluje również pliki *.spec.ts do dist, a Vitest uruchamia potem testy zarówno z src, jak i dist. Dlatego wykonane testy pokazały 4 pliki, mimo że w
  src są tylko 2.

  Należy:

  - wykluczyć *.spec.ts z tsconfig.build.json,
  - wykluczyć dist/** w konfiguracji Vitest,
  - rozdzielić tworzenie app od app.listen(), aby łatwo testować API.

  ## Sugerowana Kolejność Prac

  1. Naprawić uruchamianie produkcyjnego buildu.
  2. Przenieść generowanie identyfikatorów do PostgreSQL albo dodać synchronizację countera.
  3. Dodać url.service.resolve() i cache-aside dla redirectów.
  4. Obsłużyć expiresAt oraz status linku.
  5. Dodać testy integracyjne API i awarii zależności.
  6. Dodać rate limiting, limity użytkowników i mechanizm blokowania linków.
  7. Dodać readiness, metryki i asynchroniczną analitykę kliknięć.

  Weryfikacja repozytorium: typecheck, build oraz testy przechodzą, ale uruchomienie zbudowanego backendu kończy się błędem aliasu @/.

  Źródła: TechPrep Tiny URL (https://www.techprep.app/system-design/high-level-design/tiny-url/solution), Redis INCR
  (https://redis.io/docs/latest/commands/incr/), Redis persistence (https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/), Express health
  checks and graceful shutdown (https://expressjs.com/en/advanced/healthcheck-graceful-shutdown/).
