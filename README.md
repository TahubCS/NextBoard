# NexBoard 

NexBoard is a full-stack, drag-and-drop project management tool designed to help teams organize tasks efficiently. Built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript, it features a sleek, modern UI with dark mode support, rich task details, and fluid animations.

## 🚀 Features

### 🎨 Visual & UI
- **Modern Design**: Clean, "Linear-style" aesthetic using the Inter font family
- **Dark/Light Mode**: Fully persistent theme toggling with system preference detection
- **Custom Backgrounds**: Personalize boards with gradients or high-quality image backgrounds
- **Responsive**: Fully optimized for desktop, tablet, and mobile devices

### ⚡ Core Functionality
- **Multi-Workspace**: Create and manage multiple boards from a centralized dashboard
- **Drag & Drop**: Powered by @dnd-kit for smooth task and column reordering
- **Rich Task Details**: Add descriptions, set priority levels (Low/Med/High), and assign due dates
- **CRUD Operations**: Full create, read, update, and delete capabilities for Boards, Columns, and Tasks

### 🔒 Security
- **Authentication**: Secure JWT-based login and registration system
- **Data Isolation**: Users can only access and modify their own boards

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: React (Vite)
- **Language**: TypeScript
- **State & Dragging**: @dnd-kit/core, @dnd-kit/sortable
- **Styling**: CSS Modules / CSS Variables (Theming)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **HTTP**: Axios

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JSON Web Tokens (JWT) & Bcrypt

## ⚙️ Installation & Setup

### Prerequisites
Ensure you have Node.js and MongoDB installed locally or a MongoDB Atlas URI.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/nexboard.git
cd nexboard
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the server folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
```

Start the backend server:
```bash
npm run dev
```
Server should run on `http://localhost:5000`

### 3. Frontend Setup
Open a new terminal, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

Start the frontend development server:
```bash
npm run dev
```
Client should run on `http://localhost:5173`

## 📂 Project Structure

```
nexboard/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/            # Axios API calls
│   │   ├── components/     # Reusable UI components (TaskCard, Column, Modal)
│   │   ├── context/        # Auth Context provider
│   │   ├── pages/          # Home, Dashboard, AuthPage
│   │   ├── types/          # TypeScript interfaces
│   │   ├── App.tsx         # Main Routing
│   │   └── index.css       # Global Styles & Theme Variables
│   └── ...
├── server/                 # Express Backend
│   ├── src/
│   │   ├── controllers/    # Logic for Boards, Tasks, Auth
│   │   ├── middleware/     # Auth verification
│   │   ├── models/         # Mongoose Schemas (User, Board, Column, Task)
│   │   ├── routes/         # API Routes
│   │   └── index.ts        # Server entry point
│   └── ...
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any features or bug fixes.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
