from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('BUYER', 'Buyer'),
        ('DEALER', 'Dealer'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='BUYER')

class Dealer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="dealer_profile")
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    address = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

class Car(models.Model):
    TRANSMISSION_CHOICES = (
        ('MANUAL', 'Manual'),
        ('AUTOMATIC', 'Automatic'),
        ('CVT', 'CVT'),
    )
    FUEL_CHOICES = (
        ('PETROL', 'Petrol'),
        ('DIESEL', 'Diesel'),
        ('ELECTRIC', 'Electric'),
        ('HYBRID', 'Hybrid'),
    )

    dealer = models.ForeignKey(Dealer, on_delete=models.CASCADE, related_name="cars")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=200)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    mileage = models.PositiveIntegerField(null=True, blank=True)
    transmission = models.CharField(max_length=15, choices=TRANSMISSION_CHOICES, blank=True)
    fuel_type = models.CharField(max_length=15, choices=FUEL_CHOICES, blank=True)
    condition = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.make} {self.model} {self.year}"

class CarImage(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="car_images/")
    order = models.PositiveIntegerField(default=0)

class Review(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name="favorited_by")

    class Meta:
        unique_together = ('user', 'car')
