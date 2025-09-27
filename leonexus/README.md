# LeoNexus Car Marketplace

A Django REST API backend for a car marketplace platform where dealers can list vehicles and buyers can browse, review, and favorite cars.

## Features

### User Management
- User registration and authentication with role-based access (Buyer/Dealer)
- JWT token authentication
- Custom user profiles for dealers and buyers

### Car Listings
- Dealers can create, update, and delete car listings
- Car details include make, model, year, price, mileage, transmission, fuel type, and condition
- Image uploads for car galleries
- Advanced filtering and search capabilities

### Reviews & Favorites
- Buyers can review cars with ratings (1-5 stars)
- Favorite system for saving preferred vehicles
- Dealer cannot review their own listings

### Admin Panel
- Django admin interface for system administration
- User role management
- Content moderation capabilities

## Tech Stack

- **Backend**: Django, Django REST Framework
- **Database**: PostgreSQL (Production), SQLite (Development)
- **Authentication**: Token-based authentication
- **Image Handling**: Pillow for image processing
- **Deployment**: Render (Backend), Neon (Database)

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/users/` - User registration

### Cars
- `GET /api/cars/` - List all cars
- `POST /api/cars/` - Create car (dealers only)
- `GET /api/cars/{id}/` - Car details
- `PUT /api/cars/{id}/` - Update car (dealers only)
- `DELETE /api/cars/{id}/` - Delete car (dealers only)

### Categories
- `GET /api/categories/` - List categories

### Reviews
- `GET/POST /api/cars/{car_id}/reviews/` - Car reviews
- `PUT/DELETE /api/reviews/{id}/` - Manage reviews

### Favorites
- `GET/POST /api/favorites/` - User favorites
- `POST /api/cars/{car_id}/toggle-favorite/` - Toggle favorite

## Installation

1. Clone the repository
2. Create virtual environment: `python -m venv env`
3. Activate environment: `source env/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Set up environment variables in `.env`
6. Run migrations: `python manage.py migrate`
7. Create superuser: `python manage.py createsuperuser`
8. Start server: `python manage.py runserver`

## Environment Variables

```
SECRET_KEY=your-secret-key
DEBUG=True/False
DATABASE_URL=postgresql://user:pass@host:port/db
```

## Project Structure

```
leonexus/
├── listings/           # Main app containing models, views, serializers
├── leonexus/          # Project settings and configuration
├── manage.py          # Django management script
└── requirements.txt   # Project dependencies
```

## Models

- **User**: Custom user model with role-based access
- **Dealer**: Dealer profile information
- **Buyer**: Buyer profile information
- **Category**: Car categories (Sedan, SUV, etc.)
- **Car**: Vehicle listings with detailed specifications
- **CarImage**: Multiple images per car listing
- **Review**: Car reviews with ratings
- **Favorite**: User favorite cars

## License

This project is part of the ALX Project Nexus program.