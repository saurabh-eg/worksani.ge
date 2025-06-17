// This file's data will now primarily serve as a fallback or for local development
// if Supabase is unavailable. The primary source of truth will be Supabase.
// Consider removing or reducing this file once Supabase integration is stable.
import { v4 as uuidv4 } from 'uuid';

export const initialProjects = [
  // Example data, will be fetched from Supabase
];

export const initialUsers = [
  // Example data, will be fetched from Supabase
  // Admin user might be handled differently or not stored in 'profiles' if using Supabase Auth roles.
];

export const initialSiteSettings = {
  bankAccountInfo: {
    TBC: "GE29TB0000000123456789 (TBC Bank)",
    BOG: "GE92BG0000000987654321 (Bank of Georgia)"
  },
  projectPostingFee: 5.00, 
  bidFee: 1.00,
  theme: {
    primaryColor: "#7C3AED", 
    secondaryColor: "#10B981", 
    textColor: "#1F2937", 
  },
  homepageContent: {
    specialOffer: { title: "Limited Time Offer!", description: "Get 10% off your first project posting this month!", image: "https://images.unsplash.com/photo-1521790797524-3f20387ea560" },
    howItWorksCustomer: [
      { id: 'c1', title: "Post Your Project", icon: "Edit", description: "Describe what you need, set your budget, and add photos." },
      { id: 'c2', title: "Receive Bids", icon: "DollarSign", description: "Verified suppliers will send you their best offers." },
      { id: 'c3', title: "Chat & Hire", icon: "MessageSquare", description: "Discuss details with suppliers and choose the best fit." },
      { id: 'c4', title: "Review & Rate", icon: "Star", description: "Share your experience after the job is done." }
    ],
    howItWorksSupplier: [
      { id: 's1', title: "Create Profile", icon: "UserCircle", description: "Showcase your skills, experience, and past projects." },
      { id: 's2', title: "Find Projects", icon: "Search", description: "Browse relevant job postings in your area." },
      { id: 's3', title: "Place Bids", icon: "DollarSign", description: "Offer competitive prices for jobs you can do." },
      { id: 's4', title: "Get Hired & Paid", icon: "CheckCircle", description: "Complete jobs and build your reputation." }
    ],
  },
  aboutUsContent: "Welcome to WorkSani.ge – Georgia’s go-to platform for home services. We connect homeowners with trusted local professionals in plumbing, painting, electrical work, renovation, and more. Whether you're looking to fix something small or take on a major project, we make it easy to post your needs, receive competitive bids, and hire the right specialist with confidence. With a growing community of verified suppliers and a simple-to-use interface, WorkSani.ge is designed to save you time, stress, and money.",
  aboutUsImage: "https://images.unsplash.com/photo-1580982333389-cca46f167381",
  contactInfo: {
    email: "support@worksani.ge",
    phone: "+995 599 123 456",
    address: "123 Rustaveli Ave, Tbilisi, Georgia",
    businessHours: "Monday – Saturday, 10:00 AM – 6:00 PM"
  },
  contactFormEnabled: true
};

export const initialNotifications = [];