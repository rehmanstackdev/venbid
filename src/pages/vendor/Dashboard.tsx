import { useOutletContext } from "react-router-dom";
import { VendorListingsSection } from "@/components/listings/VendorListingsSection";

export default function VendorDashboard() {
  const { selectedCategory } = useOutletContext<{ selectedCategory: number | null }>();

  return <VendorListingsSection selectedCategory={selectedCategory} />;
}
