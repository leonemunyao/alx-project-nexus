import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Car as CarIcon, Plus, Edit, Trash2, LogOut, BarChart3, User, Building2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EditCarDialog from "@/components/EditCarDialog";
import ListCarDialog from "@/components/ListCarDialog";
import ProfileDialog from "@/components/ProfileDialog";
import DealershipDialog from "@/components/DealershipDialog";
import { Car, dealerCarsApi, dealershipApi, Dealership } from "@/services/api";

interface Dealer {
  name: string;
  email: string;
  phone?: string;
}

const Dashboard = () => {
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [dealership, setDealership] = useState<Dealership | null>(null);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [isListCarDialogOpen, setIsListCarDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isDealershipDialogOpen, setIsDealershipDialogOpen] = useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dealershipLoading, setDealershipLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();

  useEffect(() => {
    // Check if user is logged in and is a dealer
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/signin");
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'DEALER') {
      navigate("/signin");
      return;
    }

    // Set dealer data from the user data
    setDealer({
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      phone: undefined
    });

    // Load cars from API
    const loadCars = async () => {
      try {
        setLoading(true);
        const carsData = await dealerCarsApi.getCars();
        setCars(carsData);
      } catch (error) {
        console.error('Failed to load cars:', error);
        toast({
          title: "Failed to load cars",
          description: "There was an error loading your car inventory",
          variant: "destructive",
        });
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    // Load dealership profile
    const loadDealership = async () => {
      try {
        setDealershipLoading(true);
        const dealershipData = await dealershipApi.getDealershipProfile();
        // Ensure all array fields are properly normalized
        const normalizedDealership = {
          ...dealershipData,
          specialties: Array.isArray(dealershipData.specialties) ? dealershipData.specialties : [],
          locations_served: Array.isArray(dealershipData.locations_served) ? dealershipData.locations_served : [],
          total_cars: typeof dealershipData.total_cars === 'number' ? dealershipData.total_cars : 0,
          average_rating: typeof dealershipData.average_rating === 'number' ? dealershipData.average_rating : 0
        };
        setDealership(normalizedDealership);
      } catch (error) {
        console.error('Failed to load dealership:', error);
        setDealership(null);
      } finally {
        setDealershipLoading(false);
      }
    };

    loadCars();
    loadDealership();
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account",
      });
      navigate("/");
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout failed",
        description: "There was an error signing you out",
        variant: "destructive",
      });
    }
  };

  const handleEditCar = async (updatedCar: Car) => {
    // Refresh the entire car list to ensure we get the latest data including images
    try {
      console.log('Updated car received from API:', updatedCar);
      const carsData = await dealerCarsApi.getCars();
      console.log('Refreshed cars data:', carsData);
      setCars(carsData);
      setEditingCar(null);
    } catch (error) {
      console.error('Failed to refresh cars after editing:', error);
      // Fallback to just updating the local state
      setCars(cars.map(car => car.id === updatedCar.id ? updatedCar : car));
      setEditingCar(null);
    }
  };

  const handleAddCar = async (carData: any) => {
    // Car was added via the API in the dialog, so we just need to refresh the list
    try {
      const carsData = await dealerCarsApi.getCars();
      setCars(carsData);
      toast({
        title: "Car added successfully",
        description: `${carData.make} ${carData.model} has been added to your inventory`,
      });
    } catch (error) {
      console.error('Failed to refresh cars after adding:', error);
      toast({
        title: "Car added but list refresh failed",
        description: "Please refresh the page to see your new car",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCar = async (carId: string) => {
    const carIdNum = parseInt(carId);
    const car = cars.find(c => c.id === carIdNum);

    try {
      await dealerCarsApi.deleteCar(carIdNum);
      setCars(cars.filter(c => c.id !== carIdNum));
      toast({
        title: "Car deleted",
        description: `${car?.make} ${car?.model} has been removed from your inventory`,
      });
    } catch (error) {
      console.error('Failed to delete car:', error);
      toast({
        title: "Failed to delete car",
        description: "There was an error deleting the car",
        variant: "destructive",
      });
    }
  };

  const handleDealershipSuccess = (updatedDealership: Dealership) => {
    // Ensure all array fields are properly normalized
    const normalizedDealership = {
      ...updatedDealership,
      specialties: Array.isArray(updatedDealership.specialties) ? updatedDealership.specialties : [],
      locations_served: Array.isArray(updatedDealership.locations_served) ? updatedDealership.locations_served : [],
      total_cars: typeof updatedDealership.total_cars === 'number' ? updatedDealership.total_cars : 0,
      average_rating: typeof updatedDealership.average_rating === 'number' ? updatedDealership.average_rating : 0
    };
    setDealership(normalizedDealership);
    setIsDealershipDialogOpen(false);
  };

  const handleTogglePublish = async () => {
    if (!dealership) return;

    setIsTogglingPublish(true);
    try {
      const result = await dealershipApi.togglePublish();
      setDealership(prev => prev ? { ...prev, published: result.published } : null);
      toast({
        title: "Success",
        description: result.message,
      });
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      toast({
        title: "Error",
        description: "Failed to update publish status",
        variant: "destructive",
      });
    } finally {
      setIsTogglingPublish(false);
    }
  };

  if (!dealer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
                <CarIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {dealer.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setIsProfileDialogOpen(true)} variant="outline" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </Button>
              <Button onClick={handleLogout} variant="outline" className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
              <CarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cars.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {cars.filter(car => car.published).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {cars.filter(car => !car.published).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${cars.reduce((sum, car) => sum + parseFloat(car.price), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dealership Management */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle>Dealership Profile</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage your dealership information and branding
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsDealershipDialogOpen(true)}
                variant={dealership ? "outline" : "default"}
                className={dealership ? "" : "bg-gradient-gold hover:shadow-gold"}
              >
                {dealership ? (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Dealership
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Dealership
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {dealershipLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading dealership...</p>
                </div>
              </div>
            ) : dealership ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Dealership Info */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-start space-x-4">
                    {dealership.avatar_url && (
                      <img
                        src={dealership.avatar_url}
                        alt={dealership.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{dealership.name}</h3>
                      {dealership.is_verified && (
                        <Badge className="bg-green-500 text-white mt-1">
                          ✓ Verified
                        </Badge>
                      )}
                      <p className="text-muted-foreground mt-2">{dealership.description}</p>
                      {dealership.website && (
                        <a
                          href={dealership.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm mt-2 inline-block"
                        >
                          {dealership.website}
                        </a>
                      )}
                    </div>
                  </div>

                  {Array.isArray(dealership.specialties) && dealership.specialties.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {dealership.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dealership Stats */}
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Dealership Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Cars:</span>
                        <span className="font-medium">{dealership.total_cars}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Locations:</span>
                        <span className="font-medium">{dealership.locations_served.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{dealership.average_rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {dealership.locations_served.length > 0 && (
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Locations Served</h4>
                      <div className="space-y-1 text-sm">
                        {dealership.locations_served.map((location, index) => (
                          <div key={index} className="text-muted-foreground">
                            {location}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Publish Toggle */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Visibility</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {dealership.published ? 'Published' : 'Draft'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {dealership.published 
                            ? 'Your dealership is visible to customers' 
                            : 'Your dealership is not visible to customers'
                          }
                        </p>
                      </div>
                      <Button
                        onClick={handleTogglePublish}
                        variant={dealership.published ? "destructive" : "default"}
                        size="sm"
                        className={dealership.published ? "" : "bg-gradient-gold hover:shadow-gold"}
                        disabled={isTogglingPublish}
                      >
                        {isTogglingPublish ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : dealership.published ? (
                          'Unpublish'
                        ) : (
                          'Publish'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No dealership profile yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your dealership profile to showcase your business and attract more customers
                </p>
                <Button onClick={() => setIsDealershipDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Dealership Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cars Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Car Inventory</CardTitle>
              <Button
                onClick={() => setIsListCarDialogOpen(true)}
                className="bg-gradient-gold hover:shadow-gold transition-all duration-300 gap-2"
              >
                <Plus className="w-4 h-4" />
                List Your Car
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your cars...</p>
                </div>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-12">
                <CarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No cars listed yet</h3>
                <p className="text-muted-foreground mb-4">Start by adding your first car to the inventory</p>
                <Button onClick={() => setIsListCarDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  List Your First Car
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <Card key={car.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      <img
                        src={car.images && car.images.length > 0 ? car.images[0].image_url : "/placeholder.svg"}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                      <Badge
                        className={`absolute top-2 right-2 ${car.published ? 'bg-green-500' : 'bg-yellow-500'}`}
                      >
                        {car.published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <div className="space-y-1 text-sm text-muted-foreground mb-4">
                        <p>Price: ${parseFloat(car.price).toLocaleString()}</p>
                        <p>Mileage: {car.mileage ? car.mileage.toLocaleString() : '0'} miles</p>
                        <p>Condition: {car.condition}</p>
                        <p>Location: {car.location}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCar(car)}
                          className="flex-1 gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCar(car.id.toString())}
                          className="flex-1 gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <ListCarDialog
        isOpen={isListCarDialogOpen}
        onClose={() => setIsListCarDialogOpen(false)}
        onAdd={handleAddCar}
      />

      {editingCar && (
        <EditCarDialog
          isOpen={!!editingCar}
          onClose={() => setEditingCar(null)}
          onEdit={handleEditCar}
          car={editingCar}
        />
      )}

      <ProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
        userRole="DEALER"
      />

      <DealershipDialog
        isOpen={isDealershipDialogOpen}
        onClose={() => setIsDealershipDialogOpen(false)}
        onSuccess={handleDealershipSuccess}
        dealership={dealership}
      />
    </div>
  );
};

export default Dashboard;