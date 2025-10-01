from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import models
from .models import User, Dealer, Category, Car, CarImage, Review, Favorite, Buyer, Dealership

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'password', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True},
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile without sensitive data"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'role', 'date_joined']
        read_only_fields = ['id', 'username', 'date_joined']

class DealerSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    car_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Dealer
        fields = ['id', 'user', 'first_name', 'last_name', 'phone', 'address', 'car_count']
    
    def get_car_count(self, obj):
        # Use prefetched data if available to avoid N+1 queries
        if hasattr(obj, '_prefetched_objects_cache') and 'cars' in obj._prefetched_objects_cache:
            return len([car for car in obj._prefetched_objects_cache['cars'] if car.published])
        return obj.cars.filter(published=True).count()

class DealerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating dealer profiles"""
    class Meta:
        model = Dealer
        fields = ['first_name', 'last_name', 'phone', 'address']

class BuyerSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'user', 'first_name', 'last_name', 'email', 'date_joined']
        read_only_fields = ['id', 'username', 'date_joined']

class BuyerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating buyer profiles"""
    class Meta:
        model = Buyer
        fields = ['first_name', 'last_name', 'phone']

class DealershipSerializer(serializers.ModelSerializer):
    """Serializer for dealership profiles with computed fields"""
    dealer = DealerSerializer(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    total_cars = serializers.SerializerMethodField()
    locations_served = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Dealership
        fields = [
            'id', 'dealer', 'name', 'description', 'specialties', 
            'avatar', 'avatar_url', 'website', 'is_verified', 'published',
            'total_cars', 'locations_served', 'average_rating',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_verified']
    
    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None
    
    def get_total_cars(self, obj):
        return obj.total_cars
    
    def get_locations_served(self, obj):
        return obj.locations_served
    
    def get_average_rating(self, obj):
        return obj.average_rating
    
    def to_representation(self, instance):
        """Ensure specialties is always returned as an array"""
        data = super().to_representation(instance)
        data['specialties'] = data.get('specialties', [])
        return data

class DealershipCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating dealership profiles"""
    
    class Meta:
        model = Dealership
        fields = ['name', 'description', 'specialties', 'avatar', 'website']
    
    def validate_specialties(self, value):
        # Handle None or empty values
        if value is None:
            return []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Specialties must be a list of strings.")
        
        # Filter out empty strings and validate
        valid_specialties = []
        for specialty in value:
            if isinstance(specialty, str) and specialty.strip():
                valid_specialties.append(specialty.strip())
            elif specialty:  # Non-empty but not string
                raise serializers.ValidationError("Each specialty must be a non-empty string.")
        
        return valid_specialties
    
    def to_representation(self, instance):
        """Ensure specialties is always returned as an array"""
        data = super().to_representation(instance)
        data['specialties'] = data.get('specialties', [])
        return data
    
    def create(self, validated_data):
        # Ensure user has dealer profile
        dealer = self.context['request'].user.dealer_profile
        validated_data['dealer'] = dealer
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Only allow updating own dealership
        if instance.dealer.user != self.context['request'].user:
            raise serializers.ValidationError("You can only update your own dealership.")
        return super().update(instance, validated_data)

class CategorySerializer(serializers.ModelSerializer):
    car_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'car_count']
    
    def get_car_count(self, obj):
        try:
            return obj.car_set.filter(published=True).count()
        except Exception:
            return 0

class CarImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CarImage
        fields = ['id', 'image', 'image_url', 'order', 'created_at']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class ReviewSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']

class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'comment']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

class CarListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for car listings"""
    dealer = DealerSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Car
        fields = [
            'id', 'title', 'make', 'model', 'year', 'price', 'location',
            'mileage', 'transmission', 'fuel_type', 'condition',
            'dealer', 'category', 'primary_image', 'average_rating',
            'review_count', 'published', 'created_at'
        ]

class DealerCarListSerializer(serializers.ModelSerializer):
    """Serializer for dealer's own cars - includes all fields for management"""
    category = CategorySerializer(read_only=True)
    images = CarImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Car
        fields = [
            'id', 'title', 'make', 'model', 'year', 'price', 'location',
            'mileage', 'transmission', 'fuel_type', 'condition',
            'description', 'category', 'images', 'published', 'created_at'
        ]
    
    def get_primary_image(self, obj):
        try:
            primary_image = obj.images.filter(order=0).first()
            if primary_image and primary_image.image:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(primary_image.image.url)
                return primary_image.image.url
        except Exception:
            pass
        return None
    
    def get_average_rating(self, obj):
        try:
            reviews = obj.reviews.all()
            if reviews:
                return round(sum(review.rating for review in reviews) / len(reviews), 1)
        except Exception:
            pass
        return 0
    
    def get_review_count(self, obj):
        try:
            return obj.reviews.count()
        except Exception:
            return 0

class CarDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual car views"""
    dealer = DealerSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    images = CarImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Car
        fields = [
            'id', 'title', 'make', 'model', 'year', 'price', 'location',
            'mileage', 'transmission', 'fuel_type', 'condition',
            'description', 'dealer', 'category', 'images', 'reviews',
            'average_rating', 'review_count', 'is_favorited',
            'published', 'created_at'
        ]
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return round(sum(review.rating for review in reviews) / len(reviews), 1)
        return 0
    
    def get_review_count(self, obj):
        return obj.reviews.count()
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, car=obj).exists()
        return False

class CarCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating cars"""
    images = CarImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Car
        fields = [
            'title', 'make', 'model', 'year', 'price', 'location',
            'mileage', 'transmission', 'fuel_type', 'condition',
            'description', 'category', 'published', 'images',
            'uploaded_images'
        ]
    
    def validate_year(self, value):
        from datetime import datetime
        current_year = datetime.now().year
        if value < 1900 or value > current_year + 1:
            raise serializers.ValidationError(
                f"Year must be between 1900 and {current_year + 1}."
            )
        return value
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value
    
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        car = Car.objects.create(**validated_data)
        
        # Create car images
        for index, image in enumerate(uploaded_images):
            CarImage.objects.create(car=car, image=image, order=index)
        
        return car
    
    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        # Update car fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Add new images if provided
        if uploaded_images:
            current_max_order = instance.images.aggregate(
                max_order=models.Max('order')
            )['max_order'] or -1
            
            for index, image in enumerate(uploaded_images):
                CarImage.objects.create(
                    car=instance,
                    image=image,
                    order=current_max_order + index + 1
                )
        
        return instance

class FavoriteSerializer(serializers.ModelSerializer):
    car = CarListSerializer(read_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'car', 'created_at']

class FavoriteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ['car']
    
    def validate(self, data):
        user = self.context['request'].user
        car = data['car']
        
        if Favorite.objects.filter(user=user, car=car).exists():
            raise serializers.ValidationError("Car is already in favorites.")
        
        return data
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
