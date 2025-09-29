from django.urls import path
from . import views

app_name = 'listings'

urlpatterns = [
    # Authentication
    path('auth/login/', views.CustomAuthToken.as_view(), name='auth-login'),
    path('auth/logout/', views.CustomLogoutView.as_view(), name='auth-logout'),

    # User URLs
    path('users/', views.UserListCreateView.as_view(), name='user-list-create'),
    path('users/profile/', views.UserDetailView.as_view(), name='user-profile'),

        # Buyer URLs
    path('buyers/', views.BuyerListView.as_view(), name='buyer-list'),
    path('buyers/create/', views.BuyerCreateView.as_view(), name='buyer-create'),
    path('buyers/profile/', views.BuyerDetailView.as_view(), name='buyer-profile'),
    
    # Dealer URLs
    path('dealers/', views.DealerListView.as_view(), name='dealer-list'),
    path('dealers/create/', views.DealerCreateView.as_view(), name='dealer-create'),
    path('dealers/profile/', views.DealerDetailView.as_view(), name='dealer-profile'),
    
    # Dealer Car Management URLs
    path('dealers/cars/', views.DealerCarListView.as_view(), name='dealer-cars'),
    path('dealers/cars/create/', views.DealerCarCreateView.as_view(), name='dealer-car-create'),
    path('dealers/cars/<int:pk>/', views.DealerCarDetailView.as_view(), name='dealer-car-detail'),
    
    # Category URLs
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/create/', views.CategoryCreateView.as_view(), name='category-create'),
    
    # Car URLs - Main CRUD Operations
    path('cars/', views.CarListCreateView.as_view(), name='car-list-create'),
    path('cars/<int:pk>/', views.CarDetailView.as_view(), name='car-detail'),
    
    # Review URLs
    path('cars/<int:car_id>/reviews/', views.CarReviewListCreateView.as_view(), name='car-reviews'),
    path('reviews/<int:pk>/', views.ReviewDetailView.as_view(), name='review-detail'),
    
    # Favorite URLs
    path('favorites/', views.FavoriteListCreateView.as_view(), name='favorite-list-create'),
    path('favorites/<int:pk>/', views.FavoriteDetailView.as_view(), name='favorite-detail'),
    path('cars/<int:car_id>/toggle-favorite/', views.toggle_favorite, name='toggle-favorite'),
    
    # Additional API endpoints
    path('stats/', views.car_stats, name='car-stats'),
    path('search-suggestions/', views.search_suggestions, name='search-suggestions'),
]
