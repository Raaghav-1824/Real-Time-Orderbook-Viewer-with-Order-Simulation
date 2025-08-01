import { VenueClient, VenueConfig } from './base-venue';
import { VENUE_CONFIGS } from './venue-config';
import { OKXVenue } from './oks-venue';
import { BybitVenue } from './byBit-venue';
import { DeribitVenue } from './deribit-venue';

const VENUE_CLASSES: Record<string, new (config: VenueConfig) => VenueClient> = {
  okx: OKXVenue,
  bybit: BybitVenue,
  deribit: DeribitVenue,
};

export function createVenueClient(venueId: string): VenueClient {
  const config = VENUE_CONFIGS[venueId];
  if (!config) {
    throw new Error(`Unknown venue: ${venueId}`);
  }

  const VenueClass = VENUE_CLASSES[venueId];
  if (!VenueClass) {
    throw new Error(`No implementation for venue: ${venueId}`);
  }

  return new VenueClass(config);
}

export function getAllVenues(): string[] {
  return Object.keys(VENUE_CONFIGS);
}

export function getVenueConfig(venueId: string) {
  return VENUE_CONFIGS[venueId];
}