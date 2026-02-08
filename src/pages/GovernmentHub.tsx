import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  FileText,
  Building2,
  BookOpen,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePublications } from "@/hooks/usePublications";
import { usePreparednessGuides, type PreparednessGuide } from "@/hooks/usePreparednessGuides";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { GuideCard } from "@/components/guides/GuideCard";
import { GuideDetailModal } from "@/components/guides/GuideDetailModal";

export default function GovernmentHub() {
  const [activeTab, setActiveTab] = useState("publications");
  const [selectedGuide, setSelectedGuide] = useState<PreparednessGuide | null>(null);
  const {
    publications,
    loading: pubLoading,
    userReactions,
    toggleReaction,
    addComment,
    fetchComments,
  } = usePublications();
  const { guides, loading: guidesLoading } = usePreparednessGuides();

  return (
    <MainLayout showFooter={false}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 sm:py-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold">Government Hub</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Official alerts, guides & resources
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-border bg-card/30 sticky top-[70px] sm:top-[86px] z-40">
          <div className="container mx-auto px-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent border-none h-auto p-0 gap-0 w-full overflow-x-auto">
                <TabsTrigger
                  value="publications"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base"
                >
                  <FileText className="h-4 w-4 mr-1 sm:mr-2 shrink-0" />
                  <span className="hidden sm:inline">Official</span> Publications
                </TabsTrigger>
                <TabsTrigger
                  value="preparedness"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base"
                >
                  <BookOpen className="h-4 w-4 mr-1 sm:mr-2 shrink-0" />
                  <span className="hidden sm:inline">Preparedness</span> Guides
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4 sm:py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Publications Tab */}
            <TabsContent value="publications" className="mt-0 space-y-4 sm:space-y-6">
              {pubLoading ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : publications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                    <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-center">No Publications Yet</h3>
                    <p className="text-muted-foreground text-center text-sm">
                      Official government publications will appear here once they are published.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:gap-6">
                  {publications.map((pub, index) => (
                    <PublicationCard
                      key={pub.id}
                      publication={pub}
                      index={index}
                      userReaction={userReactions[pub.id]}
                      onToggleReaction={toggleReaction}
                      onAddComment={addComment}
                      onFetchComments={fetchComments}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Preparedness Guides Tab */}
            <TabsContent value="preparedness" className="mt-0">
              {guidesLoading ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : guides.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                    <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-center">No Guides Yet</h3>
                    <p className="text-muted-foreground text-center text-sm">
                      Preparedness guides will appear here once they are published by government agents.
                    </p>
                  </CardContent>
                </Card>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {guides.map((guide, index) => (
                    <GuideCard key={guide.id} guide={guide} index={index} onReadGuide={setSelectedGuide} />
                  ))}
                </div>
              )}
            </TabsContent>

          </Tabs>
        </div>
      </div>

      <GuideDetailModal 
        guide={selectedGuide} 
        isOpen={selectedGuide !== null} 
        onClose={() => setSelectedGuide(null)} 
      />
    </MainLayout>
  );
}
