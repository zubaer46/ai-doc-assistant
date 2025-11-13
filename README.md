# 🤖 AI Document Assistant

An intelligent full-stack application that allows users to upload documents and interact with them using AI-powered chat. Ask questions, get summaries, simplify complex text, and export your Q&A sessions.

## ✨ Features

- 📄 **Document Upload** - Support for PDF, DOCX, and TXT files (up to 10MB)
- 💬 **AI-Powered Chat** - Ask questions about your documents and get intelligent answers
- 📝 **Smart Summarization** - Generate concise summaries of your documents
- 🔍 **Text Simplification** - Simplify complex text for better understanding
- 💾 **Session Persistence** - Your session is saved locally, so you can continue where you left off
- 📋 **Export Notes** - Download your Q&A conversation as a markdown file
- 🎨 **Modern UI** - Clean, responsive interface with smooth animations
- ⚡ **Fast & Efficient** - Built with modern technologies for optimal performance

## 🏗️ Tech Stack

### Backend

- **Node.js** + **Express** - RESTful API server
- **TypeScript** - Type-safe code
- **OpenAI GPT-3.5** - AI language model for document analysis
- **Multer** - File upload handling
- **pdf-parse** - PDF text extraction
- **mammoth** - DOCX text extraction

### Frontend

- **React 18** + **TypeScript** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **React Query** - Server state management
- **Axios** - HTTP client
- **React Router** - Navigation

## 📋 Prerequisites

- **Node.js** 18+ (recommended: 20.11.0)
- **npm** or **yarn**
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-doc-assistant
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGIN=http://localhost:3000
```

Start the backend server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
ai-doc-assistant/
├── backend/                      # Express TypeScript API
│   ├── src/
│   │   ├── index.ts             # Main server entry
│   │   ├── controllers/         # Request handlers
│   │   ├── middleware/          # Multer file upload config
│   │   ├── routes/              # API routes
│   │   ├── types/               # TypeScript types
│   │   └── utils/
│   │       ├── documentProcessor.ts  # Text extraction
│   │       └── openaiService.ts      # OpenAI integration
│   ├── uploads/                 # Uploaded files directory
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                    # React TypeScript app
    ├── src/
    │   ├── components/          # React components
    │   │   ├── FileUpload.tsx   # Document upload interface
    │   │   ├── ChatInterface.tsx # Chat interface
    │   │   ├── DocumentActions.tsx # Action buttons
    │   │   └── ui/              # shadcn/ui components
    │   ├── hooks/               # Custom React hooks
    │   ├── services/            # API service functions
    │   ├── lib/                 # Utilities and config
    │   ├── types/               # TypeScript types
    │   ├── App.tsx              # Main app component
    │   └── main.tsx             # Entry point
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    └── vite.config.ts
```

## 🔌 API Endpoints

### Upload Document

```http
POST /api/upload
Content-Type: multipart/form-data

Body: file (PDF, DOCX, or TXT)

Response:
{
  "sessionId": "uuid",
  "filename": "document.pdf",
  "preview": "First 200 characters...",
  "message": "Document uploaded and processed successfully"
}
```

### Chat with Document

```http
POST /api/chat
Content-Type: application/json

Body:
{
  "sessionId": "uuid",
  "question": "What is this document about?"
}

Response:
{
  "answer": "AI-generated answer...",
  "citations": ["relevant excerpts"],
  "conversationHistory": [...]
}
```

### Summarize Document

```http
POST /api/summarize
Content-Type: application/json

Body:
{
  "sessionId": "uuid"
}

Response:
{
  "summary": "Document summary..."
}
```

### Simplify Text

```http
POST /api/simplify
Content-Type: application/json

Body:
{
  "sessionId": "uuid",
  "text": "Complex text to simplify..."
}

Response:
{
  "simplifiedText": "Easier to understand text..."
}
```

### Export Notes

```http
POST /api/export
Content-Type: application/json

Body:
{
  "sessionId": "uuid"
}

Response:
{
  "markdown": "# Q&A Session\n\n..."
}
```

## 🎯 Usage Guide

1. **Upload a Document**

   - Click "Choose File" or drag-and-drop a PDF, DOCX, or TXT file
   - Wait for the upload to complete (you'll see a success message)

2. **Chat with Your Document**

   - Type questions in the chat interface
   - The AI will analyze your document and provide intelligent answers
   - Conversation history is maintained throughout your session

3. **Use Quick Actions**

   - **Summarize**: Get a concise overview of your entire document
   - **Simplify**: Select text in the chat and click "Simplify" to make it easier to understand
   - **Export**: Download your Q&A session as a markdown file

4. **Start Fresh**
   - Click "New Document" to upload a different file
   - Your previous session data will be cleared

## 🔧 Development

### Backend Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Run production server
```

### Frontend Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🌐 Environment Variables

### Backend (.env)

| Variable         | Description         | Default    |
| ---------------- | ------------------- | ---------- |
| `PORT`           | Server port         | `5000`     |
| `OPENAI_API_KEY` | OpenAI API key      | _required_ |
| `CORS_ORIGIN`    | Allowed CORS origin | `*`        |

### Frontend (.env)

| Variable       | Description     | Default                     |
| -------------- | --------------- | --------------------------- |
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |

## 📦 Build for Production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
# The build output will be in the 'dist' folder
```

Deploy the `frontend/dist` folder to any static hosting service (Vercel, Netlify, etc.) and the backend to a Node.js hosting platform (Railway, Render, etc.).


## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for the GPT-3.5 API
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Radix UI](https://www.radix-ui.com/) for accessible primitives

## 💡 Tips

- **File Size**: Keep documents under 10MB for optimal performance
- **API Key**: Never commit your `.env` file with API keys to version control
- **Session Storage**: Sessions are stored in browser localStorage and server memory
- **Supported Formats**: PDF, DOCX, and TXT files are fully supported

## 🐛 Troubleshooting

**Upload fails:**

- Check file size (must be under 10MB)
- Ensure file format is PDF, DOCX, or TXT
- Verify backend server is running

**Chat not working:**

- Verify OpenAI API key is correctly set in backend `.env`
- Check browser console for errors
- Ensure you've uploaded a document first

**CORS errors:**

- Update `CORS_ORIGIN` in backend `.env` to match your frontend URL
- Restart the backend server after changing environment variables

---

Made with ❤️ using React, TypeScript, and OpenAI
