from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Dealer, Buyer, Category, Car, CarImage, Review, Favorite


class CustomUserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role Information', {'fields': ('role',)}),
    )
    
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'date_joined')
    
    list_filter = BaseUserAdmin.list_filter + ('role',)
    
    search_fields = ('username', 'email', 'first_name', 'last_name')

class CarInline(admin.TabularInline):
    model = Car
    extra = 0
    fields = ('title', 'make', 'model', 'year', 'price', 'published')
    readonly_fields = ('created_at',)


class DealerAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'phone', 'get_username', 'get_email', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('first_name', 'last_name', 'phone', 'user__username', 'user__email')
    inlines = [CarInline]
    
    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'

class BuyerAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'phone', 'get_username', 'get_email', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('first_name', 'last_name', 'phone', 'user__username', 'user__email')
    
    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'

class CarImageInline(admin.TabularInline):
    model = CarImage
    extra = 1


class CarAdmin(admin.ModelAdmin):
    list_display = ('title', 'make', 'model', 'year', 'price', 'dealer', 'published', 'created_at')
    list_filter = ('make', 'fuel_type', 'transmission', 'published', 'created_at')
    search_fields = ('title', 'make', 'model', 'dealer__first_name', 'dealer__last_name')
    inlines = [CarImageInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'make', 'model', 'year', 'category')
        }),
        ('Details', {
            'fields': ('price', 'mileage', 'transmission', 'fuel_type', 'condition')
        }),
        ('Location & Description', {
            'fields': ('location', 'description')
        }),
        ('Publishing', {
            'fields': ('dealer', 'published')
        }),
    )


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'car', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__username', 'car__title', 'comment')


class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'car', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'car__title')


admin.site.register(User, CustomUserAdmin)
admin.site.register(Dealer, DealerAdmin)
admin.site.register(Buyer, BuyerAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Car, CarAdmin)
admin.site.register(Review, ReviewAdmin)
admin.site.register(Favorite, FavoriteAdmin)


admin.site.site_header = "LeoNexus Car Marketplace Admin"
admin.site.site_title = "LeoNexus Admin"
admin.site.index_title = "Welcome to LeoNexus Administration"
