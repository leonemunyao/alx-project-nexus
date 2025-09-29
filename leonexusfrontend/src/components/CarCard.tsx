import { Heart, MapPin, Calendar, Gauge, Fuel, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CarCardProps {
  car: {
    id: string;
    title: string;
    price: number;
    year: number;
    mileage: string;
    location: string;
    dealer: string;
    image: string;
    fuelType: string;
    transmission: string;
    featured?: boolean;
  };
  layout?: "grid" | "list";
}

const CarCard = ({ car, layout = "grid" }: CarCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (layout === "list") {
    return (
      <div className="bg-card border border-border rounded-xl shadow-card hover:shadow-premium transition-all duration-300 group overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative md:w-80 h-64 md:h-auto overflow-hidden">
            <img
              src={car.image}
              alt={car.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-3 right-3 bg-black/20 hover:bg-black/40 text-white border-none"
            >
              <Heart className="w-4 h-4" />
            </Button>
            {car.featured && (
              <Badge className="absolute top-3 left-3 bg-gradient-gold text-primary-foreground">
                Featured
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                  {car.title}
                </h3>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {car.year}
                  </div>
                  <div className="flex items-center">
                    <Gauge className="w-4 h-4 mr-1" />
                    {car.mileage}
                  </div>
                  <div className="flex items-center">
                    <Fuel className="w-4 h-4 mr-1" />
                    {car.fuelType}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {car.location}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Dealer: {car.dealer}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-primary">
                  {formatPrice(car.price)}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                  <Button size="sm" className="bg-gradient-gold hover:shadow-gold transition-all duration-300">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-card hover:shadow-premium transition-all duration-300 group overflow-hidden">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={car.image}
          alt={car.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-3 right-3 bg-black/20 hover:bg-black/40 text-white border-none"
        >
          <Heart className="w-4 h-4" />
        </Button>
        {car.featured && (
          <Badge className="absolute top-3 left-3 bg-gradient-gold text-primary-foreground">
            Featured
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors">
          {car.title}
        </h3>
        
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {car.year}
          </div>
          <div className="flex items-center">
            <Gauge className="w-3 h-3 mr-1" />
            {car.mileage}
          </div>
          <div className="flex items-center">
            <Fuel className="w-3 h-3 mr-1" />
            {car.fuelType}
          </div>
        </div>

        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          {car.location} • {car.dealer}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-primary">
            {formatPrice(car.price)}
          </div>
          <Button size="sm" className="bg-gradient-gold hover:shadow-gold transition-all duration-300">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;