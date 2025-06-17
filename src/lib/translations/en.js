import { common } from './en/common';
import { header } from './en/header';
import { footer } from './en/footer';
import { auth } from './en/auth';
import { adminPage } from './en/adminPage';
import { dashboardPage } from './en/dashboardPage';
import { messagesPage } from './en/messagesPage';
import { postProjectPage } from './en/postProjectPage';
import { profilePage } from './en/profilePage';
import { projectBidsSection } from './en/projectBidsSection';
import { projectDetailPage } from './en/projectDetailPage';
import { projectEditForm } from './en/projectEditForm';
import { projectInfoCard } from './en/projectInfoCard';
import { projectReviewForm } from './en/projectReviewForm';
import { projectsPage } from './en/projectsPage'; 
import { registerPage } from './en/registerPage';
import { supplierProfilePage } from './en/supplierProfilePage';
import { suppliersPage } from './en/suppliersPage';
import { supplierWalletPage } from './en/supplierWalletPage';
import { transactionTypes } from './en/transactionTypes';
import { walletPage } from './en/walletPage';


export const en = {
  common,
  header,
  footer,
  auth,
  adminPage,
  dashboardPage,
  messagesPage,
  postProjectPage,
  profilePage,
  projectBidsSection,
  projectDetailPage,
  projectEditForm,
  projectInfoCard,
  projectReviewForm,
  projectsPage,
  registerPage,
  supplierProfilePage,
  suppliersPage,
  supplierWalletPage,
  transactionTypes,
  walletPage,
  
  roles: common.roles, 
  categories: {
    plumbing: "Plumbing",
    painting: "Painting",
    electrical: "Electrical",
    carpentry: "Carpentry",
    cleaning: "Cleaning",
    gardening: "Gardening",
    moving: "Moving",
    repairs: "General Repairs",
    hvac: "HVAC",
    flooring: "Flooring",
    roofing: "Roofing",
    other: "Other"
  }
};