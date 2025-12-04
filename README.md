# Keep Contacts

API SaaS de collecte et gestion de contacts pour organisations.

## Stack Technique

- **Backend** : NestJS + TypeScript
- **Base de donnees** : MySQL + Prisma ORM
- **Authentification** : JWT
- **Validation** : class-validator

## Architecture

```
src/
├── main.ts                 # Point d'entree
├── app.module.ts           # Module principal
├── config/                 # Configuration
├── common/                 # Utilitaires partages
│   ├── decorators/         # Decorateurs custom
│   ├── guards/             # Guards (auth)
│   ├── filters/            # Filtres d'exception
│   ├── interceptors/       # Intercepteurs (logging)
│   └── utils/              # Fonctions utilitaires
├── prisma/                 # Service Prisma
└── modules/
    ├── auth/               # Authentification
    ├── organizations/      # Gestion des organisations
    ├── groups/             # Gestion des groupes
    ├── contacts/           # Gestion des contacts
    └── exports/            # Export CSV/VCF + Tokens
```

## Modele de Donnees

```
User (admin)
  └── Organizations (many-to-many)
        └── Groups
              ├── Contacts
              ├── Invitations (liens publics pour soumettre)
              └── ExportTokens (liens temporaires pour telecharger)
```

## Installation

```bash
# Cloner le projet
git clone <repo>
cd keep_contacts/backend

# Installer les dependances
npm install

# Configurer l'environnement
cp .env.example .env
# Editer .env avec vos parametres

# Generer le client Prisma
npx prisma generate

# Lancer les migrations
npx prisma migrate dev

# Demarrer le serveur
npm run dev
```

## Variables d'Environnement

```env
DATABASE_URL="mysql://user:password@localhost:3306/keep_contacts"
JWT_SECRET="votre_secret_jwt_super_secure"
PORT=3000
BASE_URL="http://localhost:3000"
```

## Endpoints API

### Auth

| Methode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/auth/register` | Inscription admin | Non |
| POST | `/auth/login` | Connexion | Non |
| GET | `/auth/me` | Profil utilisateur | Oui |

### Organizations

| Methode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/organizations` | Creer une organisation | Oui |
| GET | `/organizations` | Lister ses organisations | Oui |
| GET | `/organizations/:id` | Details organisation | Oui |
| PATCH | `/organizations/:id` | Modifier organisation | Oui |
| DELETE | `/organizations/:id` | Supprimer organisation | Oui |

### Groups

| Methode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/groups` | Creer un groupe | Oui |
| GET | `/groups/:id` | Details groupe | Oui |
| PATCH | `/groups/:id` | Modifier groupe | Oui |
| DELETE | `/groups/:id` | Supprimer groupe | Oui |
| POST | `/groups/:id/invitation` | Generer lien invitation | Oui |

### Contacts

| Methode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/contacts` | Creer contact (public) | Non |
| GET | `/invitation/:slug` | Info invitation | Non |
| GET | `/groups/:id/contacts` | Lister contacts groupe | Oui |
| GET | `/contacts/:id` | Details contact | Oui |
| PATCH | `/contacts/:id` | Modifier contact | Oui |
| DELETE | `/contacts/:id` | Supprimer contact | Oui |

### Exports

| Methode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/groups/:id/export/csv` | Export CSV (admin) | Oui |
| GET | `/groups/:id/export/vcf` | Export VCF (admin) | Oui |
| POST | `/groups/:id/export/token` | Generer token d'export | Oui |
| GET | `/groups/:id/export/tokens` | Lister tokens d'export | Oui |
| POST | `/groups/:id/export/tokens/:tokenId/revoke` | Revoquer un token | Oui |
| GET | `/export?token=<token>` | Telecharger (public) | Non |

## Exemples d'Utilisation

### 1. Inscription Admin

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### 2. Creer une Organisation

```bash
curl -X POST http://localhost:3000/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Epitech Paris","autoTag":"Epitech 2025"}'
```

### 3. Creer un Groupe

```bash
curl -X POST http://localhost:3000/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Promo 2025","organizationId":"<org_id>"}'
```

### 4. Generer un Lien d'Invitation (pour soumettre des contacts)

```bash
curl -X POST http://localhost:3000/groups/<group_id>/invitation \
  -H "Authorization: Bearer <token>"
```

### 5. Soumettre un Contact (Public)

```bash
curl -X POST http://localhost:3000/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "slug":"abc123xyz",
    "firstName":"Jean",
    "lastName":"Dupont",
    "phone":"+33612345678",
    "email":"jean@example.com"
  }'
```

### 6. Generer un Token d'Export (pour partager le telechargement)

```bash
curl -X POST http://localhost:3000/groups/<group_id>/export/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"expiresInHours":48,"format":"csv"}'
```

Reponse :
```json
{
  "id": "clx...",
  "token": "a1b2c3d4...",
  "format": "csv",
  "expiresAt": "2025-12-05T19:00:00.000Z",
  "url": "http://localhost:3000/export?token=a1b2c3d4..."
}
```

### 7. Telecharger les Contacts avec le Token (Public)

```bash
curl -O "http://localhost:3000/export?token=a1b2c3d4..."
```

### 8. Lister les Tokens d'Export

```bash
curl http://localhost:3000/groups/<group_id>/export/tokens \
  -H "Authorization: Bearer <token>"
```

### 9. Revoquer un Token d'Export

```bash
curl -X POST http://localhost:3000/groups/<group_id>/export/tokens/<token_id>/revoke \
  -H "Authorization: Bearer <token>"
```

### 10. Export Direct (Admin uniquement)

```bash
# CSV
curl -O http://localhost:3000/groups/<group_id>/export/csv \
  -H "Authorization: Bearer <token>"

# VCF
curl -O http://localhost:3000/groups/<group_id>/export/vcf \
  -H "Authorization: Bearer <token>"
```

## Flux d'Utilisation

### Collecte de Contacts (Public)

1. Admin cree une organisation et un groupe
2. Admin genere un lien d'invitation (`POST /groups/:id/invitation`)
3. Le lien est partage aux membres (ex: `https://app.com/invite/abc123`)
4. Chaque membre remplit le formulaire (public)
5. Les contacts sont stockes dans le groupe

### Export de Contacts (Token Temporaire)

1. Admin genere un token d'export (`POST /groups/:id/export/token`)
2. Le lien est partage aux membres (ex: `https://app.com/export?token=xyz`)
3. Chaque membre peut telecharger le CSV/VCF
4. Le token expire automatiquement apres la duree definie
5. Admin peut revoquer le token a tout moment

## Securite

- Authentification JWT sur toutes les routes admin
- Tokens d'export temporaires avec expiration
- Validation des donnees avec class-validator
- Hashage des mots de passe avec bcrypt
- Protection CORS activee
- Verification des permissions par organisation
- Revocation possible des tokens d'export

## Developpement

```bash
# Mode developpement avec hot-reload
npm run dev

# Build production
npm run build

# Demarrer en production
npm run start
```

## Licence

MIT
