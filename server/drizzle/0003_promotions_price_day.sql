-- Add price and dayOfWeek to promotions
ALTER TABLE "promotions" ADD COLUMN "price" varchar(20);
ALTER TABLE "promotions" ADD COLUMN "day_of_week" integer;
