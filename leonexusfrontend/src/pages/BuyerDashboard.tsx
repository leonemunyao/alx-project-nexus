import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  CreditCard, 
  Calendar, 
  LogOut, 
  Car, 
  MapPin, 
  Clock, 
  Download,
  Edit,
  Phone,
  Mail,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Buyer {
  name: string;
  email: string;
  phone?: string;
  userType: string;
}

interface Payment {
  id: string;
  carModel: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  receiptUrl: string;
}

interface Booking {
  id: string;
  carModel: string;
  dealerName: string;
  dealerPhone: string;
  date: string;
  time: string;
  location: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
}

const BuyerDashboard = () => {
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if buyer is logged in
    const buyerData = localStorage.getItem("buyer");
    if (!buyerData) {
      navigate("/signin");
      return;
    }

    setBuyer(JSON.parse(buyerData));

    // Load dummy payments data
    const dummyPayments: Payment[] = [
      {
        id: "1",
        carModel: "2022 Toyota Camry",
        amount: 28000,
        date: "2024-01-15",
        status: "completed",
        receiptUrl: "#"
      },
      {
        id: "2",
        carModel: "2021 Honda Accord",
        amount: 26500,
        date: "2024-01-10",
        status: "completed",
        receiptUrl: "#"
      },
      {
        id: "3",
        carModel: "2023 BMW X5",
        amount: 5000,
        date: "2024-01-20",
        status: "pending",
        receiptUrl: "#"
      },
    ];

    // Load dummy bookings data
    const dummyBookings: Booking[] = [
      {
        id: "1",
        carModel: "2023 Mercedes C-Class",
        dealerName: "Premium Motors",
        dealerPhone: "+1 (555) 123-4567",
        date: "2024-01-25",
        time: "10:00 AM",
        location: "123 Main St, Downtown",
        status: "confirmed"
      },
      {
        id: "2",
        carModel: "2022 Audi A4",
        dealerName: "Elite Cars",
        dealerPhone: "+1 (555) 987-6543",
        date: "2024-01-28",
        time: "2:00 PM",
        location: "456 Oak Ave, Uptown",
        status: "pending"
      },
      {
        id: "3",
        carModel: "2021 Lexus ES",
        dealerName: "Luxury Auto",
        dealerPhone: "+1 (555) 456-7890",
        date: "2024-01-18",
        time: "11:30 AM",
        location: "789 Pine Rd, Midtown",
        status: "completed"
      },
    ];

    setPayments(dummyPayments);
    setBookings(dummyBookings);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("buyer");
    toast({
      title: "Logged out successfully",
      description: "You have been signed out of your account",
    });
    navigate("/");
  };

  const getPaymentStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "failed": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getBookingStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "completed": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (!buyer) {
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
                <h1 className="text-2xl font-bold text-foreground">LeoNexus Buyer Portal</h1>
                <p className="text-muted-foreground">Welcome back, {buyer.name}</p>
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
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Test Drives
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  My Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{buyer.name}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{buyer.email}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{buyer.phone || "Not provided"}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-foreground capitalize">{buyer.userType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <Card key={payment.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-foreground">{payment.carModel}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(payment.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold text-lg">${payment.amount.toLocaleString()}</p>
                              <Badge className={getPaymentStatusColor(payment.status)}>
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <Button variant="outline" size="sm" className="gap-2">
                              <Download className="w-4 h-4" />
                              Receipt
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Test Drive Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-foreground">{booking.carModel}</h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Car className="w-4 h-4" />
                                <span>{booking.dealerName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{booking.dealerPhone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(booking.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{booking.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{booking.location}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getBookingStatusColor(booking.status)}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                            
                            {booking.status === "confirmed" && (
                              <Button variant="outline" size="sm">
                                Reschedule
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BuyerDashboard;