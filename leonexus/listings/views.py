from django.shortcuts import render, get_object_or_404
from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg
from .models import User, Dealer, Category, Car, CarImage, Review, Favorite
from .serializers import (
    UserSerializer, UserProfileSerializer, DealerSerializer, 
    DealerCreateSerializer, CategorySerializer, CarListSerializer,
    CarDetailSerializer, CarCreateUpdateSerializer, CarImageSerializer,
    ReviewSerializer, ReviewCreateSerializer, FavoriteSerializer,
    FavoriteCreateSerializer
)

# Custom Permissions
class IsDealerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow dealers to edit cars.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'DEALER'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user.is_authenticated and 
            request.user.role == 'DEALER' and
            hasattr(request.user, 'dealer_profile') and
            obj.dealer == request.user.dealer_profile
        )

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners to edit their objects.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user

# User Views
class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

# Dealer Views
class DealerListView(generics.ListAPIView):
    queryset = Dealer.objects.all()
    serializer_class = DealerSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'address']

class DealerCreateView(generics.CreateAPIView):
    serializer_class = DealerCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Only users with DEALER role can create dealer profiles
        if self.request.user.role != 'DEALER':
            self.request.user.role = 'DEALER'
            self.request.user.save()
        serializer.save(user=self.request.user)

class DealerDetailView(generics.RetrieveUpdateAPIView):
    queryset = Dealer.objects.all()
    serializer_class = DealerSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(Dealer, user=self.request.user)

# Category Views
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

# Car Views - Main CRUD Operations
class CarListCreateView(generics.ListCreateAPIView):
    """
    GET /cars/ → list all cars (for buyers)
    POST /cars/ → create car (for dealers)
    """
    permission_classes = [IsDealerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['make', 'model', 'year', 'transmission', 'fuel_type', 'category']
    search_fields = ['title', 'make', 'model', 'location', 'description']
    ordering_fields = ['price', 'year', 'created_at', 'mileage']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Car.objects.filter(published=True)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Filter by year range
        min_year = self.request.query_params.get('min_year')
        max_year = self.request.query_params.get('max_year')
        if min_year:
            queryset = queryset.filter(year__gte=min_year)
        if max_year:
            queryset = queryset.filter(year__lte=max_year)
            
        return queryset.select_related('dealer', 'category').prefetch_related('images', 'reviews')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CarCreateUpdateSerializer
        return CarListSerializer

    def perform_create(self, serializer):
        # Ensure user has dealer profile
        if not hasattr(self.request.user, 'dealer_profile'):
            return Response(
                {'error': 'You must create a dealer profile first'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer.save(dealer=self.request.user.dealer_profile)

class CarDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /cars/<id>/ → retrieve car (for buyers)
    PUT /cars/<id>/ → update car (for dealers)
    DELETE /cars/<id>/ → delete car (for dealers)
    """
    queryset = Car.objects.all()
    permission_classes = [IsDealerOrReadOnly]

    def get_queryset(self):
        return Car.objects.select_related('dealer', 'category').prefetch_related('images', 'reviews__user')

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CarCreateUpdateSerializer
        return CarDetailSerializer

# Dealer's Car Management Views
class DealerCarListView(generics.ListAPIView):
    """List all cars for authenticated dealer"""
    serializer_class = CarListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not hasattr(self.request.user, 'dealer_profile'):
            return Car.objects.none()
        return Car.objects.filter(dealer=self.request.user.dealer_profile).select_related('category')

# Review Views
class CarReviewListCreateView(generics.ListCreateAPIView):
    """
    GET /cars/<car_id>/reviews/ → list reviews
    POST /cars/<car_id>/reviews/ → create review
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        car_id = self.kwargs['car_id']
        return Review.objects.filter(car_id=car_id).select_related('user')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReviewCreateSerializer
        return ReviewSerializer

    def perform_create(self, serializer):
        car_id = self.kwargs['car_id']
        car = get_object_or_404(Car, id=car_id, published=True)
        
        # Prevent dealers from reviewing their own cars
        if hasattr(self.request.user, 'dealer_profile') and car.dealer == self.request.user.dealer_profile:
            return Response(
                {'error': 'You cannot review your own car'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Prevent duplicate reviews
        if Review.objects.filter(user=self.request.user, car=car).exists():
            return Response(
                {'error': 'You have already reviewed this car'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save(user=self.request.user, car=car)

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Update/Delete own reviews"""
    queryset = Review.objects.all()
    serializer_class = ReviewCreateSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

# Favorite Views
class FavoriteListCreateView(generics.ListCreateAPIView):
    """
    GET /favorites/ → list user's favorites
    POST /favorites/ → add to favorites
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('car')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FavoriteCreateSerializer
        return FavoriteSerializer

class FavoriteDetailView(generics.DestroyAPIView):
    """DELETE /favorites/<id>/ → remove from favorites"""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

# Additional API Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite(request, car_id):
    """Toggle car favorite status"""
    car = get_object_or_404(Car, id=car_id, published=True)
    favorite, created = Favorite.objects.get_or_create(
        user=request.user, 
        car=car
    )
    
    if not created:
        favorite.delete()
        return Response({'favorited': False}, status=status.HTTP_200_OK)
    
    return Response({'favorited': True}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([AllowAny])
def car_stats(request):
    """Get general car statistics"""
    stats = {
        'total_cars': Car.objects.filter(published=True).count(),
        'total_dealers': Dealer.objects.count(),
        'average_price': Car.objects.filter(published=True).aggregate(
            avg_price=Avg('price')
        )['avg_price'] or 0,
        'makes': list(Car.objects.filter(published=True).values_list('make', flat=True).distinct()),
        'fuel_types': [choice[0] for choice in Car.FUEL_CHOICES],
        'transmissions': [choice[0] for choice in Car.TRANSMISSION_CHOICES],
    }
    return Response(stats)

@api_view(['GET'])
@permission_classes([AllowAny])
def search_suggestions(request):
    """Get search suggestions for autocomplete"""
    query = request.query_params.get('q', '')
    if len(query) < 2:
        return Response([])
    
    suggestions = []
    
    # Make suggestions
    makes = Car.objects.filter(
        make__icontains=query, published=True
    ).values_list('make', flat=True).distinct()[:5]
    
    # Model suggestions
    models = Car.objects.filter(
        model__icontains=query, published=True
    ).values_list('model', flat=True).distinct()[:5]
    
    # Location suggestions
    locations = Car.objects.filter(
        location__icontains=query, published=True
    ).values_list('location', flat=True).distinct()[:5]
    
    suggestions.extend([{'type': 'make', 'value': make} for make in makes])
    suggestions.extend([{'type': 'model', 'value': model} for model in models])
    suggestions.extend([{'type': 'location', 'value': location} for location in locations])
    
    return Response(suggestions[:10])
