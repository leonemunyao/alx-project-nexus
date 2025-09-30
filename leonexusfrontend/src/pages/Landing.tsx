import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Shield, Clock, Users } from "lucide-react";
import { carsApi, Car } from "@/services/api";

const Landing = () => {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedCars = async () => {
      try {
        const data = await carsApi.getCars({ 
          published: true,
          ordering: '-created_at',
          page_size: 6
        });
        setFeaturedCars(data.cars);
      } catch (error) {
        console.error("Failed to load featured cars:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedCars();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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

          {featuredCars.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No featured cars available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Button size="lg" className="bg-gradient-gold hover:shadow-gold transition-all duration-300">
              View All Cars
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Choose <span className="text-primary">Leonexus</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We make car buying and selling simple, secure, and transparent
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your Dream Car?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their perfect vehicle with Leonexus
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Browse Cars
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              List Your Car
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;