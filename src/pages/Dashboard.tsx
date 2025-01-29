import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, GamepadIcon, Clock, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [isUpdateEmailOpen, setIsUpdateEmailOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchLastLogin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.last_sign_in_at) {
        setLastLogin(new Date(session.user.last_sign_in_at).toLocaleString());
      }
    };

    fetchLastLogin();
  }, [user, navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEmail = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      
      if (error) throw error;

      toast({
        title: "Email update initiated",
        description: "Please check your new email for a confirmation link.",
      });
      setIsUpdateEmailOpen(false);
    } catch (error: any) {
      toast({
        title: "Error updating email",
        description: error.message || "There was a problem updating your email. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-7xl mx-auto">
        // ... keep existing code (welcome section and cards grid)

        <Card className="mt-8 bg-black/30 backdrop-blur-lg border-[#00ff8c]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#00ff8c]" />
              Account Settings
            </CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
              <Dialog open={isUpdateEmailOpen} onOpenChange={setIsUpdateEmailOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="border-[#00ff8c]/20 hover:bg-[#00ff8c]/10"
                  >
                    Update Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/90 border-[#00ff8c]/20">
                  <DialogHeader>
                    <DialogTitle>Update Email Address</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      type="email"
                      placeholder="New email address"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="border-[#00ff8c]/20 bg-black/50"
                    />
                    <Button 
                      onClick={handleUpdateEmail}
                      className="w-full bg-[#00ff8c] hover:bg-[#00ff8c]/80 text-black"
                    >
                      Update Email
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Password</h3>
                <p className="text-sm text-gray-400">Last updated: Never</p>
              </div>
              <Button 
                variant="outline"
                className="border-[#00ff8c]/20 hover:bg-[#00ff8c]/10"
                onClick={() => navigate('/settings/password')}
              >
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
