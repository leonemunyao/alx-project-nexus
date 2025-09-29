# LeoNexus - Frontend & Backend Integration

This document outlines the integration between the React frontend and Django backend for the LeoNexus car marketplace.

## 🚀 Quick Start

### Backend Setup (Django)

1. **Navigate to the backend directory:**
   ```bash
   cd leonexus
   ```

2. **Activate virtual environment:**
   ```bash
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Create test users:**
   ```bash
   python create_test_user.py
   ```

6. **Start the development server:**
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup (React + Vite)

1. **Navigate to the frontend directory:**
   ```bash
   cd leonexusfrontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## 🔐 Authentication System

### Features Implemented

- ✅ **Email or Username Login**: Users can sign in with either their email address or username
- ✅ **Role-based Authentication**: Separate authentication for Dealers and Buyers
- ✅ **Protected Routes**: Dashboard access is restricted based on user role
- ✅ **Token-based Authentication**: Secure API communication using Django REST Framework tokens
- ✅ **CORS Configuration**: Properly configured for frontend-backend communication

### Test Credentials

After running `python create_test_user.py`, you can use these credentials:

**Dealer Account:**
- Username: `testdealer` or Email: `dealer@test.com`
- Password: `testpass123`

**Buyer Account:**
- Username: `testbuyer` or Email: `buyer@test.com`
- Password: `testpass123`

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout

### User Management
- `GET /api/users/profile/` - Get current user profile
- `POST /api/dealers/create/` - Create dealer profile
- `POST /api/buyers/create/` - Create buyer profile
- `GET /api/dealers/profile/` - Get dealer profile
- `GET /api/buyers/profile/` - Get buyer profile

## 🎯 User Flows

### Dealer Sign-In Flow

1. User visits `/signin`
2. Enters email/username and password
3. Frontend sends credentials to `/api/auth/login/`
4. Backend validates credentials and returns user data + token
5. Frontend stores token and user data
6. User is redirected to `/dashboard` (dealer dashboard)
7. Protected route verifies user role and grants access

### Buyer Sign-In Flow

1. User visits `/signin`
2. Enters email/username and password
3. Frontend sends credentials to `/api/auth/login/`
4. Backend validates credentials and returns user data + token
5. Frontend stores token and user data
6. User is redirected to `/buyer-dashboard`
7. Protected route verifies user role and grants access

## 🔧 Configuration

### Backend Configuration

The backend is configured with:
- Custom authentication backend supporting email/username login
- CORS headers for frontend communication
- Token authentication for API security
- Role-based permissions

### Frontend Configuration

The frontend is configured with:
- React Context for authentication state management
- Protected route components
- API service layer for backend communication
- Environment-based API URL configuration

## 🚀 Deployment

### Backend (Render)
- Backend is deployed on Render at: `https://alx-project-nexus-3ow0.onrender.com`
- Environment variables are configured in Render dashboard
- Database is PostgreSQL (configured via DATABASE_URL)

### Frontend (Vercel)
- Frontend should be deployed on Vercel
- Update `VITE_API_BASE_URL` environment variable to point to production backend
- Configure CORS settings in backend for production domain

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS settings include your frontend domain
2. **Authentication Failures**: Check that user exists in database and credentials are correct
3. **Token Issues**: Verify token is being stored and sent with API requests
4. **Role-based Access**: Ensure user has correct role and profile created

### Debug Steps

1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check network tab for failed requests
4. Verify user data in Django admin
5. Check backend logs for errors

## 📝 Next Steps

1. **Complete Car Management**: Connect car CRUD operations
2. **Image Upload**: Implement car image upload functionality
3. **Search & Filtering**: Connect search and filtering features
4. **User Registration**: Complete sign-up flow
5. **Profile Management**: Add profile editing capabilities

## 🤝 Contributing

When making changes:
1. Test both frontend and backend locally
2. Ensure all API endpoints are working
3. Update this README if adding new features
4. Test with both dealer and buyer accounts
