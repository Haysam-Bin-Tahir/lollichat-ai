# 
<p align="center">
  <h1 align="center">Lollichat</h1>
</p>

<p align="center">
  A personal AI assistant designed for supportive and empathetic conversations.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#deployment"><strong>Deployment</strong></a>
</p>
<br/>

## Features

- **AI-Powered Conversations**
  - Natural language processing for fluid, human-like interactions
  - Context-aware responses for personalized conversations
  - Voice note support for enhanced communication
  - Real-time response generation

- **User Experience**
  - Modern, responsive interface built with Next.js
  - Secure authentication with Auth0
  - Subscription-based access model
  - Cross-platform compatibility

- **Security & Privacy**
  - GDPR-compliant data handling
  - End-to-end encryption for conversations
  - Secure payment processing
  - Comprehensive privacy policy

- **Data Management**
  - Persistent chat history
  - Secure user data storage
  - Efficient file management
  - Automated backup systems

## Tech Stack

- **Frontend**
  - Next.js 14 with App Router
  - React Server Components
  - Tailwind CSS for styling
  - shadcn/ui components
  - Radix UI primitives

- **Backend**
  - Vercel AI SDK for LLM integration
  - Auth0 for authentication
  - Vercel Postgres for data storage
  - Vercel Blob for file storage

- **AI & ML**
  - Advanced language model integration
  - Custom prompt engineering
  - Context management
  - Response optimization

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lollichat.git
cd lollichat
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file based on `.env.example` with your configuration:
- Auth0 credentials
- Database connection string
- AI model API keys
- Other necessary environment variables

4. Run the development server:
```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Deployment

Lollichat is designed to be deployed on Vercel. Follow these steps to deploy your instance:

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Configure the following environment variables:
   - `AUTH_SECRET`
   - `AUTH0_CLIENT_ID`
   - `AUTH0_CLIENT_SECRET`
   - `AUTH0_ISSUER`
   - `DATABASE_URL`
   - `AI_API_KEY`

4. Deploy your project

