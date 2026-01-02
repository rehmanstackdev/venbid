import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useState } from "react";

const About = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />
      
      <main className="container max-w-4xl py-16 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">About Venbid</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A simple marketplace connecting customers with local service providers.
          </p>
        </div>
        
        {/* Section 1 - What is Venbid */}
        <section className="mb-14 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-bold text-foreground mb-5">What is Venbid?</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
              <span>A simple service marketplace</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
              <span>Customers post service needs</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
              <span>Vendors browse and message directly</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
              <span>Payments happen offline — Venbid does not process payments</span>
            </li>
          </ul>
        </section>

        {/* Two Column Layout for Customer/Vendor */}
        <div className="grid md:grid-cols-2 gap-8 mb-14">
          {/* Section 2 - For Customers */}
          <section className="p-6 border border-border rounded-lg">
            <h2 className="text-xl font-bold text-foreground mb-5">For Customers</h2>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center flex-shrink-0">1</span>
                <span>Post a service request</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center flex-shrink-0">2</span>
                <span>Add details, photos, and location</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center flex-shrink-0">3</span>
                <span>Receive messages from vendors</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center flex-shrink-0">4</span>
                <span>Choose a vendor and complete the job offline</span>
              </li>
            </ol>
          </section>

          {/* Section 3 - For Vendors */}
          <section className="p-6 border border-border rounded-lg">
            <h2 className="text-xl font-bold text-foreground mb-5">For Vendors</h2>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center flex-shrink-0">1</span>
                <span>Browse service requests</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center flex-shrink-0">2</span>
                <span>Message customers directly</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center flex-shrink-0">3</span>
                <span>Discuss details and pricing</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center flex-shrink-0">4</span>
                <span>Complete work offline</span>
              </li>
            </ol>
          </section>
        </div>

        {/* Section 4 - Vendor Verification */}
        <section className="mb-14 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-bold text-foreground mb-5">Vendor Verification</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
              <span>Upload an ID or business document</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
              <span>Reviewed by Venbid admin</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
              <span>Verified vendors show a badge next to their name</span>
            </li>
          </ul>
        </section>

        <div className="pt-6 border-t border-border">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to listings
          </Link>
        </div>
      </main>
    </div>
  );
};

export default About;
