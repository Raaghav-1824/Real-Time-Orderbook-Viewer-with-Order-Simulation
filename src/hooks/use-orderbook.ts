"use client";
import { useScalableOrderbookStore } from "@/store/orderbookStore";
import { useEffect } from "react";

export function useOrderbook() {
  const {
    loading,
    errors,
    wsConnected,
    selectedVenue,
    selectedSymbol,
    venueClients,
    fetchOrderbookForVenue,
    connectVenueWebSocket,
    initializeVenues,
    getCurrentOrderbook,
  } = useScalableOrderbookStore();

  // Initialize venues on mount
  useEffect(() => {
    if (Object.keys(venueClients).length === 0) {
      initializeVenues();
    }
  }, [venueClients, initializeVenues]);

  // Fetch data when venue or symbol changes
  useEffect(() => {
    if (selectedVenue && selectedSymbol && venueClients[selectedVenue]) {
      fetchOrderbookForVenue(selectedVenue, selectedSymbol);
      connectVenueWebSocket(selectedVenue);
    }
  }, [selectedVenue, selectedSymbol, venueClients, fetchOrderbookForVenue, connectVenueWebSocket]);

  const refetch = () => {
    if (selectedVenue && selectedSymbol) {
      fetchOrderbookForVenue(selectedVenue, selectedSymbol);
    }
  };

  return {
    orderbook: getCurrentOrderbook(),
    loading: loading[selectedVenue] || false,
    error: errors[selectedVenue] || null,
    wsConnected: wsConnected[selectedVenue] || false,
    lastUpdate: getCurrentOrderbook()?.lastUpdate,
    refetch,
  };
}
