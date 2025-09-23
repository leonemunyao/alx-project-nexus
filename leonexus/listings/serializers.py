from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import models
from .models import User, Dealer, Category, Car, CarImage, Review, Favorite

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
        fields = ['id', 'user', 'name', 'phone', 'address', 'car_count']
    
    def get_car_count(self, obj):
        return obj.cars.filter(published=True).count()

class DealerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating dealer profiles"""
    class Meta:
        model = Dealer
        fields = ['name', 'phone', 'address']

class CategorySerializer(serializers.ModelSerializer):
    car_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'car_count']
    
    def get_car_count(self, obj):
        return obj.car_set.filter(published=True).count()

class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image', 'order']

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
            'review_count', 'created_at'
        ]
    
    def get_primary_image(self, obj):
        primary_image = obj.images.filter(order=0).first()
        if primary_image:
            return self.context['request'].build_absolute_uri(primary_image.image.url)
        return None
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return round(sum(review.rating for review in reviews) / len(reviews), 1)
        return 0
    
    def get_review_count(self, obj):
        return obj.reviews.count()

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
        fields = ['id', 'car']

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
