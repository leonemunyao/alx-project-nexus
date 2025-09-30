import { useState, useEffect } from "react";
import { User, Phone, MapPin, Mail, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { profilesApi, DealerProfile, BuyerProfile } from "@/services/api";

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'DEALER' | 'BUYER';
}

const ProfileDialog = ({ isOpen, onClose, userRole }: ProfileDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [dealerProfile, setDealerProfile] = useState<Partial<DealerProfile>>({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
  });
  
  const [buyerProfile, setBuyerProfile] = useState<Partial<BuyerProfile>>({
    first_name: "",
    last_name: "",
    phone: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen, userRole]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      if (userRole === 'DEALER') {
        const profile = await profilesApi.getDealerProfile();
        setDealerProfile(profile);
      } else {
        const profile = await profilesApi.getBuyerProfile();
        setBuyerProfile(profile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (userRole === 'DEALER') {
        await profilesApi.updateDealerProfile(dealerProfile);
        toast({
          title: "Profile Updated",
          description: "Your dealer profile has been updated successfully.",
        });
      } else {
        await profilesApi.updateBuyerProfile(buyerProfile);
        toast({
          title: "Profile Updated",
          description: "Your buyer profile has been updated successfully.",
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (userRole === 'DEALER') {
      setDealerProfile(prev => ({ ...prev, [field]: value }));
    } else {
      setBuyerProfile(prev => ({ ...prev, [field]: value }));
    }
  };

  const currentProfile = userRole === 'DEALER' ? dealerProfile : buyerProfile;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your {userRole.toLowerCase()} profile information
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={currentProfile.first_name || ""}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={currentProfile.last_name || ""}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="phone"
                        placeholder="e.g., +254 700 000 000"
                        className="pl-10"
                        value={currentProfile.phone || ""}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        className="pl-10 bg-muted"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dealer-specific fields */}
            {userRole === 'DEALER' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your business address..."
                      rows={3}
                      value={dealerProfile.address || ""}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Username</Label>
                    <Input value={user?.username || ""} disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label>Account Type</Label>
                    <Input value={userRole} disabled className="bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-gold hover:shadow-gold transition-all duration-300"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
