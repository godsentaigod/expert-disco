import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Download, Zap } from "lucide-react";
import { Link } from "wouter";
import { Streamdown } from "streamdown";

export default function ProductDetail() {
  const { slug } = useParams();
  const { data: product, isLoading } = trpc.products.getBySlug.useQuery({ slug: slug || "" });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <Link href="/products">
            <Button variant="outline">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const features = [
    "Production-ready prompts and templates",
    "Immediate implementation",
    "Expert-level results",
    "Lifetime access",
    "Regular updates",
    "Community support",
  ];

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
        </div>
      </section>

      {/* Product Content */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Hero Image */}
              {product.image && (
                <div className="mb-8 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 h-96">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Product Info */}
              <div className="mb-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-hero text-foreground">{product.name}</h1>
                    <Badge className="mt-4 bg-secondary/20 text-secondary-foreground text-sm">
                      {product.category}
                    </Badge>
                  </div>
                </div>

                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Long Description */}
              {product.longDescription && (
                <div className="mb-12 prose prose-invert max-w-none">
                  <Streamdown>{product.longDescription}</Streamdown>
                </div>
              )}

              {/* Features */}
              <div className="mb-12">
                <h2 className="text-headline text-foreground mb-6">What's Included</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, i) => (
                    <div key={i} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="card-premium sticky top-8">
                <CardHeader>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Investment</p>
                    <p className="text-5xl font-bold text-primary">${product.price}</p>
                    <p className="text-sm text-muted-foreground mt-2">One-time payment</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Link href={`/checkout?product=${product.id}`}>
                    <Button size="lg" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                      <Zap className="w-5 h-5 mr-2" />
                      Get Access Now
                    </Button>
                  </Link>

                  <Button size="lg" variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
                    <Download className="w-5 h-5 mr-2" />
                    View Preview
                  </Button>

                  {/* Trust Badges */}
                  <div className="pt-6 border-t border-border space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Instant access after purchase</span>
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
                </CardContent>
              </Card>

              {/* Related Products */}
              <div className="mt-8">
                <h3 className="font-semibold text-foreground mb-4">Recommended</h3>
                <p className="text-sm text-muted-foreground">
                  Combine this with other products to build a complete AI-powered business system.
                </p>
                <Link href="/products">
                  <Button variant="outline" className="w-full mt-4">
                    View All Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
