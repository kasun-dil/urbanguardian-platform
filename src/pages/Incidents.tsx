import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { MapPin, Activity } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportIncidentDialog } from "@/components/incidents/ReportIncidentDialog";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import { IncidentFilters } from "@/components/incidents/IncidentFilters";
import { IncidentMap } from "@/components/maps/IncidentMap";
import { useIncidents } from "@/hooks/useIncidents";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const INCIDENTS_PER_PAGE = 4;

export default function Incidents() {
  const [view, setView] = useState<"map" | "feed">("feed");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { incidents, loading, createIncident, likeIncident, addComment, fetchComments } =
    useIncidents();

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      if (filter === "all") return true;
      if (filter === "active") return incident.status === "active";
      return incident.type === filter || incident.status === filter;
    });
  }, [incidents, filter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredIncidents.length / INCIDENTS_PER_PAGE);
  const paginatedIncidents = useMemo(() => {
    const startIndex = (currentPage - 1) * INCIDENTS_PER_PAGE;
    return filteredIncidents.slice(startIndex, startIndex + INCIDENTS_PER_PAGE);
  }, [filteredIncidents, currentPage]);

  // Reset to page 1 when filter changes
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  return (
    <MainLayout showFooter={false}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-primary" />
                  Incident Map & Feed
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time incident reports from citizens across the city
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ReportIncidentDialog onSubmit={createIncident} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & View Toggle */}
        <IncidentFilters
          filter={filter}
          view={view}
          onFilterChange={handleFilterChange}
          onViewChange={setView}
        />

        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map View - Show when view is "map" or always on large screens */}
            <div className={`lg:col-span-2 ${view === "feed" ? "hidden lg:block" : ""}`}>
              <Card className="h-[600px] overflow-hidden relative z-0">
                <CardContent className="p-0 h-full">
                  <IncidentMap
                    incidents={filteredIncidents}
                    onIncidentClick={(incident) => console.log("Clicked:", incident)}
                  />
                </CardContent>
              </Card>
              {/* Map Legend */}
              <div className="flex gap-4 justify-center flex-wrap mt-4 p-2 bg-card/50 rounded-lg">
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Flooding</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-3 w-3 rounded-full bg-warning" />
                  <span className="text-muted-foreground">Blocked Road</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-3 w-3 rounded-full bg-safe" />
                  <span className="text-muted-foreground">Fallen Tree</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-3 w-3 rounded-full bg-danger" />
                  <span className="text-muted-foreground">Hazard</span>
                </div>
              </div>
            </div>

            {/* Feed View - Show when view is "feed" or always on large screens */}
            <div className={`space-y-4 ${view === "map" ? "hidden lg:block" : "lg:col-span-1"}`}>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Live Feed
                  <span className="h-2 w-2 bg-safe rounded-full pulse-live" />
                </h2>
                <span className="text-sm text-muted-foreground">
                  {filteredIncidents.length} incidents
                </span>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredIncidents.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No incidents reported yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Be the first to report an incident in your area
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <AnimatePresence mode="wait">
                    {paginatedIncidents.map((incident, index) => (
                      <IncidentCard
                        key={incident.id}
                        incident={incident}
                        index={index}
                        onLike={likeIncident}
                        onComment={addComment}
                        onFetchComments={fetchComments}
                      />
                    ))}
                  </AnimatePresence>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) setCurrentPage(currentPage - 1);
                              }}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                              }}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
