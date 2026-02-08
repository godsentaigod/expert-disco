import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  { value: "all", label: "All Products" },
  { value: "cto", label: "CTO Kit" },
  { value: "growth", label: "Growth Lead" },
  { value: "pm", label: "Product Manager" },
  { value: "workflows", label: "Workflows" },
  { value: "prompts", label: "Prompt Library" },
];

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allProducts, isLoading } = trpc.products.list.useQuery();
  const { data: bundleProducts } = trpc.bundles.list.useQuery();

  // Filter products
  const filteredProducts = allProducts?.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/5 to-secondary/5 py-12 sm:py-16">
        <div className="container">
          <h1 className="text-headline text-foreground mb-4">Our Product Collection</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Choose from our carefully curated selection of AI-powered business tools and frameworks
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Search */}
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Categories</h3>
                <div className="space-y-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.value
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "bg-card text-foreground hover:bg-accent/50"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-96 bg-card rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProducts.map((product) => (
                    <Link key={product.id} href={`/products/${product.slug}`}>
                      <Card className="card-premium cursor-pointer group h-full hover:shadow-2xl transition-all duration-300">
                        {product.image && (
                          <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <CardTitle className="text-xl text-foreground">{product.name}</CardTitle>
                              <Badge className="mt-2 bg-secondary/20 text-secondary-foreground">
                                {product.category}
                              </Badge>
                            </div>
                          </div>
                          <CardDescription className="text-muted-foreground mt-3">
                            {product.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-end justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Price</p>
                            <p className="text-2xl font-bold text-primary">${product.price}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-secondary group-hover:translate-x-1 transition-transform" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">No products found matching your search</p>
                </div>
              )}
            </div>
          </div>

          {/* Bundles Section */}
          {bundleProducts && bundleProducts.length > 0 && (
            <div className="mt-20 pt-12 border-t border-border">
              <h2 className="text-headline text-foreground mb-8">Special Bundles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bundleProducts.map((bundle) => (
                  <Card key={bundle.id} className="card-premium bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/20">
                    <CardHeader>
                      <CardTitle className="text-2xl text-foreground">{bundle.name}</CardTitle>
                      <CardDescription>{bundle.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Bundle Price</p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-primary">${bundle.price}</p>
                            {bundle.discount && (
                              <p className="text-sm text-green-600 font-semibold">Save {bundle.discount}%</p>
                            )}
                          </div>
                        </div>
                        <Link href={`/checkout?bundle=${bundle.id}`}>
                          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                            Get Bundle
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
