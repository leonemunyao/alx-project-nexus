import { useState, useEffect } from "react";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { dealershipApi, Dealership, DealershipCreateUpdate } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface DealershipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (dealership: Dealership) => void;
  dealership?: Dealership | null;
}

const DealershipDialog = ({ isOpen, onClose, onSuccess, dealership }: DealershipDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [formData, setFormData] = useState<DealershipCreateUpdate>({
    name: "",
    description: "",
    specialties: [],
    website: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (dealership) {
      setFormData({
        name: dealership.name,
        description: dealership.description,
        specialties: dealership.specialties,
        website: dealership.website || "",
      });
      setAvatarPreview(dealership.avatar_url || null);
    } else {
      setFormData({
        name: "",
        description: "",
        specialties: [],
        website: "",
      });
      setAvatarPreview(null);
    }
  }, [dealership, isOpen]);

  const handleInputChange = (field: keyof DealershipCreateUpdate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSpecialty = () => {
    const specialty = specialtyInput.trim();
    if (specialty && !formData.specialties.includes(specialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }));
      setSpecialtyInput("");
    }
  };

  const removeSpecialty = (specialtyToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(specialty => specialty !== specialtyToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialty();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Dealership name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "Dealership description is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let result: Dealership;
      
      if (dealership) {
        result = await dealershipApi.updateDealership(formData);
        toast({
          title: "Success",
          description: "Dealership profile updated successfully",
        });
      } else {
        result = await dealershipApi.createDealership(formData);
        toast({
          title: "Success",
          description: "Dealership profile created successfully",
        });
      }

      onSuccess?.(result);
      onClose();
    } catch (error) {
      console.error('Error saving dealership:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save dealership profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {dealership ? "Edit Dealership Profile" : "Create Dealership Profile"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dealership Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Dealership Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter dealership name"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your dealership, services, and what makes you unique"
              rows={4}
              required
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder="https://alx-project-nexus-leone.vercel.app.com"
            />
          </div>

          {/* Avatar Upload */}
          <div className="space-y-2">
            <Label>Dealership Logo/Avatar</Label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <Label
                  htmlFor="avatar"
                  className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Logo</span>
                </Label>
              </div>
              {avatarPreview && (
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, avatar: undefined }));
                      setAvatarPreview(null);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Specialties */}
          <div className="space-y-2">
            <Label>Specialties</Label>
            <div className="flex space-x-2">
              <Input
                value={specialtyInput}
                onChange={(e) => setSpecialtyInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add specialty (e.g., Luxury Cars, SUVs)"
              />
              <Button
                type="button"
                onClick={addSpecialty}
                disabled={!specialtyInput.trim()}
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {formData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.specialties.map((specialty, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <span>{specialty}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeSpecialty(specialty)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-gold hover:shadow-gold"
            >
              {isLoading ? "Saving..." : dealership ? "Update Dealership" : "Create Dealership"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DealershipDialog;
