import { useOutletContext } from "react-router-dom";
import { ListingsSection } from "@/components/listings/ListingsSection";

export default function VendorDashboard() {
  const { selectedCategory } = useOutletContext<{ selectedCategory: number | null }>();

  return <ListingsSection selectedCategory={selectedCategory} />;
}
