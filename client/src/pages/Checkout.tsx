import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Loader2, Lock } from "lucide-react";
import { Link } from "wouter";

declare global {
  interface Window {
    Stripe: any;
  }
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<{ type: "product" | "bundle"; id: number }[]>([]);

  // Get query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("product");
    const bundleId = params.get("bundle");

    if (productId) {
      setSelectedItems([{ type: "product", id: parseInt(productId) }]);
    } else if (bundleId) {
      setSelectedItems([{ type: "bundle", id: parseInt(bundleId) }]);
    }
  }, []);

  // Fetch selected items
  const { data: products } = trpc.products.list.useQuery();
  const { data: bundles } = trpc.bundles.list.useQuery();

  const createCheckoutSession = trpc.checkout.createSession.useMutation();

  const getSelectedItemsData = () => {
    const items = selectedItems.map((item) => {
      if (item.type === "product") {
        return products?.find((p) => p.id === item.id);
      } else {
        return bundles?.find((b) => b.id === item.id);
      }
    });
    return items.filter(Boolean);
  };

  const calculateTotal = () => {
    return getSelectedItemsData().reduce((sum, item) => {
      return sum + parseFloat(item?.price?.toString() || "0");
    }, 0);
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      const productIds = selectedItems
        .filter((item) => item.type === "product")
        .map((item) => item.id);

      const bundleId = selectedItems.find((item) => item.type === "bundle")?.id;

      const result = await createCheckoutSession.mutateAsync({
        productIds: productIds.length > 0 ? productIds : undefined,
        bundleId,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/checkout`,
      });

      if (result.url) {
        window.location.href = result.url;
      } else {
        setError("Failed to create checkout session");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const itemsData = getSelectedItemsData();
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/5 to-secondary/5 py-8">
        <div className="container">
          <Link href="/products">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <h1 className="text-headline text-foreground">Checkout</h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>Review your selected items</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {itemsData.length > 0 ? (
                    <>
                      {itemsData.map((item, index) => (
                        <div key={index} className="flex items-start justify-between pb-4 border-b border-border last:border-b-0 last:pb-0">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{item?.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{item?.description}</p>
                            {'discount' in (item || {}) && (item as any)?.discount && (
                              <Badge className="mt-2 bg-green-100 text-green-800">Save {(item as any).discount}%</Badge>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-foreground">${item?.price}</p>
                          </div>
                        </div>
                      ))}

                      {/* Totals */}
                      <div className="pt-6 space-y-3">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Tax</span>
                          <span>$0.00</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-foreground pt-3 border-t border-border">
                          <span>Total</span>
                          <span className="text-primary">${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No items selected</p>
                      <Link href="/products">
                        <Button>Browse Products</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Checkout Card */}
            <div className="lg:col-span-1">
              <Card className="card-premium sticky top-8">
                <CardHeader>
                  <CardTitle className="text-center">Complete Your Purchase</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Instant access after payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Lifetime updates included</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>30-day money-back guarantee</span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    onClick={handleCheckout}
                    disabled={loading || itemsData.length === 0}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Pay ${total.toFixed(2)}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Powered by Stripe. Your payment information is secure.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
