import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Car {
  make: string;
  model: string;
  year: number;
  price: number;
  image: string;
  mileage: number;
  condition: string;
  status: "available" | "sold" | "pending";
}

interface AddCarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (car: Omit<Car, "id">) => void;
}

const AddCarDialog = ({ isOpen, onClose, onAdd }: AddCarDialogProps) => {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    image: "/src/assets/lamborghini-1.jpg", // Default image
    mileage: 0,
    condition: "Good",
    status: "available" as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
    // Reset form
    setFormData({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      price: 0,
      image: "/src/assets/lamborghini-1.jpg",
      mileage: 0,
      condition: "Good",
      status: "available",
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Car</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => handleInputChange("make", e.target.value)}
                placeholder="Toyota"
                required
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
                placeholder="Camry"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange("year", parseInt(e.target.value))}
                min={1990}
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", parseInt(e.target.value))}
                min={0}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mileage">Mileage</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => handleInputChange("mileage", parseInt(e.target.value))}
                min={0}
                required
              />
            </div>
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => handleInputChange("condition", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Like New">Like New</SelectItem>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Needs Work">Needs Work</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="image">Image URL</Label>
            <Select
              value={formData.image}
              onValueChange={(value) => handleInputChange("image", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="/src/assets/lamborghini-1.jpg">Lamborghini 1</SelectItem>
                <SelectItem value="/src/assets/lamborghini-2.jpg">Lamborghini 2</SelectItem>
                <SelectItem value="/src/assets/lamborghini-3.jpg">Lamborghini 3</SelectItem>
                <SelectItem value="/src/assets/lamborghini-4.jpg">Lamborghini 4</SelectItem>
                <SelectItem value="/src/assets/prado-2019.jpg">Prado 2019</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value as "available" | "sold" | "pending")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-gold hover:shadow-gold">
              Add Car
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCarDialog;