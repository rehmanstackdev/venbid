import { 
  Wrench, 
  Zap, 
  Thermometer, 
  Sparkles, 
  Hammer, 
  TreePine, 
  Home, 
  Truck, 
  Settings, 
  Car 
} from "lucide-react";

export const categories = [
  { id: 1, name: "Plumbing Services", slug: "plumbing", icon: Wrench },
  { id: 2, name: "Electrical Services", slug: "electrical", icon: Zap },
  { id: 3, name: "Heating & Cooling (HVAC)", slug: "hvac", icon: Thermometer },
  { id: 4, name: "Home Cleaning", slug: "cleaning", icon: Sparkles },
  { id: 5, name: "Handyman & Small Repairs", slug: "handyman", icon: Hammer },
  { id: 6, name: "Landscaping & Lawn Care", slug: "landscaping", icon: TreePine },
  { id: 7, name: "Roofing & Gutter Work", slug: "roofing", icon: Home },
  { id: 8, name: "Moving & General Labor", slug: "moving", icon: Truck },
  { id: 9, name: "Appliance Repair & Installation", slug: "appliance", icon: Settings },
  { id: 10, name: "Automotive Services", slug: "automotive", icon: Car },
] as const;

export type Category = typeof categories[number];
