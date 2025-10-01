import { useState, useEffect } from "react";
import { Search, MapPin, Phone, Mail, Star, Filter, Building2 } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dealershipApi, Dealership } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import lamborghiniBackground from "@/assets/lamborghini-3.jpg";

const Dealers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const { toast } = useToast();

  // Load dealerships from API
  useEffect(() => {
    const loadDealerships = async () => {
      try {
        setLoading(true);
        const data = await dealershipApi.getDealerships();
        setDealerships(data);
      } catch (error) {
        console.error('Failed to load dealerships:', error);
        toast({
          title: "Failed to load dealerships",
          description: "There was an error loading dealership information",
          variant: "destructive",
        });
        setDealerships([]);
      } finally {
        setLoading(false);
      }
    };

    loadDealerships();
  }, [toast]);

  // Filter dealerships based on search and filters
  const filteredDealerships = dealerships.filter(dealership => {
    const matchesSearch = dealership.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dealership.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dealership.specialties.some(specialty => 
                           specialty.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    
    const matchesLocation = selectedLocation === "all" || 
                           dealership.locations_served.some(location => 
                             location.toLowerCase().includes(selectedLocation.toLowerCase())
                           );
    
    const matchesSpecialty = selectedSpecialty === "all" || 
                            dealership.specialties.includes(selectedSpecialty);
    
    return matchesSearch && matchesLocation && matchesSpecialty;
  });

  // Get unique locations and specialties from dealerships
  const allLocations = ["All Locations", ...Array.from(new Set(
    dealerships.flatMap(d => d.locations_served)
  )).sort()];

  const allSpecialties = ["All Specialties", ...Array.from(new Set(
    dealerships.flatMap(d => d.specialties)
  )).sort()];

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
                {dealerships.length} Verified Dealerships
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
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-48 h-12 bg-input border-border">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {allLocations.map((location) => (
                      <SelectItem key={location} value={location === "All Locations" ? "all" : location.toLowerCase()}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="w-48 h-12 bg-input border-border">
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSpecialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty === "All Specialties" ? "all" : specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Dealerships Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading dealerships...</p>
                </div>
              </div>
            ) : filteredDealerships.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No dealerships found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedLocation !== "all" || selectedSpecialty !== "all"
                    ? "Try adjusting your search criteria"
                    : "No dealerships are currently available"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDealerships.map((dealership) => (
                <Card key={dealership.id} className="group hover:shadow-lg transition-all duration-300 bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {dealership.avatar_url ? (
                          <img
                            src={dealership.avatar_url}
                            alt={dealership.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg text-card-foreground">{dealership.name}</CardTitle>
                          {dealership.is_verified && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium text-card-foreground">{dealership.average_rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {dealership.locations_served.length > 0 && (
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">{dealership.locations_served[0]}</span>
                          {dealership.locations_served.length > 1 && (
                            <span className="text-xs ml-1">+{dealership.locations_served.length - 1} more</span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="w-4 h-4 mr-2" />
                        <span className="text-sm">{dealership.dealer.phone}</span>
                      </div>
                      
                      <div className="flex items-center text-muted-foreground">
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="text-sm">{dealership.dealer.user?.email || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">
                        {dealership.total_cars} cars available
                      </p>
                      {dealership.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {dealership.specialties.map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-border">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}
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
            )}

            {/* Load More */}
            {!loading && filteredDealerships.length > 0 && (
              <div className="text-center mt-12">
                <Button size="lg" variant="outline" className="border-border hover:bg-muted">
                  Load More Dealerships
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Showing {filteredDealerships.length} of {dealerships.length} dealerships
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dealers;