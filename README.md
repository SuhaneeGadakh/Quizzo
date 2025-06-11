# 🎯 Quizzo
  <h3><em>🧠 Your Ultimate Quiz Portal – Learn, Compete, and Have Fun!</em></h3>

  <!-- Solid Colored Badges -->
  <p>
<img src="https://img.shields.io/github/issues/SuhaneeGadakh/Quizzo?style=for-the-badge&color=6e6e6e" alt="GitHub issues"/>
<img src="https://img.shields.io/github/issues-pr/SuhaneeGadakh/Quizzo?style=for-the-badge&color=7f8c8d" alt="GitHub pull requests"/>
<img src="https://img.shields.io/badge/License-MIT-555555?style=for-the-badge" alt="License"/>
<img src="https://img.shields.io/badge/version-1.0.0-3d3d3d?style=for-the-badge" alt="Version"/>
<img src="https://img.shields.io/badge/React-18.x-2f2f2f?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
<img src="https://img.shields.io/badge/Node.js-16.x-363636?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
<img src="https://img.shields.io/badge/Express-4.x-1e1e1e?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
<img src="https://img.shields.io/badge/Xampp-server-4d4d4d?style=for-the-badge&logo=oracle&logoColor=white" alt="XAMPP"/>
<img src="https://img.shields.io/badge/Redux-Toolkit-292929?style=for-the-badge&logo=redux&logoColor=white" alt="Redux"/>
<img src="https://img.shields.io/badge/REST API-supported-444444?style=for-the-badge" alt="REST API"/>
<img src="https://img.shields.io/badge/Dark%20Mode-supported-2c3e50?style=for-the-badge" alt="Dark Mode"/>
  </p>

  <p>
    <a href="#-project-architecture">Architecture</a> •
    <a href="#-setup">Setup</a> •
    <a href="#️-screenshots">Screenshots</a> •
    <a href="#-features">Features</a> •
    <a href="#-license">License</a>
  </p>
</div>

---

## 🧠 Project Architecture

```mermaid
sequenceDiagram
  participant U as 👤 User
  participant B as 🌐 Browser
  participant FE as 💻 Quizzo React App
  participant BE as 🛠️ Express.js Backend
  participant C as 🧩 API Controllers
  participant DB as 🗄️ XAMPP

  U->>B: Request
  B->>FE: Load App
  FE->>BE: HTTP Request
  BE->>C: Route Handling
  C->>DB: Query/Response
```



## 🚀 Setup

### Clone the repository
```bash
git clone https://github.com/your-username/Quizzo.git
```

### Navigate to the project folder
```bash
cd Quizzo
```

### Install frontend & backend dependencies
```bash
npm install
```

### To run both frontend and backend (if applicable)
```bash
npm run dev
```

---

## 🖼️ Screenshots

<div align="center">

### 🖥️ Desktop View

<img src="hss.png" alt="Horizontal (Desktop) Screenshot" width="90%"/>

### 📱 Mobile Views

<img src="pss.png" alt="Mobile Portrait Screenshot 1" width="45%"/>
<img src="lss.png" alt="Mobile Portrait Screenshot 2" width="45%"/>

</div>

---

## ✨ Features

- 🎓 Dynamic quiz questions from Open Trivia API with local fallback
- ⏱️ Timed quiz rounds with real-time scoring
- 🌙 Dark Mode support for night owls
- 🎯 Adaptive difficulty based on player performance
- 📱 Fully responsive UI – mobile, tablet, desktop friendly
- ⚡ State management using Redux Toolkit
- 🧪 Modular, scalable architecture for future enhancements

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <p>Created with ❤️ by <a href="https://github.com/SuhaneeGadakh" target="_blank"><strong>Suhanee Gadakh</strong></a></p>
  <p>If <strong>Quizzo</strong> helped you, consider giving it a ⭐!</p>
</div>
