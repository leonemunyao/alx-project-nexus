import { useState, useEffect } from "react";
import { X, Car, Plus, DollarSign, MapPin, Gauge, Fuel, Settings, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { categoriesApi, Category } from "@/services/api";

interface ListCarDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd?: (carData: any) => void;
}

const ListCarDialog = ({ isOpen, onClose, onAdd }: ListCarDialogProps) => {
    const { toast } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
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

    // Fetch categories when dialog opens
    useEffect(() => {
        const fetchCategories = async () => {
            if (isOpen && categories.length === 0) {
                setIsLoadingCategories(true);
                try {
                    const fetchedCategories = await categoriesApi.getCategories()
                    
                    // The API function now handles the response format internally
                    // and always returns an array, so we can safely set it
                    setCategories(fetchedCategories);
                    
                    if (fetchedCategories.length === 0) {
                        toast({
                            title: "No Categories",
                            description: "No categories are available at the moment.",
                            variant: "destructive",
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch categories:', error);
                    setCategories([]); // Ensure categories is always an array
                    toast({
                        title: "Error",
                        description: "Failed to load categories. Please try again.",
                        variant: "destructive",
                    });
                } finally {
                    setIsLoadingCategories(false);
                }
            }
        };

        fetchCategories();
    }, [isOpen, categories.length, toast]);

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

        // Call the onAdd callback if provided
        if (onAdd) {
            onAdd({ ...formData, images });
        }

        toast({
            title: "Car listed successfully!",
            description: "Your vehicle has been added to the inventory.",
        });

        // Reset form and close dialog
        setFormData({
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
        setImages([]);
        onClose();
    };

    const carMakes = [
        "Toyota", "Mercedes-Benz", "BMW", "Audi", "Volkswagen", "Nissan",
        "Honda", "Ford", "Hyundai", "Kia", "Mazda", "Subaru", "Mitsubishi"
    ];

    const conditions = [
        "New", "Ex-Uk", "Ex-Japan"
    ];

    const locations = [
        "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Thika"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2020 + 2 }, (_, i) => currentYear + 1 - i);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Car className="w-6 h-6 text-primary" />
                        List Your Vehicle
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Fill in the details below to list your vehicle for sale
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Vehicle Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Car className="w-5 h-5 text-primary" />
                                Vehicle Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {isLoadingCategories ? (
                                                <div className="px-2 py-1 text-sm text-muted-foreground">Loading categories...</div>
                                            ) : !Array.isArray(categories) || categories.length === 0 ? (
                                                <div className="px-2 py-1 text-sm text-muted-foreground">No categories available</div>
                                            ) : (
                                                categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))
                                            )}
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
                                    rows={3}
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
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Camera className="w-5 h-5 text-primary" />
                                Vehicle Photos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Upload vehicle images (max 10 images)
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
                                    <p className="text-sm text-primary mt-2">
                                        {images.length} image(s) selected
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gradient-gold hover:shadow-gold transition-all duration-300"
                        >
                            List Vehicle
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ListCarDialog;