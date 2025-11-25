# Smart Document Intelligence System

An AI-powered web application that analyzes PDF documents and extracts **key fields, summaries, risks, and action items** using **OCR + NLP + LLMs**.

🔗 **Live Demo:** https://project-a8srnf11z-abhis-projects-db8c8177.vercel.app/

---

## 🚀 Overview

The **Smart Document Intelligence System** helps users quickly understand long or complex documents like contracts, reports, policies, or legal files.

You can:

- Upload a PDF  
- Extract text via OCR  
- Run NLP analysis  
- Get:
  - Key fields & entities  
  - Summaries  
  - Risk highlights  
  - Action items  

All results are displayed in a clean **React dashboard**.

---

## ✨ Features

- 📄 **PDF Upload & Processing**  
- 👁️ **OCR (Tesseract / Google Vision)** for scanned PDFs  
- 🧠 **NLP Extraction**
  - Named Entity Recognition (NER)
  - Keywords  
  - Topics  
- 🤖 **AI Summaries & Risk Insights**
  - LangChain + Gemini/OpenAI  
- 📊 **Interactive React Dashboard**

---

## 🧩 Tech Stack

### **Frontend**
- React.js (Vite)
- Axios / Fetch
- Tailwind / CSS
- Hosted on **Vercel**

### **Backend**
- Python  
- Flask  
- Tesseract OCR  
- LangChain  
- Gemini/OpenAI API  
- Hosted on Render / Railway / etc.

---

## 🏗️ Architecture

```
[React Frontend] → API Request → [Flask Backend]
         |                              |
         |                            OCR
         |                              |
         ↓                              ↓
   Results Display ← LLM Summary ← LangChain
```

---

## 📁 Project Structure (Example)

```
smart-document-intelligence/
├── frontend/
│   ├── src/
│   └── package.json
└── backend/
    ├── app.py
    ├── requirements.txt
    ├── ocr/
    ├── nlp/
    └── ai/
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env` — DO NOT commit)

```
GEMINI_API_KEY=your_gemini_or_openai_key_here
```

(If using Google Vision:)

```
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### Frontend (`frontend/.env`)

```
VITE_API_BASE_URL=https://your-backend-url.com
```

---

## 🛠️ Running Locally

### 1️⃣ Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Runs at:

```
http://localhost:5000
```

---

### 2️⃣ Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Runs at:

```
http://localhost:5173
```

---

## 🌐 Deployment

### Frontend (Vercel)

1. Run `vercel` from `frontend/`
2. Add env variable in Vercel:

```
VITE_API_BASE_URL=https://your-backend-host.com
```

Your deployed link:

👉 **https://project-a8srnf11z-abhis-projects-db8c8177.vercel.app/**

---

### Backend (Render / Railway)

- Upload `backend/` folder  
- Add env var:

```
GEMINI_API_KEY=xxxx
```

---

## 🔍 API Example

**POST** `/api/analyze-document`  

Request:

```bash
curl -X POST http://localhost:5000/api/analyze-document \
  -F "file=@sample.pdf"
```

Response example:

```json
{
  "text": "Extracted text...",
  "summary": "Short explanation...",
  "risks": ["High penalty clause", "No SLA specified"],
  "actions": ["Clarify terms", "Confirm pricing"],
  "entities": [
    { "type": "ORG", "value": "XYZ Corp" },
    { "type": "DATE", "value": "2025-01-01" }
  ]
}
```

---

## 🧠 Future Enhancements

- Multi-language OCR  
- Export report as PDF  
- Authentication + user history  
- Domain-specific risk models  

---

## 👤 Author

**Anil Jyothi Abhishek**

- 🌐 Portfolio: https://abhi-portfolio-eta.vercel.app/  
- 🔗 LinkedIn: https://www.linkedin.com/in/anil-jyothi-abhishek-765593271  
- 🐙 GitHub: https://github.com/AJ-Abhishek-00
