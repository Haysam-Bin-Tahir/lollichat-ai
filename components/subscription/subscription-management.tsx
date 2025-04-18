import { UserSubscription, SubscriptionPlan } from '@/lib/db/schema';
import { formatCurrency } from '@/lib/utils';
import { CancelSubscriptionButton } from './cancel-subscription-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, CheckCircle, CreditCard, Shield } from 'lucide-react';

interface SubscriptionManagementProps {
  subscription: UserSubscription;
  plan: SubscriptionPlan;
}

export function SubscriptionManagement({
  subscription,
  plan,
}: SubscriptionManagementProps) {
  // Format dates
  const startDate = new Date(subscription.startDate).toLocaleDateString();
  const nextBillingDate = new Date(subscription.startDate);
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  return (
    <Card className="w-full border-primary/20 shadow-md mb-12">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Shield className="h-5 w-5 text-primary mr-2" />
              Current Subscription
            </CardTitle>
            <CardDescription className="mt-1">
              You are currently on the {plan.name} plan
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/30"
          >
            Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-center p-4 bg-muted/50 rounded-lg">
            <CreditCard className="h-10 w-10 text-primary mr-4" />
            <div>
              <h3 className="font-medium">{plan.name} Plan</h3>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(Number(plan.price))}/month
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-2">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">
                <span className="text-muted-foreground mr-2">Start Date:</span>
                {startDate}
              </span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">
                <span className="text-muted-foreground mr-2">
                  Next Billing:
                </span>
                {nextBillingDate.toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <CancelSubscriptionButton subscriptionId={subscription.id} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
