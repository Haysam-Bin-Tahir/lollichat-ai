'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SubscriptionPlan, UserSubscription } from '@/lib/db/schema';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type CurrentSubscriptionProps = {
  subscription: UserSubscription;
  plan: SubscriptionPlan;
  onCancel?: () => void;
};

export function CurrentSubscription({
  subscription,
  plan,
  onCancel,
}: CurrentSubscriptionProps) {
  const router = useRouter();
  const [isCanceling, setIsCanceling] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleCancelSubscription = async () => {
    setIsCanceling(true);

    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || 'Failed to cancel subscription',
        );
      }

      toast.success('Subscription canceled successfully');

      if (onCancel) {
        onCancel();
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to cancel subscription');
    } finally {
      setIsCanceling(false);
      setIsConfirmOpen(false);
    }
  };

  const startDate = new Date(subscription.startDate);

  return (
    <>
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
            Active Subscription
          </CardTitle>
          <CardDescription>
            You are currently subscribed to the {plan.name} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium">
                ${Number(plan.price).toFixed(2)}/month
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Started</span>
              <span className="font-medium">
                {formatDistanceToNow(startDate, { addSuffix: true })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize">
                {subscription.status}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full text-destructive hover:bg-destructive/10"
            onClick={() => setIsConfirmOpen(true)}
            disabled={isCanceling}
          >
            {isCanceling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Canceling...
              </>
            ) : (
              'Cancel Subscription'
            )}
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your {plan.name} subscription? You
              will lose access to premium features at the end of your current
              billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
