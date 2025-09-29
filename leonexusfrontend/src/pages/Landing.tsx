import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Shield, Clock, Users } from "lucide-react";
import pradoImage from "@/assets/prado-2019.jpg";

// Mock data for featured cars
const featuredCars = [
  {
    id: "1",
    title: "2020 Mercedes-Benz C-Class C200",
    price: 4500000,
    year: 2020,
    mileage: "35,000 km",
    location: "Nairobi",
    dealer: "Elite Motors",
    image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600&h=400&fit=crop",
    fuelType: "Petrol",
    transmission: "Automatic",
    featured: true,
  },
  {
    id: "2",
    title: "2019 Toyota Land Cruiser Prado",
    price: 6200000,
    year: 2019,
    mileage: "42,000 km",
    location: "Mombasa",
    dealer: "Coast Auto",
    image: pradoImage,
    fuelType: "Diesel",
    transmission: "Automatic",
  },
  {
    id: "3",
    title: "2021 BMW X3 xDrive30i",
    price: 5800000,
    year: 2021,
    mileage: "28,000 km",
    location: "Nairobi",
    dealer: "Prestige Auto",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop",
    fuelType: "Petrol",
    transmission: "Automatic",
    featured: true,
  },
  {
    id: "4",
    title: "2018 Audi Q5 2.0T Quattro",
    price: 4100000,
    year: 2018,
    mileage: "48,000 km",
    location: "Kisumu",
    dealer: "Lake Motors",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop",
    fuelType: "Petrol",
    transmission: "Automatic",
  },
];

const features = [
  {
    icon: Shield,
    title: "Verified Dealers",
    description: "All our dealers are thoroughly vetted and verified for your peace of mind."
  },
  {
    icon: Star,
    title: "Quality Assured",
    description: "Every vehicle is inspected to ensure the highest quality standards."
  },
  {
    icon: Clock,
    title: "Quick Process",
    description: "Find, inspect, and purchase your dream car in record time."
  },
  {
    icon: Users,
    title: "Expert Support",
    description: "Our team of automotive experts is here to help you every step of the way."
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />

      {/* Featured Cars Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Featured <span className="text-primary">Vehicles</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover hand-picked premium vehicles from Kenya's most trusted dealers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" className="px-8">
              View All Cars
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Choose <span className="text-primary">LeoNexus</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're committed to making your car buying experience seamless, secure, and satisfying
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-gold transition-all duration-300">
                  <feature.icon className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Find Your Next Car?
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of satisfied customers who found their perfect vehicle through LeoNexus
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 bg-gradient-gold hover:shadow-gold transition-all duration-300">
                Start Shopping Now
              </Button>
              <Button size="lg" variant="outline" className="px-8">
                Sell Your Car
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-primary-foreground rounded"></div>
              </div>
              <span className="text-xl font-bold text-card-foreground">LeoNexus</span>
            </div>
            <p className="text-muted-foreground">
              © 2024 LeoNexus. Premium car marketplace for Kenya.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;