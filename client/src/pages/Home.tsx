import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: products, isLoading } = trpc.products.list.useQuery();

  const featuredProducts = products?.slice(0, 3) || [];

  // Covert keyboard shortcut: Ctrl+Shift+A to access command center
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "A") {
        e.preventDefault();
        if (user?.role === "admin") {
          setLocation("/command-center");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [user, setLocation]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-24 sm:py-32 lg:py-40">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -ml-48 -mb-48"></div>

        <div className="container relative z-10">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full border border-primary-foreground/20">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Replace expensive expert roles with AI</span>
            </div>

            <h1 className="text-hero text-primary-foreground mb-6">
              Replace Your Expensive Expert Roles with AI-Driven Systems
            </h1>

            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl leading-relaxed">
              Get production-ready prompt packs, workflow blueprints, and automation templates that replace CTOs, Growth Leads, Product Managers, and more. Start immediately, no training required.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  Explore Products
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section-padding bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-headline text-foreground mb-4">Our Premium Products</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Carefully curated collections of prompts, frameworks, and workflows to transform your business operations
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-card rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <Card className="card-premium cursor-pointer group hover:shadow-2xl transition-all duration-300">
                    {product.image && (
                      <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-2xl text-foreground">{product.name}</CardTitle>
                          <CardDescription className="text-muted-foreground mt-2">{product.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Starting at</p>
                          <p className="text-3xl font-bold text-primary">${product.price}</p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-secondary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                View All Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-card">
        <div className="container">
          <h2 className="text-headline text-foreground text-center mb-16">Why Choose Vibe Coding</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Immediate Implementation", description: "Start using prompts and workflows today, no setup required" },
              { title: "Production-Ready", description: "Tested frameworks and templates used by leading companies" },
              { title: "Expert-Level Results", description: "Get output quality equivalent to hiring senior experts" },
              { title: "Continuous Updates", description: "Receive new prompts and frameworks as AI evolves" },
            ].map((benefit, i) => (
              <div key={i} className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container text-center">
          <h2 className="text-headline text-foreground mb-6">Ready to Transform Your Business?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with our complete bundle and save 45% compared to individual products
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Covert Admin Access - Hidden buttons visible on hover */}
      {user?.role === "admin" && (
        <div className="fixed bottom-4 right-4 flex gap-2 opacity-10 hover:opacity-100 transition-opacity duration-300">
          <Link href="/command-center">
            <Button size="sm" variant="outline" className="text-xs">
              Command Center
            </Button>
          </Link>
          <Link href="/command-center-dashboard">
            <Button size="sm" variant="outline" className="text-xs">
              Dashboard
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
