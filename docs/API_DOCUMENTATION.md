# Documentation API - CertiFi Québec

## 🔐 Authentification

Toutes les API (sauf auth) nécessitent un token Bearer dans l'en-tête :
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 📡 Auth API (`/functions/v1/auth-api`)

### POST /register
Créer un nouveau compte utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "primerica_id": "123456",
  "first_name": "Jean",
  "last_name": "Dupont",
  "initial_role": "PQAP" // "PQAP" | "FONDS_MUTUELS" | "LES_DEUX"
}
```

**Response:**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "primerica_id": "123456"
  }
}
```

### POST /login
Connexion utilisateur.

**Body:**
```json
{
  "primerica_id": "123456",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Connexion réussie",
  "session": { /* Supabase session */ },
  "user": { /* Supabase user */ }
}
```

### POST /reset-password
Réinitialiser le mot de passe.

**Body:**
```json
{
  "email": "user@example.com"
}
```

### POST /update-password
Mettre à jour le mot de passe (authentifié).

**Body:**
```json
{
  "password": "newpassword123"
}
```

## 👤 User API (`/functions/v1/user-api`)

### GET /profile
Récupérer le profil utilisateur complet avec statistiques.

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "primerica_id": "123456",
    "first_name": "Jean",
    "last_name": "Dupont",
    "current_xp": 1250,
    "current_level": 3,
    "gamified_role": "Conseiller Confirmé",
    "user_permissions": [...],
    "stats": {
      "total_exams": 5,
      "passed_exams": 4,
      "average_score": 85.2,
      "total_podcasts_listened": 12,
      "rank_position": 15
    }
  }
}
```

### GET /podcasts
Récupérer les podcasts disponibles selon les permissions.

**Response:**
```json
{
  "podcasts": [
    {
      "id": "uuid",
      "title": "Introduction à la Déontologie",
      "description": "...",
      "duration_seconds": 1800,
      "xp_awarded": 50,
      "theme": "Déontologie",
      "required_permission": "pqap"
    }
  ]
}
```

### POST /podcast-listened
Marquer un podcast comme écouté et attribuer l'XP.

**Body:**
```json
{
  "podcast_id": "uuid"
}
```

**Response:**
```json
{
  "message": "XP attribué avec succès",
  "xp_gained": 50,
  "result": {
    "old_xp": 1200,
    "new_xp": 1250,
    "level_up_occurred": false
  }
}
```

### GET /exams
Récupérer les examens disponibles.

**Query params:**
- `permission` (optionnel): Filtrer par permission

**Response:**
```json
{
  "exams": [
    {
      "id": "uuid",
      "exam_name": "Examen PQAP",
      "num_questions_to_draw": 35,
      "time_limit_minutes": 90,
      "passing_score_percentage": 70,
      "xp_base_reward": 200
    }
  ]
}
```

### GET /start-exam
Démarrer un examen et récupérer les questions.

**Query params:**
- `exam_id`: ID de l'examen

**Response:**
```json
{
  "exam": {
    "id": "uuid",
    "name": "Examen PQAP",
    "time_limit_minutes": 90
  },
  "questions": [
    {
      "id": "uuid",
      "question_text": "Quelle est la définition de...",
      "question_type": "MCQ",
      "options_json": {
        "A": "Option 1",
        "B": "Option 2",
        "C": "Option 3",
        "D": "Option 4"
      },
      "difficulty_level": 2
    }
  ]
}
```

### POST /submit-exam
Soumettre les réponses d'un examen.

**Body:**
```json
{
  "exam_id": "uuid",
  "answers": {
    "question_id_1": "A",
    "question_id_2": "true",
    "question_id_3": "B"
  },
  "time_spent_seconds": 3600
}
```

**Response:**
```json
{
  "attempt": { /* Tentative enregistrée */ },
  "score_percentage": 85.5,
  "passed": true,
  "xp_earned": 250,
  "detailed_answers": [
    {
      "question_id": "uuid",
      "user_answer": "A",
      "correct_answer": "A",
      "is_correct": true,
      "difficulty": 2
    }
  ]
}
```

### GET /exam-attempts
Récupérer l'historique des tentatives d'examen.

### GET /minigames
Récupérer les mini-jeux disponibles.

### POST /submit-minigame-score
Soumettre un score de mini-jeu.

**Body:**
```json
{
  "minigame_id": "uuid",
  "score": 850,
  "max_possible_score": 1000,
  "game_session_data": { /* Données de session */ }
}
```

### GET /leaderboard
Récupérer le classement.

**Query params:**
- `type`: "global" | "pqap" | "fonds_mutuels"
- `limit`: Nombre de résultats (défaut: 50)

### GET /recent-activities
Récupérer les activités récentes de l'utilisateur.

**Query params:**
- `limit`: Nombre d'activités (défaut: 20)

## 🛡️ Admin API (`/functions/v1/admin-api`)

> **Note:** Toutes les routes admin nécessitent des droits administrateur.

### GET /dashboard-stats
Statistiques globales pour le tableau de bord admin.

**Response:**
```json
{
  "totalUsers": 150,
  "activeUsers": 142,
  "totalExamAttempts": 450,
  "totalPodcastListens": 1200,
  "roleDistribution": {
    "PQAP": 60,
    "FONDS_MUTUELS": 45,
    "LES_DEUX": 45
  },
  "levelDistribution": {
    "1": { "count": 30, "avgXp": 250 },
    "2": { "count": 25, "avgXp": 750 }
  }
}
```

### GET /users
Récupérer la liste des utilisateurs avec pagination.

**Query params:**
- `page`: Numéro de page (défaut: 1)
- `limit`: Éléments par page (défaut: 20)
- `search`: Recherche textuelle
- `role`: Filtrer par rôle

**Response:**
```json
{
  "users": [ /* Liste des utilisateurs */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### GET /user/{userId}
Récupérer les détails d'un utilisateur spécifique.

### PUT /user-permissions/{userId}
Mettre à jour les permissions d'un utilisateur.

**Body:**
```json
{
  "permissions": [1, 2, 3], // IDs des permissions
  "is_admin": false,
  "is_supreme_admin": false // Seul un admin suprême peut modifier
}
```

### DELETE /user/{userId}
Supprimer un utilisateur (admin suprême uniquement).

### POST /award-xp
Attribuer manuellement de l'XP à un utilisateur.

**Body:**
```json
{
  "user_id": "uuid",
  "xp_amount": 100,
  "reason": "Participation exceptionnelle"
}
```

### GET /content
Récupérer le contenu (podcasts, questions, examens, mini-jeux).

**Query params:**
- `type`: "podcasts" | "questions" | "exams" | "minigames"
- `page`, `limit`: Pagination

### POST /create-content
Créer du nouveau contenu.

**Body:**
```json
{
  "type": "podcast", // "podcast" | "question" | "exam" | "minigame"
  "data": { /* Données du contenu */ }
}
```

### PUT /update-content
Mettre à jour du contenu existant.

### DELETE /content
Supprimer du contenu.

### GET /global-activities
Récupérer les activités globales de tous les utilisateurs.

### GET /admin-logs
Récupérer les logs d'administration avec pagination.

## 🔄 Codes de Réponse

- `200`: Succès
- `400`: Erreur de validation / Données invalides
- `401`: Non authentifié
- `403`: Accès refusé / Permissions insuffisantes
- `404`: Ressource non trouvée
- `405`: Méthode non autorisée
- `500`: Erreur interne du serveur

## 📝 Format des Erreurs

```json
{
  "error": "Message d'erreur descriptif"
}
```

## 🎯 Exemples d'Utilisation

### Flux d'authentification complet
```javascript
// 1. Connexion
const loginResponse = await fetch('/functions/v1/auth-api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    primerica_id: '123456',
    password: 'password123'
  })
})

const { session } = await loginResponse.json()

// 2. Utiliser le token pour les API protégées
const profileResponse = await fetch('/functions/v1/user-api/profile', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
})
```

### Flux d'examen complet
```javascript
// 1. Démarrer l'examen
const examData = await fetch('/functions/v1/user-api/start-exam?exam_id=uuid', {
  headers: { 'Authorization': `Bearer ${token}` }
})

// 2. Soumettre les réponses
const result = await fetch('/functions/v1/user-api/submit-exam', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    exam_id: 'uuid',
    answers: { 'q1': 'A', 'q2': 'true' },
    time_spent_seconds: 3600
  })
})
```