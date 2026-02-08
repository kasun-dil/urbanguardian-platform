import { useState } from "react";
import { Heart, Package, Plus, Building2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDonationCenters, useUserDonationCenters, type DonationCenter } from "@/hooks/useDonationCenters";
import { useAuth } from "@/contexts/AuthContext";
import { CreateDonationCenterDialog } from "@/components/donations/CreateDonationCenterDialog";
import { DonationCenterCard } from "@/components/donations/DonationCenterCard";
import { DonationCenterDetailModal } from "@/components/donations/DonationCenterDetailModal";
import { DonateNowModal } from "@/components/donations/DonateNowModal";
import { ManageDonationCenterModal } from "@/components/donations/ManageDonationCenterModal";

export default function DonationCenters() {
  const { user } = useAuth();
  const { centers, loading } = useDonationCenters();
  const { centers: myCenters, loading: myLoading, refetch: refetchMyCenters } = useUserDonationCenters();
  
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCenter, setSelectedCenter] = useState<DonationCenter | null>(null);
  const [donateCenter, setDonateCenter] = useState<DonationCenter | null>(null);
  const [manageCenter, setManageCenter] = useState<DonationCenter | null>(null);

  return (
    <MainLayout showFooter={false}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold">Donation Centers</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    Find & support local relief centers
                  </p>
                </div>
              </div>
              {user && (
                <div className="w-full sm:w-auto">
                  <CreateDonationCenterDialog onSuccess={refetchMyCenters} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border bg-card/30 sticky top-[70px] sm:top-[86px] z-40">
          <div className="container mx-auto px-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent border-none h-auto p-0 gap-0 w-full overflow-x-auto">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base"
                >
                  <Package className="h-4 w-4 mr-1 sm:mr-2 shrink-0" />
                  <span className="hidden xs:inline">All</span> Centers
                </TabsTrigger>
                {user && (
                  <TabsTrigger
                    value="my-centers"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base"
                  >
                    <Building2 className="h-4 w-4 mr-1 sm:mr-2 shrink-0" />
                    My Centers
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4 sm:py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* All Centers Tab */}
            <TabsContent value="all" className="mt-0 space-y-4 sm:space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : centers.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                    <Package className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-center">No Donation Centers Yet</h3>
                    <p className="text-muted-foreground text-center text-sm mb-4">
                      Be the first to register a donation center in your area.
                    </p>
                    {user && (
                      <CreateDonationCenterDialog
                        onSuccess={refetchMyCenters}
                        trigger={
                          <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Register New Center
                          </Button>
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:gap-6">
                  {centers.map((center, index) => (
                    <DonationCenterCard
                      key={center.id}
                      center={center}
                      index={index}
                      onViewDetails={setSelectedCenter}
                      onDonateNow={setDonateCenter}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* My Centers Tab */}
            {user && (
              <TabsContent value="my-centers" className="mt-0 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold">Your Donation Centers</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Manage and update your centers
                    </p>
                  </div>
                  <div className="w-full sm:w-auto">
                    <CreateDonationCenterDialog onSuccess={refetchMyCenters} />
                  </div>
                </div>

                {myLoading ? (
                  <div className="flex items-center justify-center py-8 sm:py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : myCenters.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                      <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-semibold mb-2 text-center">No Centers Created</h3>
                      <p className="text-muted-foreground text-center text-sm mb-4">
                        You haven't created any donation centers yet.
                      </p>
                        <CreateDonationCenterDialog
                          onSuccess={refetchMyCenters}
                          trigger={
                            <Button className="gap-2">
                              <Plus className="h-4 w-4" />
                              Create Your First Center
                            </Button>
                          }
                        />
                    </CardContent>
                  </Card>
                ) : (
                <div className="grid gap-4 sm:gap-6">
                    {myCenters.map((center, index) => (
                      <DonationCenterCard
                        key={center.id}
                        center={center}
                        index={index}
                        onViewDetails={setManageCenter}
                        onDonateNow={setDonateCenter}
                        isOwner={true}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <DonationCenterDetailModal
        center={selectedCenter}
        isOpen={selectedCenter !== null}
        onClose={() => setSelectedCenter(null)}
      />

      <DonateNowModal
        center={donateCenter}
        isOpen={donateCenter !== null}
        onClose={() => setDonateCenter(null)}
      />

       <ManageDonationCenterModal
         center={manageCenter}
         isOpen={manageCenter !== null}
         onClose={() => setManageCenter(null)}
         onUpdated={refetchMyCenters}
       />
    </MainLayout>
  );
}
