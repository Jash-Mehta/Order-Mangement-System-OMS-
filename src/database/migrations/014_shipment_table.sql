CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE IF NOT EXISTS shipments (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id                UUID NOT NULL,
    customer_id             UUID NOT NULL,

    
    courier_name            TEXT,
    tracking_number         TEXT,
    courier_order_id        TEXT,
    awb_number              TEXT,

    status                  TEXT NOT NULL DEFAULT 'PENDING',

    
    dispatched_at           TIMESTAMPTZ,
    in_transit_at           TIMESTAMPTZ,
    out_for_delivery_at     TIMESTAMPTZ,
    delivered_at            TIMESTAMPTZ,
    returned_at             TIMESTAMPTZ,
    failed_at               TIMESTAMPTZ,

    
    pickup_name             TEXT,
    pickup_phone            TEXT,
    pickup_address          TEXT,
    pickup_city             TEXT,
    pickup_state            TEXT,
    pickup_pincode          TEXT,

    
    delivery_name           TEXT,
    delivery_phone          TEXT,
    delivery_address        TEXT,
    delivery_city           TEXT,
    delivery_state          TEXT,
    delivery_pincode        TEXT,
    delivery_country        TEXT,

    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Shipment Items ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shipment_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id     UUID NOT NULL,
    order_item_id   UUID NOT NULL,
    product_id      UUID NOT NULL,
    product_name    TEXT,
    quantity        INT NOT NULL DEFAULT 1,

    
    status          TEXT NOT NULL DEFAULT 'PENDING',

    
    returned_at     TIMESTAMPTZ,
    return_reason   TEXT,

    
    damaged_at      TIMESTAMPTZ,
    damage_notes    TEXT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS shipment_tracking (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id     UUID NOT NULL,
    status          TEXT NOT NULL,
    message         TEXT,
    location        TEXT,
    happened_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);