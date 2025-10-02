import { Heart, MapPin, Calendar, Gauge, Fuel, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Car, getCarImageUrl } from "@/services/api";

interface CarCardProps {
  car: Car;
  layout?: "grid" | "list";
  onToggleFavorite?: (carId: number) => void;
  isFavorited?: boolean;
}

const CarCard = ({ car, layout = "grid", onToggleFavorite, isFavorited = false }: CarCardProps) => {
  const navigate = useNavigate();

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

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(car.id);
    }
  };

  const handleViewDetails = () => {
    navigate(`/cars/${car.id}`);
  };

  const dealerName = typeof car.dealer === 'object' 
    ? `${car.dealer.first_name} ${car.dealer.last_name}`
    : 'Unknown Dealer';

  if (layout === "list") {
    return (
      <div className="bg-card border border-border rounded-xl shadow-card hover:shadow-premium transition-all duration-300 group overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative md:w-80 h-64 md:h-auto overflow-hidden">
            <img
              src={getCarImageUrl(car, { width: 400, height: 300, crop: 'fill', quality: 'auto' })}
              alt={car.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
              onClick={handleViewDetails}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-3 right-3 bg-black/20 hover:bg-black/40 text-white border-none"
              onClick={handleToggleFavorite}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
            </Button>
            {car.published && (
              <Badge className="absolute top-3 left-3 bg-green-500">
                Available
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors cursor-pointer"
                    onClick={handleViewDetails}>
                  {car.title}
                </h3>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {car.year}
                  </div>
                  <div className="flex items-center">
                    <Gauge className="w-4 h-4 mr-1" />
                    {car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}
                  </div>
                  <div className="flex items-center">
                    <Fuel className="w-4 h-4 mr-1" />
                    {car.fuel_type}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {car.location}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Dealer: {dealerName}
                </p>

                {car.average_rating && (
                  <div className="flex items-center space-x-1 mb-4">
                    {renderStars(Math.round(car.average_rating))}
                    <span className="text-sm text-muted-foreground">
                      ({car.review_count || 0})
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-primary">
                  {formatPrice(car.price)}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleViewDetails}>
                    <Eye className="w-4 h-4 mr-2" />
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
          src={getCarImageUrl(car, { width: 400, height: 300, crop: 'fill', quality: 'auto' })}
          alt={car.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          onClick={handleViewDetails}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-3 right-3 bg-black/20 hover:bg-black/40 text-white border-none"
          onClick={handleToggleFavorite}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
        </Button>
        {car.published && (
          <Badge className="absolute top-3 left-3 bg-green-500">
            Available
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors cursor-pointer"
            onClick={handleViewDetails}>
          {car.title}
        </h3>
        
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {car.year}
          </div>
          <div className="flex items-center">
            <Gauge className="w-3 h-3 mr-1" />
            {car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}
          </div>
          <div className="flex items-center">
            <Fuel className="w-3 h-3 mr-1" />
            {car.fuel_type}
          </div>
        </div>

        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          {car.location} • {dealerName}
        </div>

        {car.average_rating && (
          <div className="flex items-center space-x-1 mb-4">
            {renderStars(Math.round(car.average_rating))}
            <span className="text-sm text-muted-foreground">
              ({car.review_count || 0})
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-primary">
            {formatPrice(car.price)}
          </div>
          <Button size="sm" onClick={handleViewDetails} className="bg-gradient-gold hover:shadow-gold transition-all duration-300">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;