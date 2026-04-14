-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "avatar_url" VARCHAR(500),
    "role" VARCHAR(20) NOT NULL DEFAULT 'renter',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "fcm_token" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" UUID NOT NULL,
    "landlord_id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "property_type" VARCHAR(50) NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100),
    "zip_code" VARCHAR(20),
    "country" VARCHAR(100) NOT NULL DEFAULT 'USA',
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" DECIMAL(3,1),
    "square_footage" INTEGER,
    "monthly_rent" DECIMAL(10,2) NOT NULL,
    "deposit" DECIMAL(10,2),
    "available_from" DATE,
    "amenities" JSONB NOT NULL DEFAULT '[]',
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "virtual_tour_url" VARCHAR(500),
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_images" (
    "id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "thumbnail_url" VARCHAR(500),
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_virtual_tour" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "participant_one_id" UUID NOT NULL,
    "participant_two_id" UUID NOT NULL,
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "message_type" VARCHAR(20) NOT NULL DEFAULT 'text',
    "content" TEXT NOT NULL,
    "media_url" VARCHAR(500),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "renter_id" UUID NOT NULL,
    "landlord_id" UUID NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3),
    "viewing_type" VARCHAR(20) NOT NULL DEFAULT 'in_person',
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "actual_start" TIMESTAMP(3),
    "actual_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "renter_id" UUID NOT NULL,
    "overall_rating" INTEGER NOT NULL,
    "neighborhood_rating" INTEGER,
    "noise_rating" INTEGER,
    "maintenance_rating" INTEGER,
    "amenities_rating" INTEGER,
    "comment" TEXT NOT NULL,
    "pros" JSONB NOT NULL DEFAULT '[]',
    "cons" JSONB NOT NULL DEFAULT '[]',
    "landlord_response" TEXT,
    "response_at" TIMESTAMP(3),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "reporter_id" UUID NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "evidence_urls" JSONB NOT NULL DEFAULT '[]',
    "status" VARCHAR(20) NOT NULL DEFAULT 'new',
    "admin_notes" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "company_name" VARCHAR(200) NOT NULL,
    "logo_url" VARCHAR(500),
    "description" TEXT,
    "service_area" JSONB NOT NULL,
    "fleet_info" JSONB,
    "services" JSONB NOT NULL,
    "hourly_rate" DECIMAL(10,2),
    "fixed_price" DECIMAL(10,2),
    "insurance_coverage" DECIMAL(10,2),
    "availability" JSONB,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mover_bookings" (
    "id" UUID NOT NULL,
    "mover_id" UUID NOT NULL,
    "renter_id" UUID NOT NULL,
    "listing_id" UUID,
    "pickup_address" VARCHAR(500) NOT NULL,
    "dropoff_address" VARCHAR(500) NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "time_window_start" TIME NOT NULL,
    "time_window_end" TIME NOT NULL,
    "services" JSONB NOT NULL,
    "estimated_price" DECIMAL(10,2) NOT NULL,
    "final_price" DECIMAL(10,2),
    "status" VARCHAR(20) NOT NULL DEFAULT 'requested',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mover_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "listings_landlord_id_idx" ON "listings"("landlord_id");

-- CreateIndex
CREATE INDEX "listings_city_idx" ON "listings"("city");

-- CreateIndex
CREATE INDEX "listings_status_idx" ON "listings"("status");

-- CreateIndex
CREATE INDEX "listings_latitude_longitude_idx" ON "listings"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "listings_monthly_rent_idx" ON "listings"("monthly_rent");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_participant_one_id_participant_two_id_listing_key" ON "conversations"("participant_one_id", "participant_two_id", "listing_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- CreateIndex
CREATE INDEX "visits_listing_id_idx" ON "visits"("listing_id");

-- CreateIndex
CREATE INDEX "visits_renter_id_idx" ON "visits"("renter_id");

-- CreateIndex
CREATE INDEX "visits_status_idx" ON "visits"("status");

-- CreateIndex
CREATE INDEX "reviews_listing_id_idx" ON "reviews"("listing_id");

-- CreateIndex
CREATE INDEX "reviews_overall_rating_idx" ON "reviews"("overall_rating");

-- CreateIndex
CREATE INDEX "reports_listing_id_idx" ON "reports"("listing_id");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE UNIQUE INDEX "movers_user_id_key" ON "movers"("user_id");

-- CreateIndex
CREATE INDEX "mover_bookings_mover_id_idx" ON "mover_bookings"("mover_id");

-- CreateIndex
CREATE INDEX "mover_bookings_status_idx" ON "mover_bookings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_listing_id_key" ON "favorites"("user_id", "listing_id");

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participant_one_id_fkey" FOREIGN KEY ("participant_one_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participant_two_id_fkey" FOREIGN KEY ("participant_two_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_renter_id_fkey" FOREIGN KEY ("renter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_renter_id_fkey" FOREIGN KEY ("renter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movers" ADD CONSTRAINT "movers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mover_bookings" ADD CONSTRAINT "mover_bookings_mover_id_fkey" FOREIGN KEY ("mover_id") REFERENCES "movers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mover_bookings" ADD CONSTRAINT "mover_bookings_renter_id_fkey" FOREIGN KEY ("renter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mover_bookings" ADD CONSTRAINT "mover_bookings_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

