import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Plus, Edit, Trash2, LogOut, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AddCarDialog from "@/components/AddCarDialog";
import EditCarDialog from "@/components/EditCarDialog";

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  image: string;
  mileage: number;
  condition: string;
  status: "available" | "sold" | "pending";
}

interface Dealer {
  name: string;
  email: string;
  phone?: string;
}

const Dashboard = () => {
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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

    // Load dummy cars data
    const dummyCars: Car[] = [
      {
        id: "1",
        make: "Toyota",
        model: "Camry",
        year: 2022,
        price: 28000,
        image: "/src/assets/prado-2019.jpg",
        mileage: 15000,
        condition: "Excellent",
        status: "available"
      },
      {
        id: "2",
        make: "Honda",
        model: "Accord",
        year: 2021,
        price: 26500,
        image: "/src/assets/lamborghini-1.jpg",
        mileage: 22000,
        condition: "Good",
        status: "sold"
      },
      {
        id: "3",
        make: "BMW",
        model: "X5",
        year: 2023,
        price: 55000,
        image: "/src/assets/lamborghini-2.jpg",
        mileage: 5000,
        condition: "Like New",
        status: "pending"
      },
    ];

    setCars(dummyCars);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("dealer");
    toast({
      title: "Logged out successfully",
      description: "You have been signed out of your account",
    });
    navigate("/");
  };

  const handleAddCar = (carData: Omit<Car, "id">) => {
    const newCar: Car = {
      ...carData,
      id: Date.now().toString(),
    };
    setCars([...cars, newCar]);
    toast({
      title: "Car added successfully",
      description: `${carData.make} ${carData.model} has been added to your inventory`,
    });
  };

  const handleEditCar = (carData: Omit<Car, "id">) => {
    if (!editingCar) return;

    const updatedCar = { ...carData, id: editingCar.id };
    setCars(cars.map(car => car.id === editingCar.id ? updatedCar : car));
    toast({
      title: "Car updated successfully",
      description: `${carData.make} ${carData.model} has been updated`,
    });
    setEditingCar(null);
  };

  const handleDeleteCar = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    setCars(cars.filter(c => c.id !== carId));
    toast({
      title: "Car deleted",
      description: `${car?.make} ${car?.model} has been removed from your inventory`,
    });
  };

  const getStatusColor = (status: Car["status"]) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "sold": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
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
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">LeoNexus Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {dealer.name}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cars.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {cars.filter(car => car.status === "available").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {cars.filter(car => car.status === "sold").length}
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
                ${cars.reduce((sum, car) => sum + car.price, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cars Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Car Inventory</CardTitle>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-gold hover:shadow-gold transition-all duration-300 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Car
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <Card key={car.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={car.image}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                    <Badge
                      className={`absolute top-2 right-2 ${getStatusColor(car.status)}`}
                    >
                      {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">
                      {car.year} {car.make} {car.model}
                    </h3>
                    <div className="space-y-1 text-sm text-muted-foreground mb-4">
                      <p>Price: ${car.price.toLocaleString()}</p>
                      <p>Mileage: {car.mileage.toLocaleString()} miles</p>
                      <p>Condition: {car.condition}</p>
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
                        onClick={() => handleDeleteCar(car.id)}
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
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddCarDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
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
    </div>
  );
};

export default Dashboard;