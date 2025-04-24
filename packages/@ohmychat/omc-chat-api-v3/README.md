# Documentation technique – omc-chat-api-v3

## Présentation

`omc-chat-api-v3` est un module de gestion de chat temps réel pour l’application OhMyChat. Il propose une architecture modulaire pour la gestion des groupes, messages, membres, utilisateurs, et la synchronisation temps réel via Supabase. Ce package sert de couche d’abstraction pour la gestion des chats temps réel, en s’appuyant sur Supabase pour la persistance et la synchronisation, et sur un store local pour la performance et la réactivité côté client.

---

## Architecture du package

### Arborescence principale

- **index.ts** : Point d’entrée du package.
- **types.ts** : Définitions des types TypeScript (Group, Message, Member, etc.).
- **changes/** : Gestion des changements temps réel (groupes, membres, messages, typing, users) via listeners Supabase ou WebSocket.
- **events/** : Gestionnaire d’événements (ex: `emitter.ts`) pour propager les changements dans l’application.
- **functions/** : Fonctions utilitaires pour manipuler les données de chat (tri, calcul du nombre de messages non lus, synchronisation du store, etc.).
- **handlers/** : Handlers pour les routes principales (liste des chats, gestion d’une conversation, etc.).
- **store/** : Gestion du store local (ex: avec @legendapp/state), création et formatage des données de chat.
- **supabase/** : Intégration avec Supabase pour la synchronisation temps réel (`realtime.ts`).
- **test/** : Scripts de test (simulation de client, etc.).
- **old/** : Anciennes implémentations ou scripts de migration.

---

## Fonctionnement général

- **Temps réel** : Le package écoute les changements sur Supabase (insert/update sur les messages, groupes, membres, etc.) et met à jour le store local en conséquence.
- **Store local** : Les données de chat sont structurées et stockées localement pour une gestion efficace de l’état côté client.
- **Handlers** : Fournissent des points d’entrée pour récupérer ou manipuler les données de chat (liste des conversations, détails d’une conversation, etc.).
- **Utilitaires** : Fonctions pour trier, filtrer, compter, et formater les données de chat.
- **Types** : Forte utilisation de TypeScript pour garantir la cohérence des données.
- **Events** : Les événements internes (via le dossier `events/` et `emitter.ts`) permettent de propager les changements détectés (nouveau message, modification de groupe, statut de saisie, etc.) à l’ensemble de l’application.

---

## Exemple de flux

1. **Connexion d’un client** : Le client s’authentifie et se connecte au namespace WebSocket `/chat`.
2. **Initialisation** : Le client demande la liste de ses groupes/messages via un handler (ex: `chatList.ts`).
3. **Écoute temps réel** : Les changements (nouveau message, membre ajouté, etc.) sont capturés par Supabase et relayés via les fichiers de `changes/`.
4. **Mise à jour du store** : Les événements sont propagés dans le store local pour une mise à jour instantanée de l’UI.

---

## Bonnes pratiques

- **Types# Documentation technique – omc-chat-api-v3

## Présentation

`omc-chat-api-v3` est un module de gestion de chat temps réel pour l’application OhMyChat. Il propose une architecture modulaire pour la gestion des groupes, messages, membres, utilisateurs, et la synchronisation temps réel via Supabase. Il s’appuie sur un store local pour la performance côté client.

---

## Architecture du package

### Arborescence principale

- **index.ts** : Point d’entrée du package.
- **types.ts** : Définitions des types TypeScript (Group, Message, Member, etc.).
- **changes/** : Gestion des changements temps réel (groupes, membres, messages, typing, users) via listeners Supabase ou WebSocket.
- **events/** : Gestionnaire d’événements (ex: `emitter.ts`) pour propager les changements dans l’application.
- **functions/** : Fonctions utilitaires pour manipuler les données de chat (tri, calcul du nombre de messages non lus, synchronisation du store, etc.).
- **handlers/** : Handlers pour les routes principales (liste des chats, gestion d’une conversation, etc.).
- **store/** : Gestion du store local (ex: avec @legendapp/state), création et formatage des données de chat.
- **supabase/** : Intégration avec Supabase pour la synchronisation temps réel (`realtime.ts`).
- **test/** : Scripts de test (simulation de client, etc.).
- **old/** : Anciennes implémentations ou scripts de migration.

---

## Fonctionnement général

- **Temps réel** : Le package écoute les changements sur Supabase (insert/update sur les messages, groupes, membres, etc.) et met à jour le store local en conséquence.
- **Store local** : Les données de chat sont structurées et stockées localement pour une gestion efficace de l’état côté client.
- **Handlers** : Fournissent des points d’entrée pour récupérer ou manipuler les données de chat (liste des conversations, détails d’une conversation, etc.).
- **Utilitaires** : Fonctions pour trier, filtrer, compter, et formater les données de chat.
- **Types** : Forte utilisation de TypeScript pour garantir la cohérence des données.

---

## Exemple de flux

1. **Connexion d’un client** : Le client s’authentifie et se connecte au namespace WebSocket `/chat`.
2. **Initialisation** : Le client demande la liste de ses groupes/messages via un handler (ex: `chatList.ts`).
3. **Écoute temps réel** : Les changements (nouveau message, membre ajouté, etc.) sont capturés par Supabase et relayés via les fichiers de `changes/`.
4. **Mise à jour du store** : Les événements sont propagés dans le store local pour une mise à jour instantanée de l’UI.

---

## Bonnes pratiques

- **Typescript strict** : Utiliser le typage strict pour éviter les erreurs à l’exécution.
- **Séparation des responsabilités** : Organiser le code par domaine (handlers, store, changes, etc.) pour faciliter la maintenance.
- **Gestion des erreurs** : Toujours prévoir la gestion des erreurs lors des opérations asynchrones (écoute Supabase, accès au store, etc.).
- **Tests** : Utiliser les scripts de test pour simuler des clients et valider les flux critiques.
- **Documentation** : Documenter chaque fonction et handler pour faciliter l’onboarding et la maintenance.