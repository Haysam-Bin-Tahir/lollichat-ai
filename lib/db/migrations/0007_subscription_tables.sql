-- Create subscription plans table
CREATE TABLE IF NOT EXISTS "SubscriptionPlan" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(64) NOT NULL,
  "description" text NOT NULL,
  "price" decimal(10, 2) NOT NULL,
  "features" json NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  "billingCycle" varchar(10) DEFAULT 'monthly' NOT NULL,
  CONSTRAINT "SubscriptionPlan_id_pk" PRIMARY KEY("id")
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS "UserSubscription" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL,
  "planId" uuid NOT NULL,
  "status" varchar(32) NOT NULL,
  "authorizeNetSubscriptionId" varchar(64),
  "authorizeNetCustomerProfileId" varchar(64),
  "authorizeNetPaymentProfileId" varchar(64),
  "startDate" timestamp NOT NULL,
  "endDate" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "UserSubscription_id_pk" PRIMARY KEY("id")
);

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS "PaymentTransaction" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL,
  "subscriptionId" uuid,
  "amount" decimal(10, 2) NOT NULL,
  "currency" varchar(3) DEFAULT 'USD' NOT NULL,
  "status" varchar(32) NOT NULL,
  "authorizeNetTransactionId" varchar(64),
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "PaymentTransaction_id_pk" PRIMARY KEY("id")
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_planId_SubscriptionPlan_id_fk" FOREIGN KEY ("planId") REFERENCES "public"."SubscriptionPlan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_subscriptionId_UserSubscription_id_fk" FOREIGN KEY ("subscriptionId") REFERENCES "public"."UserSubscription"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Insert default subscription plans
INSERT INTO "SubscriptionPlan" ("name", "description", "price", "features")
VALUES 
  ('Basic', 'Essential features for casual users', 9.99, '["Unlimited chats", "Basic AI models", "Standard response time", "Email support"]'),
  ('Standard', 'Enhanced features for regular users', 29.99, '["Everything in Basic", "Advanced AI models", "Faster response time", "Priority email support", "Document generation"]'),
  ('Priority', 'Premium features for power users', 79.99, '["Everything in Standard", "Premium AI models", "Fastest response time", "24/7 priority support", "Advanced analytics", "Custom AI training"]'); 

-- Add billingCycle column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'SubscriptionPlan' AND column_name = 'billingCycle'
  ) THEN
    ALTER TABLE "SubscriptionPlan" ADD COLUMN "billingCycle" varchar(10) DEFAULT 'monthly' NOT NULL;
  END IF;
END $$;

-- Update existing subscription plans with new pricing
UPDATE "SubscriptionPlan" SET 
  "name" = 'Basic',
  "description" = 'Essential features for casual users', 
  "price" = 0.00,
  "features" = '["Limited chats", "Basic AI models", "Standard response time", "Email support"]',
  "billingCycle" = 'monthly'
WHERE "name" = 'Basic';

UPDATE "SubscriptionPlan" SET 
  "name" = 'Standard',
  "description" = 'Enhanced features for regular users', 
  "price" = 19.99,
  "features" = '["Everything in Basic", "Advanced AI models", "Faster response time", "Priority email support", "Document generation"]',
  "billingCycle" = 'monthly'
WHERE "name" = 'Standard';

UPDATE "SubscriptionPlan" SET 
  "name" = 'Priority',
  "description" = 'Premium features for power users', 
  "price" = 49.99,
  "features" = '["Everything in Standard", "Premium AI models", "Fastest response time", "24/7 priority support", "Advanced analytics", "Custom AI training"]',
  "billingCycle" = 'monthly'
WHERE "name" = 'Priority';

-- Add Enterprise monthly plan
INSERT INTO "SubscriptionPlan" ("name", "description", "price", "features", "billingCycle")
VALUES 
  ('Enterprise', 'Complete solution for businesses', 99.99, '["Everything in Priority", "Enterprise-grade security", "Dedicated account manager", "Custom integrations", "Advanced analytics", "Team collaboration features"]', 'monthly');

-- Add yearly plans
INSERT INTO "SubscriptionPlan" ("name", "description", "price", "features", "billingCycle")
VALUES 
  ('Standard Yearly', 'Enhanced features for regular users with yearly discount', 69.99, '["Everything in Basic", "Advanced AI models", "Faster response time", "Priority email support", "Document generation"]', 'yearly'),
  ('Priority Yearly', 'Premium features for power users with yearly discount', 499.00, '["Everything in Standard", "Premium AI models", "Fastest response time", "24/7 priority support", "Advanced analytics", "Custom AI training"]', 'yearly'),
  ('Enterprise Yearly', 'Complete solution for businesses with yearly discount', 999.00, '["Everything in Priority", "Enterprise-grade security", "Dedicated account manager", "Custom integrations", "Advanced analytics", "Team collaboration features"]', 'yearly'); 