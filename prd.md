Good direction. If you make the UI like ChatGPT / GenAI tools, it will feel **modern, intelligent, and easy for judges to understand**.

I’ll give you a **clean, product-level PRD for UI** so you can directly build a prototype (with fake data).

---

# 🧾 PRD — Sci-Bridge Agent UI (GenAI-style)

## 1. Product Goal

Design a **GenAI-style interface** that allows users to:

* Upload scientific projects
* Interact with AI agent
* Receive structured evaluation
* Generate commercialization outputs

👉 UX must feel like:
**ChatGPT + Notion + Pitch Deck Generator**

---

# 🎯 2. Target Users

### Primary:

* Scientists / Researchers
* Technology managers

### Secondary:

* Investors
* Government / incubator staff

---

# 🧱 3. Core UI Structure

```text
[ Sidebar ]
[ Main Chat Interface ]
[ Right Panel (AI Output / Structured Data) ]
```

---

# 🖥️ 4. Main Screens

---

## 🧩 Screen 1: Home / Dashboard

### Purpose:

Entry point, project overview

### Layout:

```text
Sidebar (left)
------------------------
+ New Project
Projects List
Templates
Saved Reports
Settings

Main Area
------------------------
Welcome message:
"Describe your technology or upload your research"

[ Input Box ]
[ Upload Button ]

Quick Actions:
- Evaluate my research
- Generate commercialization plan
- Find investors
```

---

## 💬 Screen 2: AI Chat Workspace (CORE)

### This is the MOST important screen

### Layout:

```text
LEFT: Sidebar (projects)

CENTER: Chat

RIGHT: Structured Output Panel
```

---

### 🧠 Center (Chat UI)

Similar to ChatGPT:

```text
User:
"I developed a new material for energy storage..."

AI:
"Great. Let me analyze your technology..."
```

### Input area:

```text
[ Type your message... ]
[ Upload file 📎 ]
[ Run Deep Analysis ⚡ ]
```

---

### 📎 File Upload

Support:

* PDF (paper)
* PPT
* DOC
* Images

Fake data example:

```text
"graphene_battery_research.pdf"
```

---

## 📊 Screen 3: Structured Output Panel (Right Side)

👉 This is your **key differentiator**

While chat is running, panel updates.

---

### Sections:

### 1. Technology Overview

```text
Field: Energy Storage
Innovation: Graphene-based battery
Application: EV, grid storage
```

---

### 2. Evaluation Score

```text
TRL Level: 4/9
Market Potential: 8/10
Commercial Readiness: 6/10
Investment Attractiveness: 7/10
```

---

### 3. Key Insights

```text
- High potential in EV sector
- Needs cost reduction
- Competes with lithium-ion tech
```

---

### 4. Risks

```text
- Manufacturing complexity
- Patent competition
- Regulatory barriers
```

---

### 5. Suggested Next Steps

```text
- Build prototype
- Find pilot partners
- Apply for government grant
```

---

## 🧪 Screen 4: Deep Analysis Mode

When user clicks:

👉 “Run Deep Research”

### UI behavior:

* Loading animation (important for demo)
* Step-by-step AI thinking:

```text
Analyzing research...
Checking patents...
Scanning market...
Matching investors...
```

---

### Final output:

```text
📄 Full AI Report Generated
[ Download PDF ]
[ Export Pitch Deck ]
```

---

## 📈 Screen 5: Investor Matching

### Layout:

```text
Top:
"Recommended Investors"

Cards:

[ VC Name ]
Focus: Energy / DeepTech
Stage: Seed – Series A
Region: China / Global

Match Score: 87%
```

---

Fake examples:

* Sequoia China
* Hillhouse
* CATL Ventures

---

## 🧾 Screen 6: Generated Outputs

### Tabs:

```text
- Report
- Pitch Deck
- Roadmap
- Investor List
```

---

### Example:

#### Pitch Deck Generator

Slides preview:

```text
1. Problem
2. Solution
3. Technology
4. Market
5. Business Model
6. Team
7. Funding Ask
```

---

## ⚙️ Screen 7: Settings / Model Control

(important for “OpenClaw-like” feel)

```text
AI Model:
[ DeepSeek ]
[ Qwen ]
[ OpenAI ]

Analysis Mode:
[ Fast ]
[ Standard ]
[ Deep ]

Data Privacy:
[ Local ]
[ Cloud ]
```

---

# 🎨 5. Design Style

### Inspired by:

* ChatGPT
* Perplexity
* Notion AI

---

## Visual style

### Colors:

```text
Primary: Black / Dark Gray
Accent: Blue / Purple (AI feel)
Background: Light gray / white OR dark mode
```

---

### Components:

* Rounded cards
* Soft shadows
* Clean typography
* Minimal icons

---

### Chat bubbles:

```text
User → right side
AI → left side
```

---

### Animations:

* Typing animation
* Thinking dots (...)
* Loading progress

---

# 🧪 6. Fake Data Strategy (for prototype)

Use examples like:

### Project:

```text
Name: Graphene Battery Tech
Field: Energy
Stage: Lab prototype
```

---

### Investors:

```text
Sequoia China
Hillhouse Capital
SoftBank Vision Fund
```

---

### Metrics:

```text
TRL: 3–6
Market: $50B+
Success probability: 65%
```

---

# 🔥 7. Key WOW Features (for demo)

Make sure to show these:

### 1. Upload → instant AI understanding

### 2. Chat + structured panel sync

### 3. Deep analysis animation

### 4. Auto-generated pitch deck

### 5. Investor matching

---

# 🧠 8. MVP Scope (important)

Don’t overbuild.

### Must include:

✔ Chat UI
✔ File upload
✔ Right panel structured output
✔ Fake investor matching
✔ Report export button

---

# 🧾 Final summary

This UI should feel like:

👉 **“ChatGPT for scientific commercialization”**

NOT:

❌ complex dashboard
❌ heavy enterprise UI

---

If you want next step, I can:

👉 design **exact Flutter / React component structure**
👉 OR give you **copy-paste UI text (English + Chinese for HICOOL demo)**
