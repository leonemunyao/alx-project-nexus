# LeoNexus Frontend

A modern, responsive car marketplace frontend built with React, TypeScript, and cutting-edge web technologies. This application provides a comprehensive platform for car dealers and buyers to interact, manage inventory, and facilitate car sales.

## 🚀 Overview

LeoNexus Frontend is a feature-rich single-page application (SPA) that serves as the user interface for a car marketplace platform. It offers distinct experiences for two main user types:

- **Dealers**: Comprehensive dashboard for inventory management, dealership profile management, and car listing operations
- **Buyers**: Browse cars, view details, manage favorites, and interact with dealerships

## 🛠 Technology Stack

### Core Framework & Tools
- **React 18.3.1** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development with strict typing
- **Vite 5.4.19** - Lightning-fast build tool and development server
- **React Router DOM 6.30.1** - Client-side routing and navigation

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library built on Radix UI
- **Radix UI Primitives** - Low-level UI primitives for accessibility
- **Lucide React** - Beautiful icon library
- **Class Variance Authority** - For component variant management

### State Management & Data Fetching
- **TanStack React Query 5.83.0** - Server state management and caching
- **React Context API** - Authentication and global state management
- **React Hook Form 7.61.1** - Performant form management with validation
- **Zod 3.25.76** - Schema validation for forms and API responses

### Development & Quality
- **ESLint** - Code linting and style enforcement
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Autoprefixer** - Automatic CSS vendor prefixing
- **SWC** - Fast compilation via Vite React SWC plugin

## 🏗 Architecture & Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── AddCarDialog.tsx # Car creation modal
│   ├── EditCarDialog.tsx # Car editing modal
│   ├── DealershipDialog.tsx # Dealership profile management
│   └── ...
├── pages/              # Route components
│   ├── Dashboard.tsx   # Dealer dashboard
│   ├── BuyerDashboard.tsx # Buyer dashboard
│   ├── Cars.tsx        # Car listings page
│   └── ...
├── contexts/           # React Context providers
│   └── AuthContext.tsx # Authentication state management
├── services/           # API integration layer
│   └── api.ts          # Complete API service
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── config/             # Configuration files
```

## 🔐 Authentication System

The application implements a robust JWT-based authentication system:

- **Token-based Authentication**: Secure JWT tokens for API communication
- **Role-based Access Control**: Separate interfaces for dealers and buyers
- **Protected Routes**: Route guards based on authentication status and user roles
- **Persistent Sessions**: Automatic token refresh and session management

## 🎨 Design System

### Component Library
Built on **shadcn/ui** components providing:
- Consistent design language across the application
- Accessibility-first approach with ARIA compliance
- Dark/light theme support
- Responsive design patterns

### Styling Approach
- **Utility-first CSS** with Tailwind CSS
- **Component variants** using Class Variance Authority
- **Responsive design** with mobile-first approach
- **Custom gradients and animations** for enhanced UX

## 📱 Key Features

### For Dealers
- **Inventory Management**: Add, edit, delete, and manage car listings
- **Dealership Profile**: Create and manage comprehensive dealership profiles
- **Image Uploads**: Support for multiple car images with preview
- **Dashboard Analytics**: Overview of listings, performance metrics
- **Specialty Management**: Tag dealerships with specializations

### For Buyers
- **Car Browsing**: Advanced search and filtering capabilities
- **Detailed Views**: Comprehensive car information with image galleries
- **Favorites System**: Save and manage favorite listings
- **Dealer Discovery**: Browse and contact dealerships

### Shared Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Real-time Updates**: Live data synchronization
- **Toast Notifications**: User feedback for all actions
- **Loading States**: Skeleton loaders and loading indicators

## 🔌 API Integration

The frontend communicates with a Django REST API backend through a comprehensive service layer:

```typescript
// Example API structure
const api = {
  auth: {
    login, logout, register, getCurrentUser
  },
  cars: {
    getAll, getById, create, update, delete
  },
  dealerships: {
    getProfile, create, update, getAll
  },
  // ... more endpoints
}
```

### Data Management
- **Centralized API calls** in `services/api.ts`
- **Type-safe responses** with TypeScript interfaces
- **Error handling** with proper user feedback
- **Request/response interceptors** for auth token management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with ES6+ support

### Installation & Development

```bash
# Clone the repository
git clone <repository-url>
cd leonexusfrontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```


## 📦 Build & Deployment

### Development Build
```bash
npm run build:dev
```

### Production Build
```bash
npm run build
```

The application builds to static files optimized for:
- **Code splitting** for optimal loading performance
- **Tree shaking** to eliminate unused code
- **Asset optimization** with automatic compression
- **Modern browser targets** with fallbacks

### Deployment Options
- **Vercel** (recommended) - Zero-config deployment
- **Netlify** - JAMstack deployment
- **Traditional hosting** - Static file serving

## 🧪 Code Quality & Standards

### TypeScript Configuration
- Strict type checking enabled
- Path mapping for clean imports (`@/components/...`)
- Modern ES2022 target compilation

### ESLint Configuration
- React-specific rules and best practices
- TypeScript integration
- Automatic code formatting suggestions

### Component Standards
- Functional components with hooks
- Props interfaces for type safety
- Consistent naming conventions
- Modular and reusable design patterns

## 🔮 Future Enhancements

- **Progressive Web App (PWA)** capabilities
- **Real-time messaging** between dealers and buyers
- **Advanced search filters** with location-based results
- **Payment integration** for car transactions
- **Mobile app** using React Native
- **Internationalization (i18n)** support

## 🤝 Contributing

1. Follow the established TypeScript and React patterns
2. Ensure all components are properly typed
3. Write descriptive commit messages
4. Test thoroughly across different screen sizes
5. Maintain consistent code formatting with ESLint

---

*Built with ❤️ using modern web technologies for the next generation of car marketplace experiences.*
