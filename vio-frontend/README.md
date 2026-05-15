# VioApp Frontend

Premium real-time messenger application built with Next.js 14, Zustand, and Tailwind CSS.

## Features

- 🚀 **Real-time Messaging**: Socket.io integration for instant communication.
- 👥 **Group Management**: Standard groups and Topic-based Supergroups.
- 📞 **Voice Calls**: WebRTC-powered audio calls.
- 🔍 **Global Search**: Search users, chats, and messages across the app.
- 🌗 **Dark Mode**: Fully themed with custom brand color support.
- 📱 **PWA Support**: Installable on mobile and desktop with offline capabilities.
- 🎨 **Rich Aesthetics**: Modern glassmorphism design with smooth animations.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- VioApp Backend running (locally or remotely)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: Starts development server.
- `npm run build`: Creates production build.
- `npm run start`: Runs production server.
- `npm run test`: Runs unit tests.
- `npm run lint`: Checks for linting errors.

## Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable UI components.
- `src/store`: Zustand state management.
- `src/hooks`: Custom React hooks.
- `src/utils`: Helper functions and API configuration.
- `src/styles`: Global and component-specific styles.

## License

MIT
