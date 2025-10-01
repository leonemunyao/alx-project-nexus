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
    
    # Dealership URLs
    path('dealerships/', views.DealershipListView.as_view(), name='dealership-list'),
    path('dealerships/<int:pk>/', views.DealershipDetailView.as_view(), name='dealership-detail'),
    path('dealerships/create/', views.DealershipCreateView.as_view(), name='dealership-create'),
    path('dealerships/profile/', views.DealershipUpdateView.as_view(), name='dealership-profile'),
    path('dealerships/toggle-publish/', views.toggle_dealership_publish, name='dealership-toggle-publish'),
    path('dealerships/stats/', views.dealership_stats, name='dealership-stats'),
    
    # Dealer Car Management URLs
    path('dealers/cars/', views.DealerCarListView.as_view(), name='dealer-cars'),
    path('dealers/cars/create/', views.DealerCarCreateView.as_view(), name='dealer-car-create'),
    path('dealers/cars/<int:pk>/', views.DealerCarDetailView.as_view(), name='dealer-car-detail'),
    path('dealers/cars/bulk-publish/', views.bulk_toggle_car_publish, name='bulk-toggle-car-publish'),
    
    # Category URLs
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/create/', views.CategoryCreateView.as_view(), name='category-create'),
    
    # Car URLs - Main CRUD Operations
    path('cars/', views.CarListCreateView.as_view(), name='car-list-create'),
    path('cars/<int:pk>/', views.CarDetailView.as_view(), name='car-detail'),
    
    # Review URLs
    path('cars/<int:car_id>/reviews/', views.CarReviewListView.as_view(), name='car-reviews-list'),
    path('cars/<int:car_id>/reviews/create/', views.CarReviewCreateView.as_view(), name='car-reviews-create'),
    path('reviews/<int:pk>/', views.ReviewDetailView.as_view(), name='review-detail'),
    
    # Favorite URLs
    path('favorites/', views.FavoriteListCreateView.as_view(), name='favorite-list-create'),
    path('favorites/<int:pk>/', views.FavoriteDetailView.as_view(), name='favorite-detail'),
    path('cars/<int:car_id>/toggle-favorite/', views.toggle_favorite, name='toggle-favorite'),
    
]
