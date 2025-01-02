import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import ProfileImageUpload from "@/components/profile/ProfileImageUpload";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";
import { Separator } from "@/components/ui/separator";

export default function Signup() {
  const navigate = useNavigate();
  const { user, signUp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showManualSignup, setShowManualSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  });

  useEffect(() => {
    if (user && !showImageUpload) {
      navigate("/dashboard");
    }
  }, [user, navigate, showImageUpload]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signUp(formData.email, formData.password, formData.name);
      setShowImageUpload(true);
      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error creating account",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <img 
        src="https://storage.googleapis.com/msgsndr/TivPy8SDoCwta90bdzyN/media/672aa6ff53c79865cd710429.png"
        alt="FTTHLV Logo"
        className="w-48 mb-8"
      />
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Create Your Account</h2>
        
        {!showManualSignup && (
          <>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#800000',
                      brandAccent: '#4A0404',
                      inputBackground: 'white',
                      inputText: 'black',
                      inputPlaceholder: 'darkgray',
                    }
                  }
                },
                style: {
                  button: {
                    background: '#800000',
                    color: 'white',
                  },
                  anchor: {
                    color: '#800000',
                  },
                  input: {
                    background: 'white',
                    borderColor: '#e5e7eb',
                    color: 'black',
                  },
                  label: {
                    color: '#374151',
                  },
                },
              }}
              theme="default"
              providers={["google"]}
              redirectTo={window.location.origin}
              view="sign_up"
            />
            <div className="mt-6">
              <Separator className="my-4" />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowManualSignup(true)}
              >
                Sign up with email instead
              </Button>
            </div>
          </>
        )}

        {showManualSignup && (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
            <div className="mt-4">
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm text-gray-600"
                onClick={() => setShowManualSignup(false)}
              >
                Back to all sign up options
              </Button>
            </div>
          </>
        )}
      </div>

      {user && (
        <ProfileImageUpload
          userId={user.id}
          open={showImageUpload}
          onClose={() => {
            setShowImageUpload(false);
            navigate("/dashboard");
          }}
        />
      )}
    </div>
  );
}