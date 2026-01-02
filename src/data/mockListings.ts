export interface Listing {
  id: string;
  title: string;
  description: string;
  categoryId: number;
  categoryName: string;
  budget: string;
  city: string;
  zip: string;
  lat: number;
  lng: number;
  createdAt: Date;
  images: string[];
  userId: string;
  userName: string;
}

// Illinois coordinates roughly centered on Chicago area
export const mockListings: Listing[] = [
  {
    id: "1",
    title: "Need plumber to fix leaking kitchen sink ASAP",
    description: "Kitchen sink has been leaking for 2 days. Water is pooling under the cabinet. Need someone experienced who can come quickly. Please bring your own tools.",
    categoryId: 1,
    categoryName: "Plumbing Services",
    budget: "100-200",
    city: "Chicago",
    zip: "60601",
    lat: 41.8819,
    lng: -87.6278,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    images: ["https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop"],
    userId: "u1",
    userName: "Michael R."
  },
  {
    id: "2",
    title: "Electrical outlet not working in bedroom",
    description: "Two outlets in the master bedroom stopped working suddenly. No tripped breakers. Need an electrician to diagnose and fix the issue.",
    categoryId: 2,
    categoryName: "Electrical Services",
    budget: "75-150",
    city: "Naperville",
    zip: "60540",
    lat: 41.7508,
    lng: -88.1535,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop"],
    userId: "u2",
    userName: "Sarah K."
  },
  {
    id: "3",
    title: "AC unit making strange noise - needs inspection",
    description: "Central AC unit started making a loud grinding noise. Still cooling but worried it might break. Looking for HVAC tech to inspect and repair if needed.",
    categoryId: 3,
    categoryName: "Heating & Cooling (HVAC)",
    budget: "150-300",
    city: "Evanston",
    zip: "60201",
    lat: 42.0451,
    lng: -87.6877,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop"],
    userId: "u3",
    userName: "David L."
  },
  {
    id: "4",
    title: "Deep cleaning needed for 3-bedroom apartment",
    description: "Moving out of apartment and need deep cleaning done. 3 bedrooms, 2 bathrooms, kitchen and living room. Must be done by end of month.",
    categoryId: 4,
    categoryName: "Home Cleaning",
    budget: "200-350",
    city: "Chicago",
    zip: "60614",
    lat: 41.9214,
    lng: -87.6513,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    images: ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop"],
    userId: "u4",
    userName: "Jennifer M."
  },
  {
    id: "5",
    title: "Fix squeaky door hinges and install new doorknob",
    description: "Have 3 doors with squeaky hinges that need fixing. Also need a new doorknob installed on the front door. Small job, should be quick.",
    categoryId: 5,
    categoryName: "Handyman & Small Repairs",
    budget: "50-100",
    city: "Oak Park",
    zip: "60302",
    lat: 41.8850,
    lng: -87.7845,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"],
    userId: "u5",
    userName: "Robert T."
  },
  {
    id: "6",
    title: "Weekly lawn mowing service needed",
    description: "Looking for someone to mow my lawn weekly through the summer. Approx 1/4 acre lot. Must have own equipment. Can discuss long-term arrangement.",
    categoryId: 6,
    categoryName: "Landscaping & Lawn Care",
    budget: "40-60",
    city: "Schaumburg",
    zip: "60173",
    lat: 42.0334,
    lng: -88.0834,
    createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
    images: ["https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400&h=300&fit=crop"],
    userId: "u6",
    userName: "Patricia H."
  },
  {
    id: "7",
    title: "Roof leak repair - water coming in during rain",
    description: "There's a leak in the roof above the attic. Water comes in during heavy rain. Need someone to find the source and patch it up properly.",
    categoryId: 7,
    categoryName: "Roofing & Gutter Work",
    budget: "300-500",
    city: "Aurora",
    zip: "60502",
    lat: 41.7606,
    lng: -88.3201,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    images: ["https://images.unsplash.com/photo-1632759145354-523e6a006da7?w=400&h=300&fit=crop"],
    userId: "u7",
    userName: "William B."
  },
  {
    id: "8",
    title: "Help needed to move furniture to new apartment",
    description: "Moving from 2nd floor apartment to 3rd floor in same building. Have a couch, bed, dresser, and boxes. Need 2-3 strong people for about 3 hours.",
    categoryId: 8,
    categoryName: "Moving & General Labor",
    budget: "150-250",
    city: "Chicago",
    zip: "60657",
    lat: 41.9400,
    lng: -87.6530,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    images: ["https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400&h=300&fit=crop"],
    userId: "u8",
    userName: "Amanda S."
  },
  {
    id: "9",
    title: "Dishwasher not draining properly",
    description: "Dishwasher leaves standing water at the bottom after each cycle. Tried cleaning the filter but problem persists. Brand is Whirlpool, about 5 years old.",
    categoryId: 9,
    categoryName: "Appliance Repair & Installation",
    budget: "80-150",
    city: "Skokie",
    zip: "60076",
    lat: 42.0324,
    lng: -87.7416,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    images: ["https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=300&fit=crop"],
    userId: "u9",
    userName: "Thomas W."
  },
  {
    id: "10",
    title: "Oil change and tire rotation needed",
    description: "2019 Honda Civic needs oil change and tire rotation. Prefer mobile mechanic who can come to my location. Flexible on timing.",
    categoryId: 10,
    categoryName: "Automotive Services",
    budget: "60-100",
    city: "Joliet",
    zip: "60435",
    lat: 41.5250,
    lng: -88.0817,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    images: ["https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop"],
    userId: "u10",
    userName: "Lisa C."
  },
  {
    id: "11",
    title: "Toilet running constantly - need fix",
    description: "Toilet in guest bathroom runs constantly. Already tried jiggling the handle. Need someone to replace the flapper or whatever is broken.",
    categoryId: 1,
    categoryName: "Plumbing Services",
    budget: "50-100",
    city: "Chicago",
    zip: "60647",
    lat: 41.9209,
    lng: -87.7043,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop"],
    userId: "u11",
    userName: "Chris P."
  },
  {
    id: "12",
    title: "Install ceiling fan in living room",
    description: "Want to replace the existing light fixture with a ceiling fan. Fan already purchased. Need someone to do the installation safely.",
    categoryId: 2,
    categoryName: "Electrical Services",
    budget: "75-125",
    city: "Palatine",
    zip: "60067",
    lat: 42.1103,
    lng: -88.0340,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    images: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=300&fit=crop"],
    userId: "u12",
    userName: "Nancy D."
  },
];

export function getListingsByCategory(categoryId: number | null): Listing[] {
  if (categoryId === null) return mockListings;
  return mockListings.filter(listing => listing.categoryId === categoryId);
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export function getListingsInBounds(
  listings: Listing[],
  bounds: { north: number; south: number; east: number; west: number }
): Listing[] {
  return listings.filter(
    (listing) =>
      listing.lat >= bounds.south &&
      listing.lat <= bounds.north &&
      listing.lng >= bounds.west &&
      listing.lng <= bounds.east
  );
}
