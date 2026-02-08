import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, LogOut, User, Package, Calendar } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: purchases, isLoading: purchasesLoading } = trpc.purchases.list.useQuery();
  const { data: orders, isLoading: ordersLoading } = trpc.orders.list.useQuery();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleDownload = async (productId: number, productName: string) => {
    try {
      // In a real app, this would trigger a download
      toast.success(`Download started for ${productName}`);
      // window.open(result.downloadUrl, "_blank");
    } catch (error) {
      toast.error("Failed to download product");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please log in</h1>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/5 to-secondary/5 py-8 border-b border-border">
        <div className="container flex items-center justify-between">
          <div>
            <h1 className="text-headline text-foreground">My Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your purchases and downloads</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container">
          {/* Profile Card */}
          <div className="mb-8">
            <Card className="card-premium">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchases Section */}
          <div className="mb-12">
            <h2 className="text-headline text-foreground mb-6">Your Purchases</h2>

            {purchasesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-card rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : purchases && purchases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchases.map((purchase) => (
                  <Card key={purchase.id} className="card-premium">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg">Product #{purchase.productId}</CardTitle>
                          <Badge className="mt-2 bg-green-100 text-green-800">Purchased</Badge>
                        </div>
                        <Package className="w-6 h-6 text-secondary" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(purchase.purchasedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                        onClick={() => handleDownload(purchase.productId, `Product ${purchase.productId}`)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="card-premium">
                <CardContent className="pt-12 text-center pb-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">No purchases yet</p>
                  <Link href="/products">
                    <Button>Browse Products</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Orders Section */}
          <div>
            <h2 className="text-headline text-foreground mb-6">Order History</h2>

            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-card rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="card-premium">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Order ID</p>
                          <p className="font-semibold text-foreground">#{order.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-semibold text-foreground">${order.amount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge
                            className={`mt-1 ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-semibold text-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="card-premium">
                <CardContent className="pt-12 text-center pb-12">
                  <p className="text-muted-foreground">No orders yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
