from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import datetime
from cloudinary.models import CloudinaryField


class User(AbstractUser):
    ROLE_CHOICES = (
        ("BUYER", "Buyer"),
        ("DEALER", "Dealer"),
    )
    role = models.CharField(
        max_length=10, choices=ROLE_CHOICES, default="BUYER"
    )


class Dealer(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="dealer_profile"
    )
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username

    @property
    def username(self):
        return self.user.username

    @property
    def email(self):
        return self.user.email

    class Meta:
        ordering = ["-created_at"]


class Buyer(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="buyer_profile"
    )
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username

    @property
    def username(self):
        return self.user.username

    @property
    def email(self):
        return self.user.email

    class Meta:
        ordering = ["-created_at"]


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]


class Car(models.Model):
    TRANSMISSION_CHOICES = (
        ("MANUAL", "Manual"),
        ("AUTOMATIC", "Automatic"),
        ("CVT", "CVT"),
    )
    FUEL_CHOICES = (
        ("PETROL", "Petrol"),
        ("DIESEL", "Diesel"),
        ("ELECTRIC", "Electric"),
        ("HYBRID", "Hybrid"),
    )

    dealer = models.ForeignKey(
        Dealer, on_delete=models.CASCADE, related_name="cars"
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True
    )
    title = models.CharField(max_length=200)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    year = models.PositiveIntegerField(
        validators=[
            MinValueValidator(2020),
            MaxValueValidator(datetime.now().year + 1),
        ]
    )
    price = models.DecimalField(max_digits=12, decimal_places=2)
    mileage = models.PositiveIntegerField(null=True, blank=True)
    transmission = models.CharField(
        max_length=15, choices=TRANSMISSION_CHOICES, blank=True
    )
    fuel_type = models.CharField(
        max_length=15, choices=FUEL_CHOICES, blank=True
    )
    condition = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.make} {self.model} {self.year}"

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["make", "model"]),
            models.Index(fields=["price"]),
            models.Index(fields=["year"]),
            models.Index(fields=["published", "created_at"]),
        ]


class CarImage(models.Model):
    car = models.ForeignKey(
        Car, on_delete=models.CASCADE, related_name="images"
    )
    image = CloudinaryField("image", folder="car_images/")
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image {self.id} for {self.car.title}"

    class Meta:
        ordering = ["order"]
        unique_together = ("car", "order")


class Review(models.Model):
    car = models.ForeignKey(
        Car, on_delete=models.CASCADE, related_name="reviews"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="reviews"
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review {self.id} for {self.car.title} by {self.user.username}"

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("car", "user")


class Dealership(models.Model):
    dealer = models.OneToOneField(
        Dealer, on_delete=models.CASCADE, related_name="dealership"
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    specialties = models.JSONField(default=list, blank=True)
    avatar = CloudinaryField(
        "image", folder="dealership_avatars/", blank=True, null=True
    )
    website = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def total_cars(self):
        """Calculate total published cars for this dealership"""
        return self.dealer.cars.filter(published=True).count()

    @property
    def locations_served(self):
        """Get unique locations from dealer's cars"""
        return list(
            set(
                self.dealer.cars.filter(published=True).values_list(
                    "location", flat=True
                )
            )
        )

    @property
    def average_rating(self):
        """Calculate average rating from all car reviews"""
        from django.db.models import Avg

        avg_rating = self.dealer.cars.filter(published=True).aggregate(
            avg_rating=Avg("reviews__rating")
        )["avg_rating"]
        return round(avg_rating, 1) if avg_rating else 0.0

    class Meta:
        ordering = ["-created_at"]


class Favorite(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="favorites"
    )
    car = models.ForeignKey(
        Car, on_delete=models.CASCADE, related_name="favorited_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} favorited {self.car.title}"

    class Meta:
        unique_together = ("user", "car")
        ordering = ["-created_at"]
