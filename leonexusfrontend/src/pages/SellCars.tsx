import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Car, DollarSign, MapPin, Calendar, Gauge, Fuel, Settings, Camera } from "lucide-react";
import lamborghiniBackground from "@/assets/lamborghini-4.jpg";

const SellCars = () => {
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    make: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    fuel_type: "",
    transmission: "",
    condition: "",
    location: "",
    description: "",
  });

  const [images, setImages] = useState<File[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData, images);
  };

  const carMakes = [
    "Toyota", "Mercedes-Benz", "BMW", "Audi", "Volkswagen", "Nissan",
    "Honda", "Ford", "Hyundai", "Kia", "Mazda", "Subaru", "Mitsubishi"
  ];

  const categories = [
    "Sedan", "SUV", "Hatchback", "Coupe", "Convertible", "Truck",
    "Van", "Wagon", "Crossover", "Luxury", "Sports Car"
  ];

  const conditions = [
    "Excellent", "Very Good", "Good", "Fair", "Needs Work"
  ];

  const locations = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika",
    "Machakos", "Meru", "Nyeri", "Kakamega", "Malindi", "Garissa"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 + 2 }, (_, i) => currentYear + 1 - i);

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

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                List Your <span className="text-primary">Vehicle</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Reach thousands of potential buyers across Kenya. List your car with detailed information to get the best offers.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Vehicle Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    Vehicle Information
                  </CardTitle>
                  <CardDescription>
                    Provide detailed information about the vehicle you want to sell
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., 2023 Toyota Camry Hybrid - Excellent Condition"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="make">Make *</Label>
                      <Select value={formData.make} onValueChange={(value) => handleInputChange("make", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select car make" />
                        </SelectTrigger>
                        <SelectContent>
                          {carMakes.map((make) => (
                            <SelectItem key={make} value={make}>
                              {make}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        placeholder="e.g., Camry, C-Class, X3"
                        value={formData.model}
                        onChange={(e) => handleInputChange("model", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Year *</Label>
                      <Select value={formData.year} onValueChange={(value) => handleInputChange("year", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price (KSH) *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="price"
                          type="number"
                          placeholder="e.g., 2500000"
                          className="pl-10"
                          value={formData.price}
                          onChange={(e) => handleInputChange("price", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mileage">Mileage (km) *</Label>
                      <div className="relative">
                        <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="mileage"
                          type="number"
                          placeholder="e.g., 45000"
                          className="pl-10"
                          value={formData.mileage}
                          onChange={(e) => handleInputChange("mileage", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fuel_type">Fuel Type *</Label>
                      <div className="relative">
                        <Fuel className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Select value={formData.fuel_type} onValueChange={(value) => handleInputChange("fuel_type", value)}>
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PETROL">Petrol</SelectItem>
                            <SelectItem value="DIESEL">Diesel</SelectItem>
                            <SelectItem value="HYBRID">Hybrid</SelectItem>
                            <SelectItem value="ELECTRIC">Electric</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transmission">Transmission *</Label>
                      <div className="relative">
                        <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Select value={formData.transmission} onValueChange={(value) => handleInputChange("transmission", value)}>
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select transmission" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                            <SelectItem value="MANUAL">Manual</SelectItem>
                            <SelectItem value="CVT">CVT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition *</Label>
                      <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {conditions.map((condition) => (
                            <SelectItem key={condition} value={condition}>
                              {condition}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the condition, features, and any additional information about your vehicle..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Images Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    Vehicle Photos
                  </CardTitle>
                  <CardDescription>
                    Upload high-quality photos of your vehicle (max 10 images)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Drag and drop your images here, or
                      </p>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="max-w-xs mx-auto"
                      />
                    </div>
                    {images.length > 0 && (
                      <p className="text-sm text-primary mt-4">
                        {images.length} image(s) selected
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  size="lg"
                  className="px-12 bg-gradient-gold hover:shadow-gold transition-all duration-300"
                >
                  List My Vehicle
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellCars;
