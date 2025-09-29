import { useState } from "react";
import { Search, SlidersHorizontal, Grid3X3, List, MapPin, Calendar, DollarSign, Fuel } from "lucide-react";
import Header from "@/components/Header";
import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import lamborghiniBackground from "@/assets/lamborghini-2.jpg";

const Cars = () => {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - replace with API calls later
  const cars = [
    {
      id: "1",
      title: "Toyota Prado 2020 TX-L",
      price: 4500000,
      year: 2020,
      mileage: "45,000 km",
      location: "Nairobi, Karen",
      dealer: "Premium Motors Kenya",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      fuelType: "Petrol",
      transmission: "Automatic",
      featured: true,
    },
    {
      id: "2",
      title: "Mercedes-Benz C-Class 2019",
      price: 3800000,
      year: 2019,
      mileage: "35,000 km",
      location: "Nairobi, Westlands",
      dealer: "Elite Car Gallery",
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      fuelType: "Petrol",
      transmission: "Automatic",
    },
    {
      id: "3",
      title: "Honda CR-V 2021 EX-L",
      price: 3200000,
      year: 2021,
      mileage: "28,000 km",
      location: "Mombasa, Nyali",
      dealer: "Coast Auto Sales",
      image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      fuelType: "Hybrid",
      transmission: "CVT",
      featured: true,
    },
    {
      id: "4",
      title: "BMW X5 2018 xDrive40i",
      price: 5200000,
      year: 2018,
      mileage: "52,000 km",
      location: "Nairobi, Kilimani",
      dealer: "Luxury Motors Ltd",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      fuelType: "Petrol",
      transmission: "Automatic",
    },
    {
      id: "5",
      title: "Nissan X-Trail 2020 S",
      price: 2800000,
      year: 2020,
      mileage: "38,000 km",
      location: "Kisumu, Milimani",
      dealer: "Western Auto Mart",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      fuelType: "Petrol",
      transmission: "CVT",
    },
    {
      id: "6",
      title: "Audi Q7 2019 Premium Plus",
      price: 6800000,
      year: 2019,
      mileage: "42,000 km",
      location: "Nairobi, Runda",
      dealer: "German Auto Centre",
      image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      fuelType: "Petrol",
      transmission: "Automatic",
    },
  ];

  const makes = ["Toyota", "Mercedes-Benz", "Honda", "BMW", "Nissan", "Audi"];
  const locations = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"];
  const priceRanges = [
    "Under 1M",
    "1M - 2M",
    "2M - 3M",
    "3M - 5M",
    "5M - 10M",
    "10M+",
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Lamborghini Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={lamborghiniBackground}
          alt="Orange Lamborghini background"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95"></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        
        {/* Page Header */}
        <div className="bg-gradient-hero border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Find Your Perfect Car
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Browse thousands of quality vehicles from trusted dealers across Kenya
              </p>
              <Badge className="bg-gradient-gold text-primary-foreground">
                {cars.length} Cars Available
              </Badge>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-4">
            {/* Main Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by make, model, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-input border-border"
                />
              </div>
              
              <div className="flex items-center gap-2">
                {/* Quick Filters */}
                <div className="hidden md:flex items-center gap-2">
                  <Select>
                    <SelectTrigger className="w-32 h-12 bg-input border-border">
                      <SelectValue placeholder="Make" />
                    </SelectTrigger>
                    <SelectContent>
                      {makes.map((make) => (
                        <SelectItem key={make} value={make.toLowerCase()}>
                          {make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select>
                    <SelectTrigger className="w-32 h-12 bg-input border-border">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location.toLowerCase()}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-32 h-12 bg-input border-border">
                      <SelectValue placeholder="Price" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range) => (
                        <SelectItem key={range} value={range.toLowerCase()}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-12 px-4 border-border"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-card border border-border rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Year Range</label>
                    <div className="flex gap-2">
                      <Input placeholder="From" className="bg-input border-border" />
                      <Input placeholder="To" className="bg-input border-border" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Price Range (KES)</label>
                    <div className="flex gap-2">
                      <Input placeholder="Min" className="bg-input border-border" />
                      <Input placeholder="Max" className="bg-input border-border" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Fuel Type</label>
                    <Select>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="petrol">Petrol</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Transmission</label>
                    <Select>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="cvt">CVT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Mileage (km)</label>
                    <Select>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-30000">0 - 30,000</SelectItem>
                        <SelectItem value="30000-60000">30,000 - 60,000</SelectItem>
                        <SelectItem value="60000-100000">60,000 - 100,000</SelectItem>
                        <SelectItem value="100000+">100,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Actions</label>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-gradient-gold">Apply</Button>
                      <Button size="sm" variant="outline" className="border-border">Clear</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Available Cars</h2>
              <p className="text-muted-foreground">{cars.length} results found</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <Select defaultValue="newest">
                <SelectTrigger className="w-48 bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="year-new">Year: Newest</SelectItem>
                  <SelectItem value="year-old">Year: Oldest</SelectItem>
                  <SelectItem value="mileage-low">Mileage: Lowest</SelectItem>
                </SelectContent>
              </Select>

              {/* Layout Toggle */}
              <div className="flex border border-border rounded-lg overflow-hidden">
                <Button
                  variant={layout === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLayout("grid")}
                  className={`rounded-none ${layout === "grid" ? "bg-primary text-primary-foreground" : ""}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={layout === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLayout("list")}
                  className={`rounded-none ${layout === "list" ? "bg-primary text-primary-foreground" : ""}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Car Listings */}
        <div className="container mx-auto px-4 pb-12">
          <div className={`grid gap-6 ${
            layout === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {cars.map((car) => (
              <CarCard key={car.id} car={car} layout={layout} />
            ))}
          </div>

          {/* Load More / Pagination */}
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              variant="outline"
              className="border-border hover:bg-muted"
            >
              Load More Cars
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Showing 6 of {cars.length} cars
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cars;