import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Star, MapPin, Calendar, Gauge, Fuel, Settings, Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { carsApi, reviewsApi, favoritesApi, Review, Car } from "@/services/api";
import Header from "@/components/Header";

const CarDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  
  const [car, setCar] = useState<Car | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadCarDetails();
    }
  }, [id]);

  const loadCarDetails = async () => {
    try {
      setLoading(true);
      const carData = await carsApi.getCarDetails(parseInt(id!));
      setCar(carData);
      
      // Load reviews
      const reviewsData = await reviewsApi.getCarReviews(parseInt(id!));
      setReviews(reviewsData);
      
      // Check if favorited (if user is authenticated)
      if (isAuthenticated) {
        try {
          const favorites = await favoritesApi.getFavorites();
          const isFav = favorites.some(fav => fav.car.id === carData.id);
          setIsFavorited(isFav);
        } catch (error) {
          // User might not have favorites yet
          setIsFavorited(false);
        }
      }
    } catch (error) {
      console.error('Failed to load car details:', error);
      toast({
        title: "Error",
        description: "Failed to load car details. Please try again.",
        variant: "destructive",
      });
      navigate('/cars');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add cars to your favorites.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFavorited) {
        // Remove from favorites
        const favorites = await favoritesApi.getFavorites();
        const favorite = favorites.find(fav => fav.car.id === car?.id);
        if (favorite) {
          await favoritesApi.removeFavorite(favorite.id);
          setIsFavorited(false);
          toast({
            title: "Removed from Favorites",
            description: "Car removed from your favorites.",
          });
        }
      } else {
        // Add to favorites
        await favoritesApi.addFavorite(car!.id);
        setIsFavorited(true);
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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to submit a review.",
        variant: "destructive",
      });
      return;
    }

    try {
      setReviewLoading(true);
      const review = await reviewsApi.createReview(car!.id, newReview);
      setReviews([review, ...reviews]);
      setNewReview({ rating: 5, comment: "" });
      toast({
        title: "Review Submitted",
        description: "Thank you for your review!",
      });
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setReviewLoading(false);
    }
  };

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
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading car details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Car Not Found</h1>
            <Button onClick={() => navigate('/cars')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cars
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const dealer = typeof car.dealer === 'object' ? car.dealer : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/cars')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cars
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                {car.images && car.images.length > 0 ? (
                  <div className="relative">
                    <img
                      src={car.images[currentImageIndex]?.image_url || "/placeholder.svg"}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-96 object-cover rounded-t-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                    
                    {/* Image Navigation */}
                    {car.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {car.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-96 bg-muted flex items-center justify-center rounded-t-lg">
                    <p className="text-muted-foreground">No images available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Car Information */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {car.year} {car.make} {car.model}
                    </CardTitle>
                    <p className="text-muted-foreground">{car.title}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {formatPrice(car.price)}
                    </div>
                    <Badge className={car.published ? 'bg-green-500' : 'bg-yellow-500'}>
                      {car.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Car Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-medium">{car.year}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Mileage</p>
                      <p className="font-medium">{car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Fuel className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fuel Type</p>
                      <p className="font-medium">{car.fuel_type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Transmission</p>
                      <p className="font-medium">{car.transmission}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Location */}
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{car.location}</p>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{car.description}</p>
                </div>

                <Separator />

                {/* Reviews Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Reviews</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {renderStars(car.average_rating || 0)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({car.review_count || 0} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Add Review Form */}
                  {isAuthenticated && (
                    <Card className="mb-4">
                      <CardHeader>
                        <CardTitle className="text-lg">Write a Review</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Rating</label>
                            <div className="flex space-x-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                                  className="focus:outline-none"
                                >
                                  <Star
                                    className={`w-6 h-6 ${
                                      i < newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-2 block">Comment</label>
                            <Textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              placeholder="Share your experience with this car..."
                              rows={3}
                              required
                            />
                          </div>
                          
                          <Button type="submit" disabled={reviewLoading}>
                            {reviewLoading ? "Submitting..." : "Submit Review"}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No reviews yet. Be the first to review this car!
                      </p>
                    ) : (
                      reviews.map((review) => (
                        <Card key={review.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium">
                                  {review.user.first_name} {review.user.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    onClick={handleToggleFavorite}
                    variant={isFavorited ? "default" : "outline"}
                    className="w-full"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                    {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Button>
                  
                  {dealer && (
                    <>
                      <Button variant="outline" className="w-full">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Dealer
                      </Button>
                      
                      <Button variant="outline" className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Dealer
                      </Button>
                      
                      <Button variant="outline" className="w-full">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dealer Information */}
            {dealer && (
              <Card>
                <CardHeader>
                  <CardTitle>Dealer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">{dealer.first_name} {dealer.last_name}</p>
                      <p className="text-sm text-muted-foreground">Verified Dealer</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{dealer.phone}</p>
                    </div>
                    
                    {dealer.address && (
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{dealer.address}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Car Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Make</span>
                    <span className="font-medium">{car.make}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-medium">{car.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Year</span>
                    <span className="font-medium">{car.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Condition</span>
                    <span className="font-medium">{car.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fuel Type</span>
                    <span className="font-medium">{car.fuel_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transmission</span>
                    <span className="font-medium">{car.transmission}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
