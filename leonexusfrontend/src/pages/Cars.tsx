import { useState, useEffect } from "react";
import { Search, Filter, Grid, List, Heart, MapPin, Calendar, Gauge, Fuel, Star, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { carsApi, categoriesApi, favoritesApi, Category, Car } from "@/services/api";
import CarCard from "@/components/CarCard";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";

const Cars = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const [cars, setCars] = useState<Car[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    make: "",
    model: "",
    year: "",
    min_price: "",
    max_price: "",
    location: "",
    fuel_type: "",
    transmission: "",
    category: "",
    ordering: "-created_at"
  });

  const carMakes = [
    "Toyota", "Mercedes-Benz", "BMW", "Audi", "Volkswagen", "Nissan",
    "Honda", "Ford", "Hyundai", "Kia", "Mazda", "Subaru", "Mitsubishi", "Lamborghini", "Ferrari", "Landrover"
  ];

  const locations = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Thika", "Eldoret", "Malindi"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 + 2 }, (_, i) => currentYear + 1 - i);

  useEffect(() => {
    loadCategories();
    loadCars();
    if (isAuthenticated) {
      loadFavorites();
    }
  }, []);

  useEffect(() => {
    loadCars();
  }, [filters, currentPage]);

  const loadCategories = async () => {
    try {
      const categoriesData = await categoriesApi.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadCars = async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      );
      
      const response = await carsApi.getCars(cleanFilters);
      setCars(response.cars);
      setTotalCount(response.count);
      setHasNext(!!response.next);
      setHasPrevious(!!response.previous);
    } catch (error) {
      console.error('Failed to load cars:', error);
      toast({
        title: "Error",
        description: "Failed to load cars. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const favoritesData = await favoritesApi.getFavorites();
      const favoriteIds = favoritesData.map(fav => fav.car.id);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleToggleFavorite = async (carId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add cars to your favorites.",
        variant: "destructive",
      });
      return;
    }

    try {
      const isFavorited = favorites.includes(carId);
      if (isFavorited) {
        // Remove from favorites
        const favoritesData = await favoritesApi.getFavorites();
        const favorite = favoritesData.find(fav => fav.car.id === carId);
        if (favorite) {
          await favoritesApi.removeFavorite(favorite.id);
          setFavorites(prev => prev.filter(id => id !== carId));
          toast({
            title: "Removed from Favorites",
            description: "Car removed from your favorites.",
          });
        }
      } else {
        // Add to favorites
        await favoritesApi.addFavorite(carId);
        setFavorites(prev => [...prev, carId]);
        toast({
          title: "Added to Favorites",
          description: "Car added to your favorites.",
        });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      make: "",
      model: "",
      year: "",
      min_price: "",
      max_price: "",
      location: "",
      fuel_type: "",
      transmission: "",
      category: "",
      ordering: "-created_at"
    });
    setCurrentPage(1);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Cars</h1>
          <p className="text-muted-foreground">
            Find your perfect car from {totalCount} available vehicles
          </p>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search cars by make, model, or location..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2">
                <Select value={filters.make} onValueChange={(value) => handleFilterChange("make", value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Make" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Makes</SelectItem>
                    {carMakes.map((make) => (
                      <SelectItem key={make} value={make}>{make}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>

                <div className="flex gap-1">
                  <Button
                    variant={layout === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLayout("grid")}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={layout === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLayout("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Model</label>
                    <Input
                      placeholder="e.g., Camry, C-Class"
                      value={filters.model}
                      onChange={(e) => handleFilterChange("model", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Year</label>
                    <Select value={filters.year} onValueChange={(value) => handleFilterChange("year", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Year</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Min Price</label>
                    <Input
                      type="number"
                      placeholder="Min price"
                      value={filters.min_price}
                      onChange={(e) => handleFilterChange("min_price", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Price</label>
                    <Input
                      type="number"
                      placeholder="Max price"
                      value={filters.max_price}
                      onChange={(e) => handleFilterChange("max_price", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Fuel Type</label>
                    <Select value={filters.fuel_type} onValueChange={(value) => handleFilterChange("fuel_type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Fuel Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Fuel Type</SelectItem>
                        <SelectItem value="PETROL">Petrol</SelectItem>
                        <SelectItem value="DIESEL">Diesel</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                        <SelectItem value="ELECTRIC">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Transmission</label>
                    <Select value={filters.transmission} onValueChange={(value) => handleFilterChange("transmission", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Transmission</SelectItem>
                        <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                        <SelectItem value="MANUAL">Manual</SelectItem>
                        <SelectItem value="CVT">CVT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Category</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={filters.ordering} onValueChange={(value) => handleFilterChange("ordering", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-created_at">Newest First</SelectItem>
                        <SelectItem value="created_at">Oldest First</SelectItem>
                        <SelectItem value="price">Price: Low to High</SelectItem>
                        <SelectItem value="-price">Price: High to Low</SelectItem>
                        <SelectItem value="year">Year: Old to New</SelectItem>
                        <SelectItem value="-year">Year: New to Old</SelectItem>
                        <SelectItem value="mileage">Mileage: Low to High</SelectItem>
                        <SelectItem value="-mileage">Mileage: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading cars...</p>
            </div>
          </div>
        ) : cars.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground">
                <p className="text-lg mb-2">No cars found</p>
                <p>Try adjusting your search criteria or clear the filters</p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results Grid/List */}
            <div className={layout === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {cars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  layout={layout}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorited={favorites.includes(car.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalCount > 12 && (
              <div className="flex items-center justify-center mt-8 space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!hasPrevious}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {Math.ceil(totalCount / 12)}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!hasNext}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Cars;