# IDE-GPT: Online Code Execution Platform

Welcome to **IDE-GPT**, an online Integrated Development Environment (IDE) that allows users to write and execute code in a secure, containerized environment. This project leverages **Docker** for code execution and **WebSockets** for real-time communication between the frontend and backend.

---

## ✨ Features

- **Real-time Code Execution**: Execute Python and JavaScript code instantly with output displayed in the console.
- **Containerized Environment**: Code runs in isolated Docker containers, ensuring security and consistency.
- **Multi-language Support**: Currently supports Python and JavaScript, with easy extensibility for more languages.
- **Interactive Input (Stdin)**: Send input to running programs via the console.
- **Clear Output Display**: Differentiated output for standard output, standard error, and system messages.
- **Monaco Editor**: A powerful and familiar code editor experience in the browser.
- **Responsive UI**: A user-friendly interface built with React and Tailwind CSS.

---

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (LTS version recommended)
- npm or Yarn (npm is used in this guide)
- Docker Desktop (or Docker Engine if on Linux)

---

### 🔧 Installation

install docker

#### Clone the repository:

```bash
git clone https://github.com/your-username/krisn2-ide-gpt.git
cd krisn2-ide-gpt
```
Backend Setup:
Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Frontend Setup:
Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

🏃 Running the Application
Start the Backend Server:
From the backend directory, start the server:

```bash
cd backend
node server.js
```
The backend will start on http://localhost:3000 (or the port defined in backend/config/server.js).

You should see messages indicating the server is running and the WebSocket endpoint is active.

Start the Frontend Development Server:
From the frontend directory, start the development server:

```bash
cd frontend
npm run dev
```


