
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { generateNumericId } from '@/lib/utils'; 
import { translations } from '@/lib/translations';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(localStorage.getItem('worksani_lang') || 'en');
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = translations[language] || translations.en;

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116: 0 rows means profile not yet created by trigger
          console.error('Error fetching profile:', error);
          toast({ title: t.auth?.fetchProfileErrorTitle || "Error", description: t.auth?.fetchProfileErrorDesc || "Could not fetch user profile.", variant: "destructive" });
        } else {
          setUser(profile || { id: session.user.id, email: session.user.email, ...session.user.user_metadata });
        }
      }
      setLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile on auth change:', error);
        } else {
           setUser(profile || { id: session.user.id, email: session.user.email, ...session.user.user_metadata });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [language, toast, t.auth]);
  
  useEffect(() => {
    localStorage.setItem('worksani_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const login = async (email, password) => {
    setLoading(true);
    const { data: sessionData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      toast({ title: t.auth?.loginFailedTitle || "Login Failed", description: error.message, variant: "destructive" });
      throw error;
    }

    if (sessionData?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        setLoading(false);
        toast({ title: t.auth?.fetchProfileErrorTitle || "Error", description: t.auth?.fetchProfileErrorDesc || "Could not fetch user profile.", variant: "destructive" });
        throw profileError;
      }
      
      if (!profile) {
        setLoading(false);
        toast({ title: t.auth?.profileNotFoundTitle || "Profile Not Found", description: t.auth?.profileNotFoundDesc || "User profile could not be loaded. Please try again or contact support.", variant: "destructive" });
        await supabase.auth.signOut();
        throw new Error("Profile not found after login");
      }

      if (profile?.role === 'supplier' && profile?.verification_status !== 'verified') {
        await supabase.auth.signOut(); 
        setLoading(false);
        toast({ title: t.auth?.accountNotVerifiedTitle || "Account Not Verified", description: `${t.auth?.accountNotVerifiedDesc || "Your supplier account is currently"} ${profile?.verification_status}. ${t.auth?.waitForApproval || "Please wait for admin approval or contact support if rejected."}`, variant: "destructive", duration: 7000 });
        throw new Error("Account not verified");
      }
      if (profile?.account_status === 'blocked') {
        await supabase.auth.signOut();
        setLoading(false);
        toast({ title: t.auth?.accountBlockedTitle || "Account Blocked", description: t.auth?.accountBlockedDesc || "Your account has been blocked. Please contact support.", variant: "destructive", duration: 7000 });
        throw new Error("Account blocked");
      }

      setUser(profile);
      setLoading(false);
      toast({ title: t.auth?.loginSuccessTitle || "Login Successful!", description: `${t.auth?.welcomeBack || "Welcome back,"} ${profile?.name || sessionData.user.email}!`, variant: "default" });
      
      if (profile?.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
      return profile;
    }
    setLoading(false);
    return null;
  };

  const register = async (userData) => {
    setLoading(true);
    const { email, password, name, role, ...otherData } = userData;

    // IMPORTANT: For email verification links to work correctly, ensure your Supabase project's
    // "Site URL" and "Additional Redirect URLs" are configured in Authentication -> URL Configuration.
    // Site URL should be your production URL. Additional Redirect URLs should include localhost for development.
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { // This data is passed to the 'handle_new_user' trigger via raw_user_meta_data
          name,
          role,
          numeric_id: generateNumericId(), // Trigger can also generate this
          member_since: new Date().toISOString(), // Trigger can also set this
          profile_photo_url: '',
          past_projects_gallery: [], 
          supplier_reviews: [], 
          phone: otherData.phone || '',
          bio: role === 'customer' ? '' : (otherData.bio || ''),
          languages: otherData.languages || ['en'],
          wallet_balance: 0, // Initial for customer
          bid_balance: 0, // Initial for supplier
          transaction_history: [],
          verification_status: role === 'supplier' ? 'pending' : 'not_applicable', // 'not_applicable' or null for customer
          company_name: role === 'supplier' ? (otherData.companyName || '') : null,
          category: role === 'supplier' ? (otherData.category || '') : null,
          company_registration_document_url: role === 'supplier' ? (otherData.companyRegistrationDocument?.url || null) : null,
          admin_verification_notes: '',
          account_status: 'active',
        }
      }
    });

    if (signUpError) {
      setLoading(false);
      toast({ title: t.auth?.registrationFailedTitle || "Registration Failed", description: signUpError.message, variant: "destructive" });
      throw signUpError;
    }
    
    // After signUp, the handle_new_user trigger in Supabase should create the profile.
    // We don't need to manually insert it here if the trigger is working correctly.
    // The onAuthStateChange listener will fetch the profile.

    if (signUpData.user) {
      if (role === 'supplier') {
        setLoading(false);
        toast({ title: t.auth?.registrationSubmittedTitle || "Registration Submitted!", description: `${t.auth?.welcome || "Welcome,"} ${name || email}! ${t.auth?.supplierAccountPending || "Your supplier account is pending verification. Please check your email to confirm your address."}`, variant: "default", duration: 10000 });
        navigate('/login'); 
      } else { 
        // For customers, they might be auto-logged in or need to confirm email first.
        // Supabase default behavior is to send a confirmation email.
        setLoading(false);
        toast({ title: t.auth?.registrationSuccessTitle || "Registration Successful!", description: `${t.auth?.welcome || "Welcome,"} ${name || email}! ${t.auth?.checkEmailConfirmation || "Please check your email to confirm your address."}`, variant: "default", duration: 10000 });
        navigate('/login'); // Navigate to login, user needs to confirm email
      }
      return signUpData.user;
    }
    setLoading(false);
    return null;
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: t.auth?.logoutErrorTitle || "Logout Error", description: error.message, variant: "destructive" });
    } else {
      setUser(null);
      toast({ title: t.auth?.loggedOutTitle || "Logged Out", description: t.auth?.loggedOutDesc || "You have been successfully logged out.", variant: "default" });
    }
    setLoading(false);
    navigate('/login');
  };
  
  const updateUserContextProfile = async (updatedDataPartial) => {
    if (user?.id) {
      const dataToUpdate = { ...updatedDataPartial };
      // Remove fields that should not be updated directly by client or are auto-managed
      delete dataToUpdate.id;
      delete dataToUpdate.created_at; 
      delete dataToUpdate.email; // Email changes should go through Supabase auth methods

      // Ensure JSONB fields are actual JSON arrays/objects
      ['transaction_history', 'past_projects_gallery', 'supplier_reviews'].forEach(field => {
        if (dataToUpdate[field] && typeof dataToUpdate[field] === 'string') {
          try { 
            dataToUpdate[field] = JSON.parse(dataToUpdate[field]); 
          } catch (e) { 
            console.error(`Error parsing ${field} for update`, e); 
            // Decide handling: delete field, or set to default like []
            // For safety, if parsing fails, we might not want to send it.
            // Or, ensure it's always an array from the source.
            // For now, let's assume it should be an array if it exists.
            if (!Array.isArray(dataToUpdate[field])) {
                 dataToUpdate[field] = []; // Default to empty array if parsing fails and it's not already an array
            }
          }
        } else if (dataToUpdate[field] === undefined && user[field] !== undefined) {
          // If field is not in updatedDataPartial, but exists in current user, keep current value
          dataToUpdate[field] = user[field];
        } else if (dataToUpdate[field] === undefined && user[field] === undefined) {
          // If field is not in updatedDataPartial and not in current user, initialize as empty array for jsonb
           if (['transaction_history', 'past_projects_gallery', 'supplier_reviews'].includes(field)) {
             dataToUpdate[field] = [];
           }
        }
      });


      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(dataToUpdate)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        toast({ title: t.auth?.profileUpdateErrorTitle || "Profile Update Failed", description: error.message, variant: "destructive" });
        return;
      }
      if (updatedProfile) {
        setUser(updatedProfile);
      }
    }
  };

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
  };

  const value = {
    user,
    setUser, 
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isSupplier: user?.role === 'supplier',
    isCustomer: user?.role === 'customer',
    updateUserContextProfile,
    language,
    changeLanguage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
