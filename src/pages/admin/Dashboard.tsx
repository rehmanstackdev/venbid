import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Mock verification data
const mockVerifications = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'John Smith',
    email: 'john@example.com',
    documentType: 'business_license',
    documentUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    status: 'pending',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    companyName: "John's Plumbing Services",
    serviceCategory: 'Plumbing Services',
  },
  {
    id: '2',
    userId: 'user-2',
    userName: 'Sarah Johnson',
    email: 'sarah@example.com',
    documentType: 'government_id',
    documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
    status: 'pending',
    submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    companyName: 'Clean & Shine Co.',
    serviceCategory: 'Home Cleaning',
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verifications, setVerifications] = useState(mockVerifications);
  const [selectedDoc, setSelectedDoc] = useState<typeof mockVerifications[0] | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');

  const pendingCount = verifications.filter(v => v.status === 'pending').length;
  const approvedCount = verifications.filter(v => v.status === 'approved').length;
  const rejectedCount = verifications.filter(v => v.status === 'rejected').length;

  const handleReview = (doc: typeof mockVerifications[0], action: 'approve' | 'reject') => {
    setSelectedDoc(doc);
    setReviewAction(action);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedDoc) return;

    setVerifications(prev =>
      prev.map(v =>
        v.id === selectedDoc.id
          ? { ...v, status: reviewAction === 'approve' ? 'approved' : 'rejected' }
          : v
      )
    );

    toast({
      title: reviewAction === 'approve' ? 'Vendor Approved' : 'Verification Rejected',
      description: `${selectedDoc.userName} has been ${reviewAction === 'approve' ? 'approved' : 'rejected'}.`,
    });

    setReviewDialogOpen(false);
    setAdminNotes('');
    setSelectedDoc(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const VerificationCard = ({ verification }: { verification: typeof mockVerifications[0] }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{verification.userName}</CardTitle>
              <CardDescription>{verification.email}</CardDescription>
            </div>
          </div>
          <Badge
            variant={
              verification.status === 'approved'
                ? 'default'
                : verification.status === 'rejected'
                ? 'destructive'
                : 'secondary'
            }
          >
            {verification.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
            {verification.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
            {verification.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
            {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Company</p>
            <p className="font-medium">{verification.companyName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Service</p>
            <p className="font-medium">{verification.serviceCategory}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Document Type</p>
            <p className="font-medium">
              {verification.documentType === 'business_license' ? 'Business License' : 'Government ID'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Submitted</p>
            <p className="font-medium">{formatDate(verification.submittedAt)}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Verification Document</p>
          <img
            src={verification.documentUrl}
            alt="Verification document"
            className="w-full h-48 object-cover rounded-lg border"
          />
        </div>

        {verification.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              className="flex-1 gap-2"
              onClick={() => handleReview(verification, 'approve')}
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="destructive"
              className="flex-1 gap-2"
              onClick={() => handleReview(verification, 'reject')}
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-nav">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">Vendor Verification Management</p>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Reviews</CardDescription>
              <CardTitle className="text-3xl">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-3xl text-green-600">{approvedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Rejected</CardDescription>
              <CardTitle className="text-3xl text-red-600">{rejectedCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {verifications.filter(v => v.status === 'pending').length === 0 ? (
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
                {verifications.filter(v => v.status === 'pending').map(v => (
                  <VerificationCard key={v.id} verification={v} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {verifications.filter(v => v.status === 'approved').map(v => (
                <VerificationCard key={v.id} verification={v} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {verifications.filter(v => v.status === 'rejected').map(v => (
                <VerificationCard key={v.id} verification={v} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Vendor' : 'Reject Verification'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve'
                ? `Approve ${selectedDoc?.userName} as a verified vendor?`
                : `Reject ${selectedDoc?.userName}'s verification request?`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this decision..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleSubmitReview}
            >
              {reviewAction === 'approve' ? 'Approve Vendor' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
