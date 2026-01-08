import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, FileText, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getVendors, AdminVendor, adminApi } from "@/api/admin";

export default function AdminVendors() {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<AdminVendor | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const data = await getVendors();
      setVendors(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = vendors.filter((v) => !v.documentVerified).length;
  const approvedCount = vendors.filter((v) => v.documentVerified).length;

  const handleApprove = async (vendor: AdminVendor) => {
    setApprovingId(vendor.id);
    try {
      await adminApi.updateVendorDocumentVerification(vendor.id, true);
      toast({
        title: "Vendor Approved",
        description: `${vendor.user.name} has been approved.`,
      });
      fetchVendors();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vendor verification",
        variant: "destructive",
      });
    } finally {
      setApprovingId(null);
    }
  };

  const handleView = (vendor: AdminVendor) => {
    setSelectedDoc(vendor);
    setViewDialogOpen(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const VerificationCard = ({ vendor }: { vendor: AdminVendor }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{vendor.user.name}</CardTitle>
              <CardDescription>{vendor.user.email}</CardDescription>
            </div>
          </div>
          <Badge variant={vendor.documentVerified ? "default" : "secondary"}>
            {vendor.documentVerified ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
            {vendor.documentVerified ? "Verified" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Company</p>
            <p className="font-medium">{vendor.companyName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Service</p>
            <p className="font-medium">{vendor.serviceCategory}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Documents</p>
            <p className="font-medium">{vendor.verificationDocuments?.length || 0} file(s)</p>
          </div>
          <div>
            <p className="text-muted-foreground">Submitted</p>
            <p className="font-medium">{formatDate(vendor.createdAt)}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Verification Documents</p>
          {vendor.verificationDocuments && vendor.verificationDocuments.length > 0 ? (
            <div className="relative group">
              <img
                src={vendor.verificationDocuments[0]}
                alt="Verification document"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleView(vendor)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Full
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No documents uploaded</p>
          )}
        </div>

        {!vendor.documentVerified && (
          <Button 
            className="w-full gap-2" 
            onClick={() => handleApprove(vendor)}
            disabled={approvingId === vendor.id}
          >
            <CheckCircle className="h-4 w-4" />
            {approvingId === vendor.id ? "Approving..." : "Approve"}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Vendor Verification</h1>
        <p className="text-muted-foreground">Review and approve vendor documents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {vendors.filter((v) => !v.documentVerified).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending verifications</h3>
                <p className="text-muted-foreground text-center">
                  All verification requests have been reviewed
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {vendors
                .filter((v) => !v.documentVerified)
                .map((v) => (
                  <VerificationCard key={v.id} vendor={v} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {vendors
              .filter((v) => v.documentVerified)
              .map((v) => (
                <VerificationCard key={v.id} vendor={v} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
            <DialogDescription>{selectedDoc?.user.name} - {selectedDoc?.companyName}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedDoc?.verificationDocuments[0] && (
              <img
                src={selectedDoc.verificationDocuments[0]}
                alt="Document"
                className="w-full rounded-lg border"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
