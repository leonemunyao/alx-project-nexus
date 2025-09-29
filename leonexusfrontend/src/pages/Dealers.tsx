import { useState } from "react";
import { Search, MapPin, Phone, Mail, Star, Filter } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import lamborghiniBackground from "@/assets/lamborghini-3.jpg";

const Dealers = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with API calls later
  const dealers = [
    {
      id: 1,
      name: "Elite Motors Kenya",
      location: "Nairobi, Karen",
      phone: "+254 700 123 456",
      email: "info@elitemotors.co.ke",
      rating: 4.8,
      totalCars: 45,
      verified: true,
      specialties: ["Luxury Cars", "SUVs"],
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 2,
      name: "Coast Auto Sales",
      location: "Mombasa, Nyali",
      phone: "+254 711 234 567",
      email: "sales@coastauto.co.ke",
      rating: 4.6,
      totalCars: 38,
      verified: true,
      specialties: ["Family Cars", "Sedans"],
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 3,
      name: "German Auto Centre",
      location: "Nairobi, Runda",
      phone: "+254 722 345 678",
      email: "contact@germanauto.co.ke",
      rating: 4.9,
      totalCars: 52,
      verified: true,
      specialties: ["BMW", "Mercedes-Benz", "Audi"],
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 4,
      name: "Luxury Motors Ltd",
      location: "Nairobi, Kilimani",
      phone: "+254 733 456 789",
      email: "info@luxurymotors.co.ke",
      rating: 4.7,
      totalCars: 41,
      verified: true,
      specialties: ["Premium Cars", "Sports Cars"],
      image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 5,
      name: "Western Auto Mart",
      location: "Kisumu, Milimani",
      phone: "+254 744 567 890",
      email: "sales@westernauto.co.ke",
      rating: 4.5,
      totalCars: 29,
      verified: true,
      specialties: ["SUVs", "Pickup Trucks"],
      image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 6,
      name: "Prestige Auto Gallery",
      location: "Nairobi, Westlands",
      phone: "+254 755 678 901",
      email: "info@prestigeauto.co.ke",
      rating: 4.8,
      totalCars: 47,
      verified: true,
      specialties: ["Japanese Cars", "Hybrids"],
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
  ];

  const locations = ["All Locations", "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"];
  const specialties = ["All Specialties", "Luxury Cars", "SUVs", "Family Cars", "German Cars", "Japanese Cars"];

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
        <section className="bg-gradient-hero border-b border-border">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Trusted Car Dealers
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect with verified car dealers across Kenya through LeoNexus
              </p>
              <Badge className="bg-gradient-gold text-primary-foreground">
                {dealers.length} Verified Dealers
              </Badge>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search dealers by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-input border-border"
                />
              </div>
              
              <div className="flex gap-4">
                <Select>
                  <SelectTrigger className="w-48 h-12 bg-input border-border">
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
                  <SelectTrigger className="w-48 h-12 bg-input border-border">
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty.toLowerCase()}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Dealers Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dealers.map((dealer) => (
                <Card key={dealer.id} className="group hover:shadow-lg transition-all duration-300 bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={dealer.image}
                          alt={dealer.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <CardTitle className="text-lg text-card-foreground">{dealer.name}</CardTitle>
                          {dealer.verified && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium text-card-foreground">{dealer.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{dealer.location}</span>
                      </div>
                      
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="w-4 h-4 mr-2" />
                        <span className="text-sm">{dealer.phone}</span>
                      </div>
                      
                      <div className="flex items-center text-muted-foreground">
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="text-sm">{dealer.email}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">
                        {dealer.totalCars} cars available
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {dealer.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-border">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button size="sm" className="flex-1 bg-gradient-gold hover:shadow-gold transition-all duration-300">
                        View Cars
                      </Button>
                      <Button size="sm" variant="outline" className="border-border">
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" className="border-border hover:bg-muted">
                Load More Dealers
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Showing {dealers.length} of 50+ dealers
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dealers;