"use client";

import { RequestingEntity } from "@/types/pullTransfer.types";

interface Props {
  entity: RequestingEntity;
}

export function EntityHeader({ entity }: Props) {
  return (
    <div className="text-center animate-slide-up">
      {/* Avatar */}
      <div
        className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
        style={{
          background: entity.brandColor
            ? `linear-gradient(135deg, ${entity.brandColor}, ${entity.brandColor}cc)`
            : "linear-gradient(135deg, #333, #555)",
        }}
      >
        {entity.logoUrl ? (
          <img
            src={entity.logoUrl}
            alt={entity.name}
            className="w-8 h-8 object-contain"
          />
        ) : (
          <span className="text-white text-lg font-medium">
            {entity.shortName}
          </span>
        )}
      </div>
      <p className="text-white text-base font-medium">{entity.name}</p>
      <p className="text-txt-tertiary text-sm mt-1">
        Solicita débito desde tu cuenta Lemon
      </p>
    </div>
  );
}
