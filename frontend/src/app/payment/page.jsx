"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createPaymentOrder, verifyPayment } from "@/utils/api";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Zap, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
  const RAZORPAY_KEY_ID = "rzp_test_xxxxxxxxxxxxxx";

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!productId || !amount || !productName) {
      toast({
        title: "SYNTAX ERROR",
        description: "MISSING ASSET INFO FOR PAYMENT.",
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
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast({
        title: "COMM LINK FAILED",
        description: "COULD NOT LOAD PAYMENT GATEWAY.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const orderResponse = await createPaymentOrder(productId, {
        amount: parseFloat(amount) * 100,
        currency: "INR",
      });

      const { order_id, key } = orderResponse;

      const options = {
        key: key || RAZORPAY_KEY_ID,
        amount: parseFloat(amount) * 100,
        currency: "INR",
        name: "JUGAADU",
        description: `SECURE PAYMENT: ${productName}`,
        order_id: order_id,
        handler: async function (response) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast({
              title: "TRANSACTION SECURED",
              description: "FUNDS TRANSFERRED SUCCESSFULLY.",
            });
            router.push(`/product/${productId}`);
          } catch (verifyError) {
            toast({
              title: "VERIFICATION FAILED",
              description: "CONTACT SYSTEM ADMIN.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: user ? `${user.first_name} ${user.last_name}` : '',
          email: user ? user.email : '',
        },
        theme: {
          color: "#CCFF00",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      toast({
        title: "PAYMENT INITIATION FAILED",
        description: "PLEASE RETRY REQUEST.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#121212] font-jakarta selection:bg-[#CCFF00] selection:text-black">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center min-h-[50vh]">
          <div className="bg-[#CCFF00] border-[6px] border-black p-8 neo-shadow-black sticker-rotate-1 inline-flex items-center gap-4">
            <div className="w-6 h-6 border-4 border-black border-t-transparent animate-spin rounded-full"></div>
            <h2 className="font-ranchers text-4xl uppercase text-black">CHECKING CLEARANCE...</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] font-jakarta selection:bg-[#CCFF00] selection:text-black flex flex-col">
      <Header />

      <div className="flex-1 flex justify-center items-center p-4 md:p-8">
        <div className="w-full max-w-lg">
          <div className="mb-4">
            <Link href={`/product/${productId}`} className="inline-block border-[3px] border-black bg-[#CCFF00] px-3 py-1 font-mono font-bold text-xs uppercase hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_#000] transition-all">
              ← BACK TO ASSET
            </Link>
          </div>

          <div className="bg-white border-[6px] border-black neo-shadow-vault p-6 md:p-10">
            {/* Header Area */}
            <div className="border-b-[4px] border-black pb-4 mb-6 flex justify-between items-start">
              <div>
                <h1 className="font-ranchers text-4xl text-black uppercase leading-none mb-1">SECURE TRANSACTION</h1>
                <p className="font-mono text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Shield className="h-3 w-3 shrink-0" /> ENCRYPTED PROTOCOL
                </p>
              </div>
              <div className="bg-[#CCFF00] border-[3px] border-black p-2 sticker-rotate-2 shadow-[3px_3px_0_0_#000]">
                <CreditCard className="h-6 w-6 text-black" />
              </div>
            </div>

            {/* Product Info */}
            <div className="flex gap-4 items-center bg-gray-50 border-[4px] border-black p-4 mb-6 relative">
              <img
                src={productImage || 'https://placehold.co/100x100/121212/CCFF00?text=ASSET'}
                alt={productName}
                className="w-20 h-20 object-cover border-[3px] border-black bg-black shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-mono font-bold text-sm text-black uppercase truncate">{productName}</h3>
                <p className="font-ranchers text-3xl text-black mt-1">₹{amount}</p>
              </div>
              <div className="absolute -top-3 -right-3 bg-black text-[#CCFF00] border-[3px] border-[#CCFF00] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-center w-max shadow-[3px_3px_0_0_#000]">
                READY
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-[#CCFF00] text-black border-[4px] border-black py-4 font-mono font-extrabold uppercase text-lg neo-shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-black hover:text-[#CCFF00] transition-all flex justify-center items-center"
            >
              {loading ? (
                <><Zap className="h-5 w-5 mr-2 animate-pulse" /> PROCESSING...</>
              ) : (
                `TRANSFER ₹${amount}`
              )}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#121212] flex justify-center items-center">
        <div className="w-12 h-12 border-[6px] border-[#CCFF00] border-t-black animate-spin rounded-full"></div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  )
}
