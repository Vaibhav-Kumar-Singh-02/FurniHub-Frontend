# 🛋️ FurniHub Frontend

React frontend for the FurniHub furniture e-commerce platform.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** & npm
- **Backend API** running on `http://localhost:8080/api`

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`.

## ☁️ Deploy on Vercel

1. Push this repository to GitHub
2. Import the repository in [Vercel](https://vercel.com/new)
3. Set the Environment Variable:
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-backend.onrender.com/api`
4. Click **Deploy**

Vercel will automatically detect the React app, install dependencies, and build.

## 🔗 URLs

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | `https://your-project.vercel.app` |
| **Backend API** | `https://your-backend.onrender.com/api` |

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   │   └── admin/       # Admin dashboard pages
│   ├── services/        # API services
│   ├── styles/          # CSS styles
│   ├── utils/           # Helpers (cart, catalog)
│   ├── App.js           # Routing & main layout
│   └── index.js         # Entry point
├── package.json
├── vercel.json          # Vercel deployment config
├── Dockerfile
└── nginx.conf
```

## 🛠️ Tech Stack

- React 18
- React Router DOM v6
- Axios
- React Icons
- CSS3 with Custom Properties

## 🔐 Authentication

- JWT-based auth via HTTP-only cookies
- Role-based routes (Customer / Admin)
- API base URL configured via `REACT_APP_API_URL`

## 🧪 Testing

```bash
npm test
```

## 📦 Build

```bash
npm run build
```

## 📄 License

This project is proprietary software developed for FurniHub.
