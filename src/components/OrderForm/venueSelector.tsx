"use client";
import { Button } from "@/components/ui/button";
import { useScalableOrderbookStore } from "@/store/orderbookStore";
import { Wifi, WifiOff, AlertCircle, Loader2 } from "lucide-react";

export function VenueSelector() {
  const { 
    selectedVenue, 
    setVenue, 
    loading, 
    errors, 
    wsConnected,
    getAvailableVenues 
  } = useScalableOrderbookStore();

  const venues = getAvailableVenues();

  const getVenueStatus = (venue: string) => {
    if (loading[venue]) return 'loading';
    if (errors[venue]) return 'error';
    if (wsConnected[venue]) return 'connected';
    return 'disconnected';
  };

  const getStatusIcon = (venue: string) => {
    const status = getVenueStatus(venue);
    switch (status) {
      case 'loading': return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'error': return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'connected': return <Wifi className="h-3 w-3 text-emerald-500" />;
      default: return <WifiOff className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {venues.map((venue) => (
        <Button
          key={venue}
          variant={selectedVenue === venue ? "primary" : "secondary"}
          size="sm"
          onClick={() => setVenue(venue)}  
          disabled={loading[venue]}
          className="flex items-center gap-1"
        >
          {venue.toUpperCase()}
          {getStatusIcon(venue)}
        </Button>
      ))}
    </div>
  );
}