from django.urls import path
from . import views

app_name = 'listings'

urlpatterns = [
    # User URLs
    path('users/', views.UserListCreateView.as_view(), name='user-list-create'),
    path('users/profile/', views.UserDetailView.as_view(), name='user-profile'),
    
    # Dealer URLs
    path('dealers/', views.DealerListView.as_view(), name='dealer-list'),
    path('dealers/create/', views.DealerCreateView.as_view(), name='dealer-create'),
    path('dealers/profile/', views.DealerDetailView.as_view(), name='dealer-profile'),
    path('dealers/cars/', views.DealerCarListView.as_view(), name='dealer-cars'),
    
    # Category URLs
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    
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