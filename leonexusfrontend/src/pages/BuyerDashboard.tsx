import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Heart, LogOut, BarChart3, TrendingUp, Users, Star, Search, Filter, Eye, Calendar, MapPin, Gauge, Fuel, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { favoritesApi, carsApi, reviewsApi, Favorite, Car as CarType, Review, getCarImageUrl } from "@/services/api";
import ProfileDialog from "@/components/ProfileDialog";
import Header from "@/components/Header";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [recentCars, setRecentCars] = useState<CarType[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load favorites
      const favoritesData = await favoritesApi.getFavorites();
      setFavorites(favoritesData);
      
      // Load recent cars (latest 6 cars)
      const carsResponse = await carsApi.getCars({ ordering: "-created_at" });
      setRecentCars(carsResponse.cars.slice(0, 6));
      
      // Load user reviews (if any)
      // Note: This would require a user-specific reviews endpoint
      // For now, we'll simulate this
      setUserReviews([]);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account",
      });
      navigate("/");
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout failed",
        description: "There was an error signing you out",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFavorite = async (favoriteId: number) => {
    try {
      await favoritesApi.removeFavorite(favoriteId);
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      toast({
        title: "Removed from Favorites",
        description: "Car removed from your favorites.",
      });
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredFavorites = favorites.filter(fav => 
    fav.car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fav.car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fav.car.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur mb-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Buyer Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.first_name || user?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setIsProfileDialogOpen(true)} variant="outline" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </Button>
              <Button onClick={handleLogout} variant="outline" className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favorites.length}</div>
              <p className="text-xs text-muted-foreground">
                Cars you've saved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews Written</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userReviews.length}</div>
              <p className="text-xs text-muted-foreground">
                Reviews submitted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cars Viewed</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Recently viewed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                2024
              </div>
              <p className="text-xs text-muted-foreground">
                Years as member
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Favorites Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Your Favorites
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => navigate('/cars')}>
                    Browse More Cars
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                    <p className="text-muted-foreground mb-4">Start browsing cars and add them to your favorites</p>
                    <Button onClick={() => navigate('/cars')}>
                      Browse Cars
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Search Favorites */}
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search your favorites..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Favorites List */}
                    <div className="space-y-4">
                      {filteredFavorites.map((favorite) => (
                        <Card key={favorite.id} className="overflow-hidden">
                          <div className="flex">
                            <div className="relative w-32 h-24 flex-shrink-0">
                              <img
                                src={getCarImageUrl(favorite.car, { width: 200, height: 150, crop: 'fill', quality: 'auto' })}
                                alt={`${favorite.car.make} ${favorite.car.model}`}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => navigate(`/cars/${favorite.car.id}`)}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                            </div>
                            
                            <CardContent className="flex-1 p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg mb-1 cursor-pointer hover:text-primary"
                                      onClick={() => navigate(`/cars/${favorite.car.id}`)}>
                                    {favorite.car.year} {favorite.car.make} {favorite.car.model}
                                  </h3>
                                  
                                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                                    <div className="flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {favorite.car.year}
                                    </div>
                                    <div className="flex items-center">
                                      <Gauge className="w-3 h-3 mr-1" />
                                      {favorite.car.mileage ? `${favorite.car.mileage.toLocaleString()} km` : 'N/A'}
                                    </div>
                                    <div className="flex items-center">
                                      <Fuel className="w-3 h-3 mr-1" />
                                      {favorite.car.fuel_type}
                                    </div>
                                    <div className="flex items-center">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {favorite.car.location}
                                    </div>
                                  </div>

                                  {favorite.car.average_rating && (
                                    <div className="flex items-center space-x-1 mb-2">
                                      {renderStars(Math.round(favorite.car.average_rating))}
                                      <span className="text-sm text-muted-foreground">
                                        ({favorite.car.review_count || 0})
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-right ml-4">
                                  <div className="text-lg font-bold text-primary mb-2">
                                    {formatPrice(favorite.car.price)}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => navigate(`/cars/${favorite.car.id}`)}>
                                      View Details
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => handleRemoveFavorite(favorite.id)}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Cars Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Latest Cars
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCars.map((car) => (
                    <div key={car.id} className="flex gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                         onClick={() => navigate(`/cars/${car.id}`)}>
                      <div className="relative w-16 h-12 flex-shrink-0">
                        <img
                          src={getCarImageUrl(car, { width: 100, height: 75, crop: 'fill', quality: 'auto' })}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {car.year} {car.make} {car.model}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {car.location}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {formatPrice(car.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/cars')}>
                    View All Cars
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" onClick={() => navigate('/cars')}>
                  <Search className="w-4 h-4 mr-2" />
                  Search Cars
                </Button>
                
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/cars')}>
                  <Filter className="w-4 h-4 mr-2" />
                  Browse by Category
                </Button>
                
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/cars')}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Find by Location
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Profile Dialog */}
        <ProfileDialog
          isOpen={isProfileDialogOpen}
          onClose={() => setIsProfileDialogOpen(false)}
          userRole="BUYER"
        />
      </div>
    </div>
  );
};

export default BuyerDashboard;