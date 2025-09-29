import { useState } from "react";
import { Search, MapPin, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import lamborghiniHero from "@/assets/lamborghini-3.jpg";

const Hero = () => {
  const [searchForm, setSearchForm] = useState({
    make: "",
    model: "",
    location: "",
    maxPrice: "",
    year: "",
  });

  const carMakes = ["Toyota", "Mercedes-Benz", "BMW", "Audi", "Nissan", "Honda", "Subaru", "Mitsubishi"];
  const locations = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika"];
  const years = Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - i).toString());

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={lamborghiniHero}
          alt="Orange Lamborghini in premium setting"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Find Your Perfect{" "}
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Dream Car
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Discover premium vehicles from trusted dealers across Kenya.
              Your next car is just a search away.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-card/90 p-8 rounded-2xl shadow-premium border border-border/50 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* Make */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Make</label>
                <Select value={searchForm.make} onValueChange={(value) => setSearchForm({ ...searchForm, make: value })}>
                  <SelectTrigger className="h-12 bg-input border-border">
                    <SelectValue placeholder="Any Make" />
                  </SelectTrigger>
                  <SelectContent>
                    {carMakes.map((make) => (
                      <SelectItem key={make} value={make}>{make}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Model</label>
                <Input
                  placeholder="Any Model"
                  className="h-12 bg-input border-border"
                  value={searchForm.model}
                  onChange={(e) => setSearchForm({ ...searchForm, model: e.target.value })}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Location</label>
                <Select value={searchForm.location} onValueChange={(value) => setSearchForm({ ...searchForm, location: value })}>
                  <SelectTrigger className="h-12 bg-input border-border">
                    <SelectValue placeholder="All Kenya" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Max Price */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Max Price</label>
                <Input
                  placeholder="Any Price"
                  className="h-12 bg-input border-border"
                  value={searchForm.maxPrice}
                  onChange={(e) => setSearchForm({ ...searchForm, maxPrice: e.target.value })}
                />
              </div>

              {/* Year */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Year</label>
                <Select value={searchForm.year} onValueChange={(value) => setSearchForm({ ...searchForm, year: value })}>
                  <SelectTrigger className="h-12 bg-input border-border">
                    <SelectValue placeholder="Any Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Button */}
            <Button
              size="lg"
              className="w-full md:w-auto px-12 h-14 text-lg font-semibold bg-gradient-gold hover:shadow-gold transition-all duration-300"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Cars
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Cars Available", value: "15,000+" },
              { label: "Trusted Dealers", value: "500+" },
              { label: "Cities Covered", value: "20+" },
              { label: "Happy Customers", value: "50,000+" },
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;