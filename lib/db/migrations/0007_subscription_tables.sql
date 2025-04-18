-- Create subscription plans table
CREATE TABLE IF NOT EXISTS "SubscriptionPlan" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(64) NOT NULL,
  "description" text NOT NULL,
  "price" decimal(10, 2) NOT NULL,
  "features" json NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
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