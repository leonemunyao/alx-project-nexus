from django.shortcuts import render, get_object_or_404
from rest_framework import generics, status, permissions, filters, parsers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Max
from django.db import models
from .models import User, Dealer, Category, Car, CarImage, Review, Favorite, Buyer, Dealership
from .serializers import (
    UserSerializer, UserProfileSerializer, DealerSerializer, 
    DealerCreateSerializer, CategorySerializer, CarListSerializer,
    DealerCarListSerializer, CarDetailSerializer, CarCreateUpdateSerializer, CarImageSerializer,
    ReviewSerializer, ReviewCreateSerializer, FavoriteSerializer,
    FavoriteCreateSerializer, BuyerSerializer, BuyerCreateSerializer,
    DealershipSerializer, DealershipCreateUpdateSerializer
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

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        # Prepare response data
        response_data = {
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role
        }
        
        # Add dealer profile information if user is a dealer
        if user.role == 'DEALER' and hasattr(user, 'dealer_profile'):
            dealer = user.dealer_profile
            response_data['dealer_profile'] = {
                'id': dealer.id,
                'first_name': dealer.first_name,
                'last_name': dealer.last_name,
                'phone': dealer.phone,
                'address': dealer.address,
                'created_at': dealer.created_at.isoformat()
            }
        
        # Add buyer profile information if user is a buyer
        if user.role == 'BUYER' and hasattr(user, 'buyer_profile'):
            buyer = user.buyer_profile
            response_data['buyer_profile'] = {
                'id': buyer.id,
                'first_name': buyer.first_name,
                'last_name': buyer.last_name,
                'phone': buyer.phone,
                'created_at': buyer.created_at.isoformat()
            }
        
        return Response(response_data)

class CustomLogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_200_OK)

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

class BuyerListView(generics.ListAPIView):
    queryset = Buyer.objects.all()
    serializer_class = BuyerSerializer
    permission_classes = [AllowAny]

class BuyerCreateView(generics.CreateAPIView):
    serializer_class = BuyerCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Only users with BUYER role can create buyer profiles
        if self.request.user.role != 'BUYER':
            self.request.user.role = 'BUYER'
            self.request.user.save()
        serializer.save(user=self.request.user)

class BuyerDetailView(generics.RetrieveUpdateAPIView):
    queryset = Buyer.objects.all()
    serializer_class = BuyerSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(Buyer, user=self.request.user)

# Category Views
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class CategoryCreateView(generics.CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]

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
            
        return queryset.select_related('dealer', 'category').prefetch_related('images', 'reviews', 'dealer__cars')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CarCreateUpdateSerializer
        return CarListSerializer

    def perform_create(self, serializer):
        # Ensure user has dealer profile
        if not hasattr(self.request.user, 'dealer_profile'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'error': 'You must create a dealer profile first'})
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

    def get_object(self):
        obj = super().get_object()
        # For dealers, ensure they can only access their own cars for write operations
        if self.request.method not in ['GET', 'HEAD', 'OPTIONS']:
            if (hasattr(self.request.user, 'dealer_profile') and 
                obj.dealer != self.request.user.dealer_profile):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only modify your own cars.")
        return obj

# Dealer's Car Management Views
class DealerCarListView(generics.ListAPIView):
    """List all cars for authenticated dealer"""
    serializer_class = DealerCarListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not hasattr(self.request.user, 'dealer_profile'):
            return Car.objects.none()
        return Car.objects.filter(dealer=self.request.user.dealer_profile).select_related('category').prefetch_related('images')

class DealerCarCreateView(generics.CreateAPIView):
    """Create a new car listing for authenticated dealer"""
    serializer_class = CarCreateUpdateSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]

    def perform_create(self, serializer):
        # Ensure user has dealer profile
        if not hasattr(self.request.user, 'dealer_profile'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'error': 'You must create a dealer profile first'})
        
        car = serializer.save(dealer=self.request.user.dealer_profile)
        
        # Handle image uploads
        uploaded_images = self.request.FILES.getlist('uploaded_images')
        if uploaded_images:
            for index, image in enumerate(uploaded_images):
                CarImage.objects.create(car=car, image=image, order=index)
        
        return car

class DealerCarDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a specific car for authenticated dealer"""
    serializer_class = CarDetailSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]

    def get_queryset(self):
        if not hasattr(self.request.user, 'dealer_profile'):
            return Car.objects.none()
        return Car.objects.filter(dealer=self.request.user.dealer_profile).select_related('dealer', 'category').prefetch_related('images', 'reviews__user')

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CarCreateUpdateSerializer
        return CarDetailSerializer

    def get_object(self):
        obj = super().get_object()
        # Ensure dealer can only access their own cars
        if obj.dealer != self.request.user.dealer_profile:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only access your own cars.")
        return obj

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Handle image uploads
        uploaded_images = request.FILES.getlist('uploaded_images')
        if uploaded_images:
            # Get the current max order
            current_max_order = instance.images.aggregate(max_order=Max("order"))["max_order"] or -1
            
            for index, image in enumerate(uploaded_images):
                CarImage.objects.create(
                    car=instance,
                    image=image,
                    order=current_max_order + index + 1,
                )
        
        # Return the updated instance using the detail serializer
        detail_serializer = CarDetailSerializer(instance, context={'request': request})
        return Response(detail_serializer.data)

# Review Views
class CarReviewListView(generics.ListAPIView):
    """
    GET /cars/<car_id>/reviews/ → list reviews for a specific car
    """
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        car_id = self.kwargs['car_id']
        return Review.objects.filter(car_id=car_id).select_related('user')

class CarReviewCreateView(generics.CreateAPIView):
    """
    POST /cars/<car_id>/reviews/create/ → create review for a specific car
    """
    serializer_class = ReviewCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        car_id = self.kwargs['car_id']
        car = get_object_or_404(Car, id=car_id, published=True)
        
        # Prevent dealers from reviewing their own cars
        if hasattr(self.request.user, 'dealer_profile') and car.dealer == self.request.user.dealer_profile:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'error': 'You cannot review your own car'})
        
        # Prevent duplicate reviews
        if Review.objects.filter(user=self.request.user, car=car).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'error': 'You have already reviewed this car'})
        
        serializer.save(user=self.request.user, car=car)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            self.perform_create(serializer)
        except ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        
        # Return the created review using the full ReviewSerializer
        review = serializer.instance
        review_serializer = ReviewSerializer(review, context={'request': request})
        return Response(review_serializer.data, status=status.HTTP_201_CREATED)

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

# Dealership Views
class DealershipListView(generics.ListAPIView):
    """List all published dealerships for public viewing"""
    queryset = Dealership.objects.filter(published=True)
    serializer_class = DealershipSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'specialties']
    ordering_fields = ['name', 'created_at', 'total_cars', 'average_rating']
    ordering = ['-created_at']

    def get_queryset(self):
        return Dealership.objects.filter(published=True).select_related('dealer__user').prefetch_related('dealer__cars')

class DealershipDetailView(generics.RetrieveAPIView):
    """Get specific dealership details"""
    queryset = Dealership.objects.all()
    serializer_class = DealershipSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Dealership.objects.select_related('dealer__user').prefetch_related('dealer__cars')

class DealershipCreateView(generics.CreateAPIView):
    """Create dealership profile for authenticated dealer"""
    serializer_class = DealershipCreateUpdateSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]

    def perform_create(self, serializer):
        # Ensure user has dealer profile
        if not hasattr(self.request.user, 'dealer_profile'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'error': 'You must create a dealer profile first'})
        
        # Check if dealership already exists
        if hasattr(self.request.user.dealer_profile, 'dealership'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'error': 'Dealership profile already exists'})
        
        serializer.save(dealer=self.request.user.dealer_profile)

class DealershipUpdateView(generics.RetrieveUpdateAPIView):
    """Update dealership profile for authenticated dealer"""
    serializer_class = DealershipCreateUpdateSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]

    def get_object(self):
        if not hasattr(self.request.user, 'dealer_profile'):
            from rest_framework.exceptions import NotFound
            raise NotFound("Dealer profile not found")
        
        if not hasattr(self.request.user.dealer_profile, 'dealership'):
            from rest_framework.exceptions import NotFound
            raise NotFound("Dealership profile not found")
        
        return self.request.user.dealer_profile.dealership

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return DealershipSerializer
        return DealershipCreateUpdateSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_dealership_publish(request):
    """Toggle dealership publish status"""
    try:
        if not hasattr(request.user, 'dealer_profile'):
            return Response({'error': 'Dealer profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not hasattr(request.user.dealer_profile, 'dealership'):
            return Response({'error': 'Dealership profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        dealership = request.user.dealer_profile.dealership
        dealership.published = not dealership.published
        dealership.save()
        
        return Response({
            'published': dealership.published,
            'message': f'Dealership {"published" if dealership.published else "unpublished"} successfully'
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_toggle_car_publish(request):
    """Bulk toggle car publish status"""
    try:
        if not hasattr(request.user, 'dealer_profile'):
            return Response({'error': 'Dealer profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        car_ids = request.data.get('car_ids', [])
        action = request.data.get('action', 'publish')  # 'publish' or 'unpublish'
        
        if not car_ids or not isinstance(car_ids, list):
            return Response({'error': 'car_ids must be a non-empty list'}, status=status.HTTP_400_BAD_REQUEST)
        
        if action not in ['publish', 'unpublish']:
            return Response({'error': 'action must be either "publish" or "unpublish"'}, status=status.HTTP_400_BAD_REQUEST)
        
        dealer = request.user.dealer_profile
        cars = Car.objects.filter(id__in=car_ids, dealer=dealer)
        
        if cars.count() != len(car_ids):
            return Response({'error': 'Some cars not found or not owned by dealer'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update cars
        published_status = action == 'publish'
        updated_count = cars.update(published=published_status)
        
        return Response({
            'message': f'{updated_count} cars {"published" if published_status else "unpublished"} successfully',
            'updated_count': updated_count,
            'action': action
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def dealership_stats(request):
    """Get dealership statistics"""
    stats = {
        'total_dealerships': Dealership.objects.count(),
        'verified_dealerships': Dealership.objects.filter(is_verified=True).count(),
        'published_dealerships': Dealership.objects.filter(published=True).count(),
        'total_cars_listed': sum(dealership.total_cars for dealership in Dealership.objects.all()),
        'average_rating': Dealership.objects.aggregate(
            avg_rating=Avg('dealer__cars__reviews__rating')
        )['avg_rating'] or 0,
        'specialties': list(set([
            specialty for dealership in Dealership.objects.all() 
            for specialty in dealership.specialties
        ])),
    }
    return Response(stats)
