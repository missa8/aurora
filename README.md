# 🎙️ VoxRoom — Salon Vocal WebRTC

Salon vocal temps réel avec WebRTC + Socket.io.
Plusieurs personnes peuvent parler dans le même salon directement depuis le navigateur.

---

## 📁 Structure du projet

```
voice-chat/
├── server.js          ← Serveur Node.js (signalisation Socket.io)
├── public/
│   └── index.html     ← Interface web + WebRTC
├── package.json
├── render.yaml        ← Config déploiement Render
└── .gitignore
```

---

## 🖥️ Tester en local

```bash
# Installer les dépendances
npm install

# Lancer le serveur
npm start

# Ouvrir dans le navigateur
# http://localhost:3000
```

> ⚠️ Pour tester la voix entre deux onglets sur la même machine, utilise
> deux fenêtres différentes (ou deux navigateurs).

---

## 🚀 Déployer sur Render via GitHub

### Étape 1 — Mettre le code sur GitHub

```bash
# Dans le dossier voice-chat/
git init
git add .
git commit -m "Initial commit — VoxRoom"

# Crée un dépôt sur https://github.com/new  (ex: voice-chat)
# Puis :
git remote add origin https://github.com/TON_PSEUDO/voice-chat.git
git branch -M main
git push -u origin main
```

### Étape 2 — Créer le service sur Render

1. Va sur **https://render.com** → créer un compte gratuit
2. Clique **"New +"** → **"Web Service"**
3. Connecte ton compte GitHub et sélectionne le dépôt `voice-chat`
4. Render détecte automatiquement `render.yaml`, vérifie juste :
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Environment** : `Node`
5. Clique **"Deploy Web Service"**

Render te donne une URL du type :
```
https://voxroom.onrender.com
```

### Étape 3 — Partager l'URL

Envoie l'URL à tes amis. Chacun entre son pseudo + le même nom de salon → 🎉

> ℹ️ Sur le plan gratuit de Render, le service "dort" après 15 min d'inactivité
> et met ~30 secondes à se réveiller lors de la première visite.

---

## 🔧 Comment ça marche

```
Navigateur A ──────────────── Navigateur B
     │                              │
     │  Socket.io (signalisation)   │
     └──────────► Serveur ◄─────────┘
                    │
              (échange offre/réponse/ICE)
                    │
     ┌──────────────┴──────────────┐
     │      WebRTC P2P Audio       │
     └─────────────────────────────┘
```

- **Socket.io** sert uniquement à l'échange initial (offre/réponse WebRTC).
- Une fois la connexion établie, l'audio passe **directement** entre les navigateurs (P2P).
- Les serveurs STUN de Google permettent de traverser les NAT/firewall.

---

## ⚙️ Variables d'environnement

| Variable | Défaut | Description         |
|----------|--------|---------------------|
| `PORT`   | `3000` | Port du serveur HTTP|

---

## 🐛 Problèmes courants

| Problème | Solution |
|---|---|
| Micro refusé | Autorise le micro dans le navigateur |
| Pas de son entre pairs | Vérifie que les deux sont dans le **même salon** |
| "Endormi" sur Render | Attends 30s, c'est le plan gratuit |
| Connexion échoue | Peut arriver derrière certains VPN/firewall stricts |
