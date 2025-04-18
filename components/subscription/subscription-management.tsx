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
    <Card className="w-full border-primary/20 shadow-md">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center">
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
        <div className="grid gap-6">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center">
              <CreditCard className="h-10 w-10 text-primary mr-4" />
              <div>
                <h3 className="font-medium">{plan.name} Plan</h3>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {formatCurrency(Number(plan.price))}
              </div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Subscription Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                  {startDate}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Next Billing Date
                </p>
                <p className="font-medium flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                  {nextBillingDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Plan Features</h3>
            <ul className="grid gap-2">
              {[
                'Access to all AI models',
                'Unlimited conversations',
                'Priority support',
                'Advanced features',
              ].map((feature, i) => (
                <li key={i} className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-6">
        <div className="text-sm text-muted-foreground">
          You can cancel your subscription at any time
        </div>
        <CancelSubscriptionButton subscriptionId={subscription.id} />
      </CardFooter>
    </Card>
  );
}
