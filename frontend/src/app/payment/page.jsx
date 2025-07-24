"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createPaymentOrder, verifyPayment } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);

  const productId = searchParams.get("productId");
  const amount = searchParams.get("amount");
  const productName = searchParams.get("name");
  const productImage = searchParams.get("image");

  // IMPORTANT: Replace with your Razorpay Key ID
  const RAZORPAY_KEY_ID = "rzp_test_xxxxxxxxxxxxxx"; // Replace with your actual key

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!productId || !amount || !productName) {
      toast({
        title: "Error",
        description: "Missing product information for payment.",
        variant: "destructive",
      });
      router.push("/marketplace");
      return;
    }
    setLoading(false);
  }, [productId, amount, productName, router]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast({
        title: "Error",
        description: "Could not load payment gateway. Please check your connection.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Pass the productId to the createPaymentOrder function
      const orderResponse = await createPaymentOrder(productId, {
        amount: parseFloat(amount) * 100, // Amount in paise
        currency: "INR",
      });

      const { order_id, key } = orderResponse;

      const options = {
        key: key || RAZORPAY_KEY_ID,
        amount: parseFloat(amount) * 100,
        currency: "INR",
        name: "CampusCart",
        description: `Payment for ${productName}`,
        order_id: order_id,
        handler: async function (response) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast({
              title: "Payment Successful!",
              description: "Your order has been placed.",
            });
            router.push(`/product/${productId}`);
          } catch (verifyError) {
            console.error("Payment verification failed:", verifyError);
            toast({
              title: "Payment Verification Failed",
              description: "There was an issue confirming your payment. Please contact support.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: user ? `${user.first_name} ${user.last_name}` : '',
          email: user ? user.email : '',
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
            ondismiss: function() {
                setLoading(false);
            }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error("Failed to create payment order:", error);
      toast({
        title: "Payment Error",
        description: "Could not initiate the payment process. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirm Your Purchase</CardTitle>
          <CardDescription>Review your item and proceed to payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={productImage || 'https://placehold.co/100x100/eee/ccc?text=Item'}
              alt={productName}
              className="w-24 h-24 object-cover rounded-md"
            />
            <div>
              <h3 className="font-semibold text-lg">{productName}</h3>
              <p className="text-2xl font-bold">₹{amount}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handlePayment} disabled={loading}>
            {loading ? 'Processing...' : `Proceed to Pay ₹${amount}`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        }>
            <PaymentPageContent />
        </Suspense>
    )
}
