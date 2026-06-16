import React from "react";
import { OfferEventsPanel } from "./OfferEventsPanel";

interface Props {
  offerId: number;
  offerName: string;
}

export function OfferEventsTab({ offerId, offerName }: Props) {
  return (
    <OfferEventsPanel
      offerId={offerId}
      offerName={offerName}
      onBack={() => {}}
      embedded={true}
    />
  );
}
