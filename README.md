# Laravel AI Web Builder

An intelligent, sandbox-based Web Application Builder powered by AI. This platform allows users to generate, edit, and instantly preview complete full-stack web applications (like Express.js APIs or Landing Pages) directly from text prompts. 

Built with Laravel 12, React 19, Inertia.js 2.0, and an isolated Node.js Engine.

![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat&logo=laravel)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Engine-339933?style=flat&logo=node.js)
![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?style=flat)

## 🚀 Key Features

- **AI-Powered Generation**: Integrates with Google Gemini AI to translate simple prompts (e.g. "Create a POS cashier app") into a robust Master Prompt that generates complete Express.js controllers, EJS views, and SQL schemas.
- **Isolated Node.js Sandbox Engine**: Runs user-generated backend code securely within a Node.js `vm` context. Apps are spun up instantly without provisioning physical servers.
- **MySQL-to-SQLite Transparent Shim**: AI is trained to write standard MySQL (including `ENUM`, `BEGIN TRANSACTION`, `FOR UPDATE`). Our custom database shim intercepts these queries and translates them into SQLite on the fly, allowing zero-config lightweight databases for every project.
- **Dynamic Preview Proxy**: Laravel acts as a reverse proxy (`PreviewProxyController`), forwarding dynamic API and view requests to the Node Engine while serving static assets natively.
- **Modern Dashboard UI**: Built with Shadcn UI, Tailwind CSS v4, and Lucide React. Includes features like dark mode, live previews, and file management.

## 🏗 Architecture

The system is split into two main components:
1. **The Laravel Host (Core)**: Handles user authentication, project management, file storage (database-backed), prompt engineering, and UI serving via React + Inertia.
2. **The Node Engine (Sandbox)**: A separate lightweight Express application that evaluates user-generated code in a `vm2`-style sandbox context, intercepting HTTP requests and simulating a MySQL database connection using `better-sqlite3`.

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/asmindev/laravel-web-builder.git
   cd laravel-web-builder
   ```

2. **Setup Laravel Backend**
   ```bash
   composer install
   npm install
   cp .env.example .env
   php artisan key:generate
   ```

3. **Configure Environment Variables**
   Update your `.env` file with your database credentials and Gemini API Key:
   ```env
   DB_CONNECTION=sqlite # Or mysql
   GEMINI_API_KEY=your_google_gemini_key_here
   NODE_ENGINE_URL=http://localhost:4000
   ```

4. **Run Database Migrations & Seeders**
   ```bash
   php artisan migrate --seed
   ```

5. **Setup Node Engine**
   ```bash
   cd node-engine
   npm install
   cd ..
   ```

## 💻 Running the Application

You need to run three separate processes for the complete development environment:

**1. Laravel Server**
```bash
php artisan serve
```

**2. Vite Asset Bundler (React/Inertia)**
```bash
npm run dev
```

**3. Node Engine (Sandbox)**
```bash
cd node-engine
npm run dev
```

The main application dashboard will be available at `http://localhost:8000`.

## 🧠 AI Prompt Enhancer
The platform includes a specialized `PromptEnhancer` that adds strict guardrails to user requests before they are sent to the AI. These guardrails ensure:
- No placeholders or `// Add code here` comments are generated.
- `process.on()` and other environment-breaking event listeners are forbidden.
- DDL syntax is optimized to be SQLite-shim compatible (e.g. avoiding `CREATE DATABASE`).

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
