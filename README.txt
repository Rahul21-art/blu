=====================================
  BLU HUMAN VILLAGE — ENHANCED EDITION
=====================================

A fully interactive 3D virtual village with Blu, an AI-powered
virtual human who lives, works, and reacts emotionally to you.

FEATURES
--------

🎮 3D VILLAGE
- Full 3D world with navigation system
- Real A* pathfinding around walls and objects
- Dynamic camera that follows Blu with activity-based angles
- Smooth shadows, lighting, and day ambiance

🧠 AI CHAT (Ollama)
- Connects to local Ollama (llama3.2) for real conversations
- Blu understands context and reacts with matching emotions
- Automatic fallback to keyword system if AI unavailable
- Blu types his responses character-by-character with talking animation

😊 EMOTIONAL RESPONSE SYSTEM
- Blu reacts with 6 emotions: happy, sad, angry, surprised, laugh, talk
- Each emotion has intensity (mild → extreme)
- Facial blend shapes match the emotional state
- Smooth emotion transitions
- Body language + animation matches the emotion

🏘️ VILLAGE LIFE & WORK
- Blu autonomously walks around the village
- Does village work: farming 🌾, building 🔨, gathering 🧺, fishing 🎣, cooking 🍳
- Random activities: running, dancing, jumping, waving, laughing
- Blu explains his responses with talking gestures

🎥 DYNAMIC CAMERA
- Camera follows Blu smoothly everywhere
- Different angles for different activities:
  - Running → close, low, dynamic
  - Dancing → side angle
  - Working → close-up view
  - Talking → standard conversation distance

HOW TO RUN
----------

1. Open index.html with VS Code Live Server (recommended)
   or any local HTTP server.

2. For AI-powered conversations:
   a. Install Ollama from https://ollama.ai
   b. Run: ollama pull llama3.2
   c. Keep Ollama running in the background
   d. Blu will automatically detect it and use AI!

3. Without Ollama:
   Blu still works with built-in keyword reactions (~50 responses).

HOW TO INTERACT
---------------

Type anything in the chat! Try:

Basic commands:
  - "hello", "hi"        → Blu waves back
  - "come here"          → Blu walks to you
  - "follow me"          → Blu follows you
  - "stop"               → Blu stops

Emotions:
  - "I'm sad"            → Blu gets sad with you
  - "I'm angry"          → Blu gets angry
  - "laugh" / "funny"    → Blu laughs
  - "surprise" / "wow"   → Blu is surprised
  - "happy" / "great"    → Blu celebrates

Actions:
  - "walk" / "village"   → Blu walks around
  - "run"                → Blu runs
  - "dance"              → Blu dances
  - "wave"               → Blu waves

Conversation (with AI):
  - "Tell me a story"    → Blu tells village tales
  - "How are you?"       → Blu responds emotionally
  - Any question         → Blu answers naturally!

TECHNICAL NOTES
---------------

- Built with Three.js 0.160.0
- AI runs on local Ollama (privacy-friendly)
- All processing is done locally in browser + AI
- No data leaves your computer
