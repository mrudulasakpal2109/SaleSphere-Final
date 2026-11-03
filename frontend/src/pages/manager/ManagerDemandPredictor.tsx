import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  Database,
  ExternalLink,
  FileText,
  GitFork,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Layers,
  Loader2,
  Palette,
  Play,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  TrendingDown,
  TrendingUp,
  Upload,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle, Kpi } from "@/pages/manager/ManagerOverview";
import {
  useDemandModelInfo,
  useDemandHistory,
  usePredictDemand,
  useApproveLaunch,
  useRetrainDemandModel,
} from "@/hooks/useManager";
import { formatINR, formatDateTime, apiErrorMessage } from "@/lib/format";
import { DecisionTreeExplainer } from "@/components/manager/DecisionTreeExplainer";
import type {
  DemandModelInfo,
  DemandPredictionResult,
  DemandPredictionHistoryItem,
  TreeNode,
} from "@/managerTypes";

// Curated sample presets covering Western, Traditional & Home Essentials
const SAMPLE_PRESETS = [
  {
    name: "Banarasi Zari Bridal Silk Saree",
    collection: "Traditional",
    category: "Women",
    subcategory: "Ethnic Wear",
    brand: "Salesphere Luxe",
    price: 3499,
    discount_percentage: 15,
    fabric: "Pure Banarasi Silk",
    sleeve_type: "Unstitched Blouse Piece",
    pattern: "Zari Woven Floral",
    occasion: "Festive / Wedding",
    material: "",
    room: "",
    dimensions: "5.5m Saree + 0.8m Blouse",
    color: "Ruby Red",
    sizes: ["Free Size"],
    launch_month: 10,
    target_customer: "Festive, Wedding & Cultural Celebrants",
    proposed_stock: 120,
    image_url:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
    description:
      "Handcrafted Banarasi bridal silk saree woven with intricate golden zari floral motifs, perfect for Diwali and wedding receptions.",
  },
  {
    name: "Oversized Drop-Shoulder Heavyweight Tee",
    collection: "Western",
    category: "Men",
    subcategory: "T-shirts",
    brand: "UrbanThread",
    price: 799,
    discount_percentage: 20,
    fabric: "240 GSM Cotton Terry",
    sleeve_type: "Half Sleeves",
    pattern: "Solid Drop-Shoulder",
    occasion: "Streetwear / Casual",
    material: "",
    room: "",
    dimensions: "Regular Streetwear Fit",
    color: "Sage Green",
    sizes: ["S", "M", "L", "XL"],
    launch_month: 4,
    target_customer: "Young Trendsetters & Streetwear Enthusiasts",
    proposed_stock: 150,
    image_url:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
    description:
      "Heavyweight streetwear silhouette crafted from 240 GSM cotton terry with drop shoulders and a boxy contemporary drape.",
  },
  {
    name: "Handcrafted Hammered Brass Urli Decorative Bowl",
    collection: "Home Essentials",
    category: "Home Essentials",
    subcategory: "Living & Decor",
    brand: "Salesphere Home",
    price: 1499,
    discount_percentage: 10,
    fabric: "",
    sleeve_type: "",
    pattern: "Hand-Hammered Traditional",
    occasion: "",
    material: "Pure Handcrafted Brass",
    room: "Living Room & Foyer",
    dimensions: "10-inch Diameter, 3.5-inch Height",
    color: "Gold / Brass",
    sizes: ["Standard"],
    launch_month: 10,
    target_customer: "Modern Home Decorators & Lifestyle Enthusiasts",
    proposed_stock: 100,
    image_url:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
    description:
      "Traditional solid brass urli bowl for floating flowers and scented tealights, elevating festive home decor during Diwali and Navratri.",
  },
  {
    name: "Boys' Embroidered Chanderi Kurta-Pajama Set",
    collection: "Traditional",
    category: "Kids",
    subcategory: "Ethnic Wear",
    brand: "Aura Kids",
    price: 1199,
    discount_percentage: 15,
    fabric: "Chanderi Silk Blend",
    sleeve_type: "Full Sleeves",
    pattern: "Foil Printed & Embroidered",
    occasion: "Festive Celebrations",
    material: "",
    room: "",
    dimensions: "Tailored Kidswear Set",
    color: "Mustard Gold",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    launch_month: 11,
    target_customer: "Festive, Wedding & Cultural Celebrants",
    proposed_stock: 80,
    image_url:
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80",
    description:
      "Festive chanderi kurta set with mandarin collar, metallic foil embroidery and matching soft churidar pajama for Diwali festivities.",
  },
  {
    name: "Pure Egyptian Cotton 400TC King Bedsheet Set",
    collection: "Home Essentials",
    category: "Home Essentials",
    subcategory: "Bed & Bath",
    brand: "Salesphere Home",
    price: 2199,
    discount_percentage: 15,
    fabric: "",
    sleeve_type: "",
    pattern: "Sateen Stripe Weave",
    occasion: "",
    material: "100% Egyptian Cotton (400 TC)",
    room: "Master Bedroom",
    dimensions: "King Size (108 x 108 in) + 2 Pillow Covers",
    color: "Ivory White",
    sizes: ["King (108x108 in)"],
    launch_month: 10,
    target_customer: "Premium & Luxury Connoisseurs",
    proposed_stock: 90,
    image_url:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
    description:
      "Ultra-luxurious 400 thread-count sateen weave sheet set with silk-like drape and breathability for premium master bedrooms.",
  },
  {
    name: "Tailored Linen-Blend Double-Breasted Blazer",
    collection: "Western",
    category: "Men",
    subcategory: "Jackets",
    brand: "UrbanThread",
    price: 2999,
    discount_percentage: 20,
    fabric: "Linen-Cotton Blend",
    sleeve_type: "Full Sleeves",
    pattern: "Subtle Herringbone",
    occasion: "Formal / Smart Casual",
    material: "",
    room: "",
    dimensions: "Structured Tailored Fit",
    color: "Classic Navy",
    sizes: ["38", "40", "42", "44"],
    launch_month: 2,
    target_customer: "Young Trendsetters & Urban Professionals",
    proposed_stock: 60,
    image_url:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    description:
      "Unstructured summer blazer tailored in premium breathable linen-cotton blend with notch lapels and natural horn buttons.",
  },
];

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const KIDS_SIZES = ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y", "12-13Y"];
const HOME_SIZES = ["Standard", "Single", "Double", "Queen", "King", "Set of 2", "Set of 4"];

const MONTH_DATA = [
  { val: 1, name: "January", label: "Jan (Makar Sankranti / Pongal)", festivals: ["Pongal", "Makar Sankranti", "Republic Day"], surge: "Moderate (1.1x)" },
  { val: 2, name: "February", label: "Feb (Spring / Wedding Season)", festivals: ["Vasant Panchami", "Pre-Summer Weddings"], surge: "Elevated (1.4x)" },
  { val: 3, name: "March", label: "Mar (Holi / Summer Transition)", festivals: ["Holi", "Mahashivratri"], surge: "High (1.3x)" },
  { val: 4, name: "April", label: "Apr (Baisakhi / Regional New Year)", festivals: ["Baisakhi", "Ugadi", "Eid al-Fitr"], surge: "Surge (1.6x)" },
  { val: 5, name: "May", label: "May (Summer Holiday / Travel)", festivals: ["Mother's Day", "Summer Vacations"], surge: "Baseline (1.0x)" },
  { val: 6, name: "June", label: "Jun (Monsoon Arrival)", festivals: ["Monsoon Arrival", "College Reopen"], surge: "Baseline (0.9x)" },
  { val: 7, name: "July", label: "Jul (Mid-Year Clearance)", festivals: ["End of Season Sale"], surge: "Clearance (0.8x)" },
  { val: 8, name: "August", label: "Aug (Raksha Bandhan / Independence)", festivals: ["Raksha Bandhan", "Independence Day", "Janmashtami"], surge: "High Festive (2.1x)" },
  { val: 9, name: "September", label: "Sep (Ganesh Chaturthi / Onam)", festivals: ["Ganesh Chaturthi", "Onam"], surge: "Surge Festive (2.6x)" },
  { val: 10, name: "October", label: "Oct (Navratri / Durga Puja / Dussehra)", festivals: ["Navratri", "Durga Puja", "Dussehra", "Karwa Chauth"], surge: "Peak Festive (3.4x)" },
  { val: 11, name: "November", label: "Nov (Diwali / Dhanteras / Weddings)", festivals: ["Diwali", "Dhanteras", "Bhai Dooj", "Winter Weddings"], surge: "Maximum Peak (3.5x)" },
  { val: 12, name: "December", label: "Dec (Winter Parties / New Year)", festivals: ["Christmas", "New Year's Eve", "Winter Weddings"], surge: "High Winter (2.2x)" },
];

const CUSTOMER_SEGMENTS = [
  "Festive, Wedding & Cultural Celebrants",
  "Young Trendsetters & Streetwear Enthusiasts",
  "Budget-Conscious Everyday Shoppers",
  "Premium & Luxury Connoisseurs",
  "Modern Home Decorators & Lifestyle Enthusiasts",
];

const FABRICS = [
  "Pure Banarasi Silk",
  "Chanderi Silk Blend",
  "100% Combed Cotton",
  "240 GSM Cotton Terry",
  "Organic Linen",
  "Georgette / Chiffon",
  "Stretch Denim",
  "Rayon Slub",
  "Wool Blend",
];

const MATERIALS_HOME = [
  "100% Egyptian Cotton (400 TC)",
  "Pure Handcrafted Brass",
  "Glazed Ceramic & Stoneware",
  "Luxury Quilted Velvet",
  "Solid Teakwood & Mango Wood",
  "Hand-Poured Soy Wax",
  "Turkish Ring-Spun Terry Towel",
  "Handwoven Jute & Cotton",
];

const ROOMS_HOME = [
  "Living Room & Foyer",
  "Master Bedroom",
  "Dining Room & Table",
  "Kitchen & Pantry",
  "Bathroom & Spa",
  "Balcony & Sanctuary",
];

const SLEEVE_TYPES = [
  "Full Sleeves",
  "Half Sleeves",
  "Sleeveless",
  "3/4th Sleeves",
  "Roll-up Sleeves",
  "Unstitched Blouse Piece",
];

const PATTERNS = [
  "Solid / Plain",
  "Zari Woven Floral",
  "Embroidered Chikankari",
  "Block Printed",
  "Striped",
  "Floral Motif",
  "Geometric Jacquard",
  "Hand-Hammered Traditional",
];

const OCCASIONS = [
  "Festive / Wedding",
  "Casual / Dailywear",
  "Formal / Workwear",
  "Partywear & Evening",
  "Streetwear & Weekend",
];

// Benchmark price references for Indian market
function getCategoryBenchmark(category: string, collection: string) {
  const cat = category.toLowerCase();
  const isTrad = collection.toLowerCase() === "traditional";
  if (cat.includes("home")) {
    return { avg: 1380, band: "₹699 – ₹2,999", label: "Home Essentials Benchmark" };
  }
  if (cat.includes("women")) {
    return isTrad
      ? { avg: 2450, band: "₹1,299 – ₹5,999", label: "Women Traditional Benchmark" }
      : { avg: 1450, band: "₹699 – ₹2,499", label: "Women Western Benchmark" };
  }
  if (cat.includes("men")) {
    return isTrad
      ? { avg: 2100, band: "₹999 – ₹4,499", label: "Men Traditional Benchmark" }
      : { avg: 1150, band: "₹499 – ₹1,999", label: "Men Western Benchmark" };
  }
  return isTrad
    ? { avg: 1250, band: "₹799 – ₹2,199", label: "Kids Traditional Benchmark" }
    : { avg: 850, band: "₹399 – ₹1,499", label: "Kids Casual Benchmark" };
}

export default function ManagerDemandPredictor() {
  const [activeTab, setActiveTab] = useState<
    "simulator" | "how-it-decides" | "tree" | "metrics" | "history" | "viva"
  >("simulator");

  // Step 1: Collection & Audience
  const [collection, setCollection] = useState<"Western" | "Traditional" | "Home Essentials">(
    "Traditional"
  );
  const [category, setCategory] = useState<"Women" | "Men" | "Kids" | "Home Essentials">("Women");

  // Step 2: Product Name & Photograph
  const [name, setName] = useState(SAMPLE_PRESETS[0].name);
  const [imageUrl, setImageUrl] = useState(SAMPLE_PRESETS[0].image_url);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Product Description Attributes
  const [brand, setBrand] = useState(SAMPLE_PRESETS[0].brand);
  const [subcategory, setSubcategory] = useState(SAMPLE_PRESETS[0].subcategory);
  const [fabric, setFabric] = useState(SAMPLE_PRESETS[0].fabric);
  const [sleeveType, setSleeveType] = useState(SAMPLE_PRESETS[0].sleeve_type);
  const [pattern, setPattern] = useState(SAMPLE_PRESETS[0].pattern);
  const [occasion, setOccasion] = useState(SAMPLE_PRESETS[0].occasion);
  const [material, setMaterial] = useState(SAMPLE_PRESETS[0].material);
  const [room, setRoom] = useState(SAMPLE_PRESETS[0].room);
  const [dimensions, setDimensions] = useState(SAMPLE_PRESETS[0].dimensions);
  const [color, setColor] = useState(SAMPLE_PRESETS[0].color);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(SAMPLE_PRESETS[0].sizes);
  const [description, setDescription] = useState(SAMPLE_PRESETS[0].description);

  // Step 4: Proposed Selling Price
  const [price, setPrice] = useState<number>(SAMPLE_PRESETS[0].price);
  const [discount, setDiscount] = useState<number>(SAMPLE_PRESETS[0].discount_percentage);

  // Step 5: Launch Calendar Month
  const [launchMonth, setLaunchMonth] = useState<number>(SAMPLE_PRESETS[0].launch_month);

  // Step 6: Target Customer
  const [targetCustomer, setTargetCustomer] = useState(SAMPLE_PRESETS[0].target_customer);

  // Step 7: Initial Stock Quantity
  const [proposedStock, setProposedStock] = useState<number>(SAMPLE_PRESETS[0].proposed_stock);

  // Prediction and launch state
  const [predictionResult, setPredictionResult] = useState<DemandPredictionResult | null>(null);
  const [approvedStockInput, setApprovedStockInput] = useState<number>(100);
  const [lastLaunchedProduct, setLastLaunchedProduct] = useState<{
    productId: string;
    sku: string;
    name: string;
    category: string;
    approvedStock: number;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [isTreeExpanded, setIsTreeExpanded] = useState(true);

  const ANALYSIS_STEPS = [
    "Analysing historical sales transactions...",
    "Evaluating product attributes...",
    "Comparing historical demand...",
    "Evaluating seasonal trends...",
    "Calculating inventory risk...",
    "Generating launch recommendations...",
  ];

  // Tree interactive filter state
  const [treeSearch, setTreeSearch] = useState<string>("");

  // Data queries & mutations
  const { data: modelInfo, isLoading: modelLoading, refetch: refetchModel } = useDemandModelInfo();
  const { data: history, isLoading: historyLoading, refetch: refetchHistory } = useDemandHistory();
  const predictMutation = usePredictDemand();
  const approveMutation = useApproveLaunch();
  const retrainMutation = useRetrainDemandModel();

  const isHome = category === "Home Essentials" || collection === "Home Essentials";

  // Handle Preset selection
  const handleApplyPreset = (preset: (typeof SAMPLE_PRESETS)[0]) => {
    setName(preset.name);
    setCollection(preset.collection as any);
    setCategory(preset.category as any);
    setSubcategory(preset.subcategory);
    setBrand(preset.brand);
    setPrice(preset.price);
    setDiscount(preset.discount_percentage);
    setFabric(preset.fabric);
    setSleeveType(preset.sleeve_type);
    setPattern(preset.pattern);
    setOccasion(preset.occasion);
    setMaterial(preset.material);
    setRoom(preset.room);
    setDimensions(preset.dimensions);
    setColor(preset.color);
    setSelectedSizes(preset.sizes);
    setLaunchMonth(preset.launch_month);
    setTargetCustomer(preset.target_customer);
    setProposedStock(preset.proposed_stock);
    setImageUrl(preset.image_url);
    setDescription(preset.description);
    setPredictionResult(null);
    setLastLaunchedProduct(null);
    toast.info(`Loaded preset: ${preset.name}`);
  };

  // Image Upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local instant preview
    const localUrl = URL.createObjectURL(file);
    setImageUrl(localUrl);

    // Upload to backend media endpoint
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setImageUrl(data.url);
          toast.success("Product image uploaded successfully!");
        }
      } else {
        toast.info("Using local preview for analysis.");
      }
    } catch {
      toast.info("Using local preview for analysis.");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleSize = (sz: string) => {
    if (selectedSizes.includes(sz)) {
      if (selectedSizes.length > 1) {
        setSelectedSizes(selectedSizes.filter((s) => s !== sz));
      } else {
        toast.warning("Product must have at least one size.");
      }
    } else {
      setSelectedSizes([...selectedSizes, sz]);
    }
  };

  // Step 4 price benchmark comparison
  const benchmark = getCategoryBenchmark(category, collection);
  const priceDiffPct = Math.round(((price - benchmark.avg) / benchmark.avg) * 100);
  const priceStatus =
    priceDiffPct < -25
      ? { label: "Below Average", color: "text-blue-700 bg-blue-50 border-blue-200" }
      : priceDiffPct <= 15
      ? { label: "Competitive", color: "text-emerald-700 bg-emerald-50 border-emerald-200" }
      : priceDiffPct <= 40
      ? { label: "Premium", color: "text-amber-700 bg-amber-50 border-amber-200" }
      : { label: "Overpriced", color: "text-rose-700 bg-rose-50 border-rose-200" };

  // Margin calculation
  const wholesaleCost = Math.round(price * 0.45);
  const grossMargin = price - wholesaleCost;
  const marginPercent = Math.round((grossMargin / price) * 100);

  // Month info
  const currentMonthInfo = MONTH_DATA.find((m) => m.val === launchMonth) || MONTH_DATA[9];

  // Run Decision Tree prediction
  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a product title.");
      return;
    }
    if (!brand.trim()) {
      toast.error("Please enter a brand or label.");
      return;
    }
    if (price <= 0 || isNaN(price)) {
      toast.error("Proposed price must be greater than zero.");
      return;
    }
    if (proposedStock <= 0 || isNaN(proposedStock)) {
      toast.error("Proposed stock must be greater than zero.");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || `Handcrafted ${subcategory} by ${brand}.`,
      category: isHome ? "Home Essentials" : category,
      subcategory: subcategory.trim() || (isHome ? "Festive Decor" : "Ethnic Wear"),
      collection: isHome ? "Home Essentials" : collection,
      brand: brand.trim(),
      price: Number(price),
      discount_percentage: Number(discount) || 0,
      sizes: selectedSizes && selectedSizes.length > 0 ? selectedSizes : (isHome ? ["Standard"] : ["Free Size"]),
      color: color.trim() || (isHome ? "Festive Multicolour" : "Classic Black"),
      fabric: isHome ? material.trim() : fabric.trim(),
      material: isHome ? material.trim() : fabric.trim(),
      room: isHome ? room.trim() : undefined,
      sleeve_type: !isHome ? sleeveType.trim() : undefined,
      pattern: pattern.trim(),
      occasion: !isHome ? occasion.trim() : undefined,
      dimensions: isHome ? dimensions.trim() : undefined,
      launch_month: Number(launchMonth),
      proposed_stock: Number(proposedStock),
      target_customer: targetCustomer,
      image_url: imageUrl.trim() || undefined,
    };

    setIsAnalyzing(true);
    setAnalysisStepIndex(0);
    const interval = setInterval(() => {
      setAnalysisStepIndex((prev) => (prev + 1) % ANALYSIS_STEPS.length);
    }, 450);

    try {
      const res = await predictMutation.mutateAsync(payload);
      setPredictionResult(res);
      setApprovedStockInput(res.suggested_initial_stock || res.predicted_units || 100);
      setLastLaunchedProduct(null);
      toast.success(
        `Decision Tree Analysis complete: ${res.demand_tier} Demand (${res.predicted_units} units)`
      );
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to compute demand prediction."));
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  // Approve & Launch
  const handleApproveAndLaunch = async () => {
    if (!predictionResult) return;
    if (approvedStockInput <= 0) {
      toast.error("Approved stock must be greater than 0.");
      return;
    }

    const payload = {
      prediction_id: predictionResult.prediction_id,
      name,
      description,
      category: isHome ? "Home Essentials" : category,
      subcategory: subcategory.trim() || (isHome ? "Living & Decor" : "Ethnic Wear"),
      collection: isHome ? "Home Essentials" : collection,
      brand,
      price: Number(price),
      discount_percentage: Number(discount),
      sizes: selectedSizes,
      color,
      fabric: isHome ? material : fabric,
      material: isHome ? material : fabric,
      launch_month: Number(launchMonth),
      approved_stock: Number(approvedStockInput),
      image_url: imageUrl || undefined,
    };

    try {
      const res = await approveMutation.mutateAsync(payload);
      setLastLaunchedProduct({
        productId: res.product_id,
        sku: res.sku,
        name,
        category: res.category,
        approvedStock: res.approved_stock,
      });
      toast.success(
        `🎉 Product approved and launched! Added to Storefront catalogue & Star Schema with ${res.approved_stock} units.`
      );
      refetchHistory();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Approval failed. Please try again."));
    }
  };

  const handleRetrain = async () => {
    try {
      toast.info("Retraining CART Decision Tree on 48,500+ historical transactions...");
      await retrainMutation.mutateAsync();
      toast.success("Decision Tree successfully retrained and cached!");
      refetchModel();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Retraining failed."));
    }
  };

  if (modelLoading && !modelInfo) {
    return (
      <div className="space-y-6" data-testid="manager-demand-loading">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const metrics = modelInfo?.metrics;

  return (
    <div className="space-y-6" data-testid="manager-demand-predictor-page">
      {/* Header */}
      <PageTitle
        overline="Data Mining & Merchandising Intelligence · Interactive CART Decision Tree"
        title="Product Launch & Inventory Decision Tree"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground sm:block">
            Model: <span className="font-mono font-medium text-foreground">{modelInfo?.model_version || "CART-DT-v2.5"}</span> ·{" "}
            Training Records: <span className="font-mono font-medium text-foreground">48,500</span> ·{" "}
            Collections: <span className="font-medium text-foreground">Western, Traditional & Home</span>
          </div>
          <button
            type="button"
            data-testid="retrain-demand-model-btn"
            disabled={retrainMutation.isPending}
            onClick={handleRetrain}
            className="inline-flex items-center gap-2 border border-border bg-card px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-foreground transition hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw size={13} className={retrainMutation.isPending ? "animate-spin" : ""} />
            {retrainMutation.isPending ? "Retraining..." : "Retrain Tree Model"}
          </button>
        </div>
      </PageTitle>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-border bg-card">
        <button
          type="button"
          onClick={() => setActiveTab("simulator")}
          data-testid="tab-demand-simulator"
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === "simulator"
              ? "border-b-2 border-sale bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles size={14} className="text-sale" /> Guided Decision Support System
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("how-it-decides")}
          data-testid="tab-demand-how-it-decides"
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === "how-it-decides"
              ? "border-b-2 border-sale bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Compass size={14} className="text-sale" /> Decision Tree Explainer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tree")}
          data-testid="tab-demand-tree"
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === "tree"
              ? "border-b-2 border-sale bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <GitFork size={14} /> Full Tree Visualizer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("metrics")}
          data-testid="tab-demand-metrics"
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === "metrics"
              ? "border-b-2 border-sale bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 size={14} /> Evaluation & Confusion Matrix
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          data-testid="tab-demand-history"
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === "history"
              ? "border-b-2 border-sale bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Boxes size={14} /> Prediction Audit Log ({history?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("viva")}
          data-testid="tab-demand-viva"
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === "viva"
              ? "border-b-2 border-sale bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <HelpCircle size={14} /> Viva Voce Defense
        </button>
      </div>

      {/* ========================================================
          TAB 1: GUIDED DECISION TREE LAUNCH SUPPORT SYSTEM
          ======================================================== */}
      {activeTab === "simulator" && (
        <div className="space-y-6" data-testid="demand-simulator-tab">
          {/* Quick Demo Presets */}
          <section className="border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick Load Merchandising Presets
                </p>
                <p className="text-xs text-muted-foreground">
                  Load curated Western, Traditional Festive, or Home Essentials products to test the Decision Tree.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-sale hover:bg-card"
                  >
                    {preset.name} ({preset.collection})
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Guided 8-Step Wizard Layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left 7 Columns: Step-by-Step Input Form */}
            <form
              onSubmit={handlePredict}
              noValidate
              className="space-y-6 border border-border bg-card p-6 lg:col-span-7"
              data-testid="demand-prediction-form"
            >
              <div className="border-b border-border pb-3">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-sale">
                  Interactive Managerial Decision Flow
                </span>
                <h2 className="mt-1 font-heading text-xl font-medium">
                  Configure Proposed Product Attributes
                </h2>
              </div>

              {/* STEP 1: SELECT PRODUCT COLLECTION */}
              <div className="space-y-3 rounded-sm border border-border/70 bg-secondary/30 p-4" data-testid="step-1-collection">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Step 1: Select Product Collection & Target Audience
                  </label>
                  <span className="text-[10px] font-mono text-muted-foreground">Step 1 of 8</span>
                </div>

                {/* Clothing Toggle: Western vs Traditional */}
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">Fashion Style Stream:</p>
                  <div className="mt-1.5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCollection("WESTERN" as any);
                        if (category === "Home Essentials") setCategory("Women");
                      }}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider border transition ${
                        collection.toUpperCase() === "WESTERN"
                          ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs"
                          : "bg-background text-muted-foreground border-border hover:border-foreground"
                      }`}
                    >
                      [ Western Collection ]
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCollection("TRADITIONAL" as any);
                        if (category === "Home Essentials") setCategory("Women");
                      }}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider border transition ${
                        collection.toUpperCase() === "TRADITIONAL"
                          ? "bg-[#C85A32] text-white border-[#C85A32] shadow-xs"
                          : "bg-background text-muted-foreground border-border hover:border-foreground"
                      }`}
                    >
                      [ Traditional & Festive ]
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCollection("Home Essentials");
                        setCategory("Home Essentials");
                      }}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider border transition ${
                        collection === "Home Essentials" || category === "Home Essentials"
                          ? "bg-[#0D9488] text-white border-[#0D9488] shadow-xs"
                          : "bg-background text-muted-foreground border-border hover:border-foreground"
                      }`}
                    >
                      [ Home Essentials ]
                    </button>
                  </div>
                </div>

                {/* Target Audience / Category */}
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">Department Category:</p>
                  <div className="mt-1.5 grid grid-cols-4 gap-2">
                    {(["Women", "Men", "Kids", "Home Essentials"] as const).map((cat) => {
                      const isSel = category === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategory(cat);
                            if (cat === "Home Essentials") setCollection("Home Essentials");
                            else if (collection === "Home Essentials") setCollection("Traditional");
                          }}
                          className={`py-2 text-xs font-semibold text-center border transition ${
                            isSel
                              ? "bg-foreground text-background border-foreground font-bold"
                              : "bg-background text-muted-foreground border-border hover:border-foreground"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* STEP 2: UPLOAD PRODUCT IMAGE */}
              <div className="space-y-3 rounded-sm border border-border/70 bg-secondary/30 p-4" data-testid="step-2-image">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Step 2: Upload Proposed Product Photograph
                  </label>
                  <span className="text-[10px] font-mono text-muted-foreground">Step 2 of 8</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload an image of the proposed design. The photograph remains visible throughout analysis.
                </p>

                {/* Dropzone & File Picker */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-border bg-background hover:border-sale cursor-pointer transition rounded-xs text-center"
                  >
                    <Upload size={20} className="text-muted-foreground mb-1" />
                    <p className="text-xs font-semibold">
                      {isUploading ? "Uploading image..." : "Click or Drop to Upload Image"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Supports JPG, PNG, WEBP</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </div>

                  {imageUrl && (
                    <div className="relative shrink-0 border border-border bg-background p-1">
                      <img
                        src={imageUrl}
                        alt="Proposed Product Thumbnail"
                        className="h-20 w-20 object-cover rounded-xs"
                      />
                      <span className="absolute -top-2 -right-2 bg-emerald-600 text-white rounded-full p-0.5">
                        <CheckCircle2 size={12} />
                      </span>
                    </div>
                  )}
                </div>

                {/* Direct Image URL fallback */}
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Or Enter Direct Image URL:
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="mt-1 w-full border border-border bg-background px-3 py-1.5 text-xs font-mono focus:border-sale focus:outline-none"
                  />
                </div>
              </div>

              {/* STEP 3: CATEGORY-APPROPRIATE PRODUCT DESCRIPTION */}
              <div className="space-y-4 rounded-sm border border-border/70 bg-secondary/30 p-4" data-testid="step-3-description">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Step 3: Category-Appropriate Specifications
                  </label>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {isHome ? "Home & Lifestyle Path" : "Apparel & Fashion Path"}
                  </span>
                </div>

                {/* Name & Brand */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Handcrafted Banarasi Silk Saree"
                      className="mt-1 w-full border border-border bg-background px-3 py-2 text-xs focus:border-sale focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Brand / Label *</label>
                    <input
                      type="text"
                      required
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Salesphere Luxe"
                      className="mt-1 w-full border border-border bg-background px-3 py-2 text-xs focus:border-sale focus:outline-none"
                    />
                  </div>
                </div>

                {/* Subcategory */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Subcategory / Style *</label>
                  <input
                    type="text"
                    required
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder={isHome ? "e.g. Bed & Bath, Living & Decor, Lamps" : "e.g. Ethnic Wear, Kurtas, Sarees, Shirts, T-shirts"}
                    className="mt-1 w-full border border-border bg-background px-3 py-2 text-xs focus:border-sale focus:outline-none"
                  />
                </div>

                {/* Dynamic Attributes: Clothing vs Home Essentials */}
                {!isHome ? (
                  /* CLOTHING PATH */
                  <div className="space-y-3 border-t border-border/60 pt-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-sale">
                      Clothing Attributes: Fabric, Sleeve, Pattern & Occasion
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Fabric Material</label>
                        <select
                          value={fabric}
                          onChange={(e) => setFabric(e.target.value)}
                          className="mt-1 w-full border border-border bg-background px-3 py-2 text-xs focus:border-sale focus:outline-none"
                        >
                          {FABRICS.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Sleeve Type</label>
                        <select
                          value={sleeveType}
                          onChange={(e) => setSleeveType(e.target.value)}
                          className="mt-1 w-full border border-border bg-background px-3 py-2 text-xs focus:border-sale focus:outline-none"
                        >
                          {SLEEVE_TYPES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Pattern / Work</label>
                        <select
                          value={pattern}
                          onChange={(e) => setPattern(e.target.value)}
                          className="mt-1 w-full border border-border bg-background px-3 py-2 text-xs focus:border-sale focus:outline-none"
                        >
                          {PATTERNS.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Intended Occasion</label>
                        <select
                          value={occasion}
                          onChange={(e) => setOccasion(e.target.value)}
                          className="mt-1 w-full border border-border bg-background px-3 py-2 text-xs focus:border-sale focus:outline-none"
                        >
                          {OCCASIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* HOME ESSENTIALS PATH */
                  <div className="space-y-3 border-t border-border/60 pt-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488]">
                      Home Essentials Attributes: Material, Room, Dimensions & Type
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Material / Craft</label>
                        <select
                          value={material}
                          onChange={(e) => setMaterial(e.target.value)}
                          className="mt-1 w-full border border-border bg-background px-3 py-2 text-xs focus:border-sale focus:outline-none"
                        >
                          {MATERIALS_HOME.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Room / Placement</label>
                        <select
                          value={room}
                          onChange={(e) => setRoom(e.target.value)}
                          className="mt-1 w-full border border-border bg-background px-3 py-2 text-xs focus:border-sale focus:outline-none"
                        >
                          {ROOMS_HOME.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Product Type</label>
                        <input
                          type="text"
                          value={pattern}
                          onChange={(e) => setPattern(e.target.value)}
                          placeholder="e.g. Decorative Urli, Bedsheet Set, Runner"
                          className="mt-1 w-full border border-border bg-background px-3 py-2 text-xs focus:border-sale focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Dimensions / Size</label>
                        <input
                          type="text"
                          value={dimensions}
                          onChange={(e) => setDimensions(e.target.value)}
                          placeholder="e.g. 108 x 108 inches / 10-inch Diameter"
                          className="mt-1 w-full border border-border bg-background px-3 py-2 text-xs focus:border-sale focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Color & Sizes */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Primary Colour</label>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="e.g. Ruby Red, Gold / Brass, Classic Black"
                      className="mt-1 w-full border border-border bg-background px-3 py-2 text-xs focus:border-sale focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Available Sizes</label>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {(isHome
                        ? HOME_SIZES
                        : category === "Kids"
                        ? KIDS_SIZES
                        : CLOTHING_SIZES
                      ).map((sz) => {
                        const isSelected = selectedSizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => toggleSize(sz)}
                            className={`border px-2 py-1 text-[11px] font-medium transition ${
                              isSelected
                                ? "border-sale bg-sale text-white"
                                : "border-border bg-background text-muted-foreground hover:border-foreground"
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 4: PROPOSED SELLING PRICE */}
              <div className="space-y-3 rounded-sm border border-border/70 bg-secondary/30 p-4" data-testid="step-4-price">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Step 4: Proposed Selling Price in Indian Rupees (₹)
                  </label>
                  <span className="text-[10px] font-mono text-muted-foreground">Step 4 of 8</span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Proposed Price (₹) *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm font-mono font-bold focus:border-sale focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Launch Discount (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={80}
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm font-mono focus:border-sale focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Gross Unit Margin</label>
                    <div className="mt-1 border border-border bg-background px-3 py-2 text-xs font-mono font-semibold">
                      ₹{grossMargin} ({marginPercent}%)
                    </div>
                  </div>
                </div>

                {/* Price Benchmark Comparison Indicator */}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border border-border/80 bg-background p-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Market Comparison: </span>
                    <span className="font-semibold text-foreground">{benchmark.label} Avg: {formatINR(benchmark.avg)}</span>
                    <span className="ml-2 font-mono text-[11px] text-muted-foreground">(Band: {benchmark.band})</span>
                  </div>
                  <div className={`px-2 py-0.5 text-xs font-bold uppercase border rounded-xs ${priceStatus.color}`}>
                    {priceStatus.label} ({priceDiffPct > 0 ? `+${priceDiffPct}%` : `${priceDiffPct}%`})
                  </div>
                </div>
              </div>

              {/* STEP 5: LAUNCH MONTH */}
              <div className="space-y-3 rounded-sm border border-border/70 bg-secondary/30 p-4" data-testid="step-5-month">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Step 5: Launch Calendar Month & Seasonal Demand
                  </label>
                  <span className="text-[10px] font-mono text-muted-foreground">Step 5 of 8</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6">
                  {MONTH_DATA.map((m) => {
                    const isSel = launchMonth === m.val;
                    return (
                      <button
                        key={m.val}
                        type="button"
                        onClick={() => setLaunchMonth(m.val)}
                        className={`p-2 text-left border rounded-xs transition ${
                          isSel
                            ? "border-sale bg-sale/10 ring-1 ring-sale"
                            : "border-border bg-background hover:border-foreground/50"
                        }`}
                      >
                        <p className="text-[11px] font-bold">{m.name.slice(0, 3)}</p>
                        <p className="text-[9px] text-muted-foreground truncate">{m.surge}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Active Month Festival Insight */}
                <div className="mt-2 flex items-start gap-2 border border-sale/30 bg-sale/5 p-3 text-xs">
                  <Sparkles size={16} className="mt-0.5 shrink-0 text-sale" />
                  <div>
                    <p className="font-semibold text-foreground">
                      {currentMonthInfo.name} ({currentMonthInfo.surge}): Festivals — {currentMonthInfo.festivals.join(", ")}
                    </p>
                    <p className="mt-0.5 text-muted-foreground">
                      Traditional ethnic wear & home festive gifts experience high shopping momentum this month.
                    </p>
                  </div>
                </div>
              </div>

              {/* STEP 6: TARGET CUSTOMER */}
              <div className="space-y-3 rounded-sm border border-border/70 bg-secondary/30 p-4" data-testid="step-6-customer">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Step 6: Target Customer Segment
                  </label>
                  <span className="text-[10px] font-mono text-muted-foreground">Step 6 of 8</span>
                </div>

                <select
                  value={targetCustomer}
                  onChange={(e) => setTargetCustomer(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-2 text-xs focus:border-sale focus:outline-none"
                >
                  {CUSTOMER_SEGMENTS.map((seg) => (
                    <option key={seg} value={seg}>{seg}</option>
                  ))}
                </select>
              </div>

              {/* STEP 7: INITIAL STOCK QUANTITY */}
              <div className="space-y-3 rounded-sm border border-border/70 bg-secondary/30 p-4" data-testid="step-7-stock">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Step 7: Proposed Initial Production Stock (Units)
                  </label>
                  <span className="text-[10px] font-mono text-muted-foreground">Step 7 of 8</span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    value={proposedStock}
                    onChange={(e) => setProposedStock(Number(e.target.value))}
                    className="w-36 border border-border bg-background px-3 py-2 text-sm font-mono font-bold focus:border-sale focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[50, 80, 100, 120, 150, 200].map((units) => (
                      <button
                        key={units}
                        type="button"
                        onClick={() => setProposedStock(units)}
                        className={`border px-2.5 py-1 text-xs font-mono transition ${
                          proposedStock === units
                            ? "border-sale bg-sale text-white font-bold"
                            : "border-border bg-background hover:border-foreground"
                        }`}
                      >
                        {units}u
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  The Decision Tree will compare this stock against historical sales velocity to detect overstock holding risk or stockout risk.
                </p>
              </div>

              {/* STEP 8: EVALUATE DECISION TREE SUBMIT */}
              <div className="pt-2" data-testid="step-8-submit">
                <button
                  type="button"
                  onClick={handlePredict}
                  disabled={isAnalyzing || predictMutation.isPending}
                  data-testid="btn-evaluate-demand"
                  className="inline-flex w-full items-center justify-center gap-2 bg-[#1A1A1A] py-3.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-sale disabled:opacity-50 cursor-pointer shadow-md"
                >
                  <Sparkles size={16} className={isAnalyzing ? "animate-spin text-sale" : "text-sale"} />
                  {isAnalyzing
                    ? ANALYSIS_STEPS[analysisStepIndex]
                    : "Run Decision Tree Analysis & Launch Assessment ➔"}
                </button>
              </div>
            </form>

            {/* Right 5 Columns: Persistent Blueprint & Visual Analysis Presentation */}
            <div className="space-y-6 lg:col-span-5">
              {/* PERSISTENT PRODUCT BLUEPRINT PREVIEW CARD */}
              <div className="border border-border bg-card p-5 shadow-xs" data-testid="blueprint-preview-card">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-sale">
                    Live Product Blueprint
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">Visible Throughout Analysis</span>
                </div>

                <div className="mt-4 flex gap-4">
                  {imageUrl ? (
                    <div className="relative shrink-0 overflow-hidden border border-border bg-secondary">
                      <img
                        src={imageUrl}
                        alt={name}
                        className="h-32 w-28 object-cover object-top transition duration-300 hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-32 w-28 shrink-0 flex-col items-center justify-center border border-dashed border-border bg-secondary text-xs text-muted-foreground">
                      <ImageIcon size={20} className="mb-1 opacity-50" />
                      <span>No Photo</span>
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-foreground text-background">
                      {isHome ? "Home Essentials" : collection} · {category}
                    </span>
                    <h3 className="truncate font-heading text-base font-semibold">{name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{brand} · {subcategory}</p>

                    <div className="pt-2 flex items-baseline gap-2">
                      <span className="font-mono text-xl font-bold">{formatINR(price)}</span>
                      {discount > 0 && (
                        <span className="border border-sale/30 bg-sale/10 px-1.5 py-0.5 text-[10px] font-bold text-sale">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    <div className="pt-1 flex flex-wrap gap-1 text-[10px] text-muted-foreground font-mono">
                      <span>Stock: {proposedStock}u</span>
                      <span>·</span>
                      <span>Color: {color}</span>
                    </div>
                  </div>
                </div>

                {/* Specs Pill List */}
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">{isHome ? "Material:" : "Fabric:"}</span>{" "}
                    <span className="font-medium text-foreground truncate">{isHome ? material : fabric}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isHome ? "Room:" : "Occasion:"}</span>{" "}
                    <span className="font-medium text-foreground truncate">{isHome ? room : occasion}</span>
                  </div>
                </div>
              </div>

              {/* STEP 8: DECISION TREE ANALYSIS & VISUAL PRESENTATION */}
              {isAnalyzing ? (
                <div
                  className="space-y-4 border border-sale/40 bg-sale/5 p-8 text-center animate-in fade-in duration-200"
                  data-testid="decision-tree-loading-state"
                >
                  <div className="flex justify-center">
                    <div className="relative flex items-center justify-center">
                      <Sparkles className="animate-spin text-sale" size={36} />
                    </div>
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    Evaluating Scikit-Learn Decision Tree Model...
                  </h3>
                  <div className="inline-flex items-center gap-2 bg-background border border-sale/30 px-4 py-2 rounded-full text-xs font-medium text-sale shadow-xs animate-pulse">
                    <Loader2 size={14} className="animate-spin text-sale" />
                    <span>{ANALYSIS_STEPS[analysisStepIndex]}</span>
                  </div>
                  <div className="mt-4 space-y-2 text-left max-w-sm mx-auto text-xs text-muted-foreground border-t border-sale/20 pt-4">
                    {ANALYSIS_STEPS.map((step, idx) => {
                      const isDone = idx < analysisStepIndex;
                      const isCurrent = idx === analysisStepIndex;
                      return (
                        <div key={step} className="flex items-center gap-2.5">
                          {isDone ? (
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          ) : isCurrent ? (
                            <Loader2 size={14} className="text-sale animate-spin shrink-0" />
                          ) : (
                            <span className="h-3 w-3 rounded-full border border-border shrink-0" />
                          )}
                          <span
                            className={
                              isCurrent
                                ? "font-semibold text-foreground"
                                : isDone
                                ? "text-muted-foreground"
                                : "text-muted-foreground/50"
                            }
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : predictionResult ? (
                <div
                  className="space-y-6 animate-in fade-in duration-300"
                  data-testid="decision-tree-results-card"
                >
                  {/* ========================================================
                      SIMPLIFIED MANAGER REPORT: 4 DISTINCT SECTIONS
                      Section A: Demand Prediction (Binary: High / Low)
                      Section B: Stock Recommendation & Inventory Risk
                      Section C: Pricing Recommendation & Historical Benchmarks
                      Section D: Best Launch Month & 12-Month Demand Chart
                      Bottom: Executive Launch Recommendation & One-Click Launch
                      ======================================================== */}

                  {/* SECTION A: DEMAND PREDICTION (ONLY TWO CLASSES: HIGH / LOW) */}
                  <div className="border border-border bg-card p-5 space-y-4 shadow-xs" data-testid="section-demand-prediction">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#0D9488]">
                          Section A: Model Classification
                        </span>
                        <h3 className="font-heading text-lg font-medium">Demand Prediction</h3>
                      </div>
                      <span
                        data-testid="badge-demand-tier"
                        className={`px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded-xs shadow-xs ${
                          predictionResult.demand_tier === "High"
                            ? "bg-emerald-600"
                            : "bg-rose-600"
                        }`}
                      >
                        {predictionResult.demand_tier === "High" ? "HIGH DEMAND" : "LOW DEMAND"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="border border-border bg-secondary/30 p-3 rounded-xs">
                        <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                          Forecasted 30-Day Demand
                        </p>
                        <p className="text-2xl font-mono font-bold text-foreground mt-0.5">
                          {predictionResult.predicted_units} Units
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Projected sales velocity in {predictionResult.launch_month_name || `Month ${launchMonth}`}
                        </p>
                      </div>
                      <div className="border border-border bg-secondary/30 p-3 rounded-xs">
                        <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                          Calibrated Confidence
                        </p>
                        <p className="text-2xl font-mono font-bold text-emerald-700 mt-0.5">
                          {predictionResult.confidence_pct || 72.5}%
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Decision Tree model confidence
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-foreground bg-secondary/40 p-3 border-l-2 border-[#0D9488] leading-relaxed">
                      {predictionResult.demand_explanation ||
                        `The Decision Tree classified this product as ${predictionResult.demand_tier.toUpperCase()} DEMAND based on historical velocity and seasonal timing.`}
                    </p>
                  </div>

                  {/* SECTION B: RECOMMENDED INITIAL STOCK & INVENTORY RISK */}
                  <div className="border border-border bg-card p-5 space-y-4 shadow-xs" data-testid="section-stock-recommendation">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#0D9488]">
                          Section B: Inventory Planning
                        </span>
                        <h3 className="font-heading text-lg font-medium">Recommended Initial Stock</h3>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-bold uppercase border rounded-xs ${
                          predictionResult.inventory_risk?.badge === "stockout"
                            ? "text-rose-700 bg-rose-50 border-rose-200"
                            : predictionResult.inventory_risk?.badge === "overstock"
                            ? "text-amber-700 bg-amber-50 border-amber-200"
                            : "text-emerald-700 bg-emerald-50 border-emerald-200"
                        }`}
                      >
                        {predictionResult.inventory_risk?.level || "BALANCED STOCK (LOW RISK)"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-1">
                      <div className="border border-border bg-secondary/30 p-2.5 rounded-xs">
                        <span className="text-[10px] font-sans text-muted-foreground block">
                          Proposed Stock
                        </span>
                        <span className="font-bold text-foreground text-sm block mt-0.5">
                          {proposedStock} units
                        </span>
                      </div>
                      <div className="border border-border bg-secondary/30 p-2.5 rounded-xs">
                        <span className="text-[10px] font-sans text-muted-foreground block">
                          Estimated 30-Day Demand
                        </span>
                        <span className="font-bold text-foreground text-sm block mt-0.5">
                          {predictionResult.predicted_units} units
                        </span>
                      </div>
                      <div className="border border-emerald-200 bg-emerald-50/50 p-2.5 rounded-xs">
                        <span className="text-[10px] font-sans text-emerald-800 block">
                          Recommended Initial Stock
                        </span>
                        <span className="font-bold text-emerald-700 text-sm block mt-0.5">
                          {predictionResult.suggested_initial_stock} units
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/20 p-3 border-l-2 border-border">
                      {predictionResult.inventory_risk?.reasoning ||
                        predictionResult.stock_evaluation?.explanation ||
                        `Recommended initial stock of ${predictionResult.suggested_initial_stock} units includes a safety stock buffer to satisfy 30-day forecasted demand.`}
                    </p>
                  </div>

                  {/* SECTION C: RECOMMENDED SELLING PRICE */}
                  <div className="border border-border bg-card p-5 space-y-4 shadow-xs" data-testid="section-pricing-recommendation">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#0D9488]">
                          Section C: Price Optimization
                        </span>
                        <h3 className="font-heading text-lg font-medium">Recommended Selling Price</h3>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-bold uppercase border rounded-xs ${
                          priceStatus.label === "Competitive"
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                            : priceStatus.label === "Premium"
                            ? "text-amber-700 bg-amber-50 border-amber-200"
                            : priceStatus.label === "Below Average"
                            ? "text-blue-700 bg-blue-50 border-blue-200"
                            : "text-rose-700 bg-rose-50 border-rose-200"
                        }`}
                      >
                        {priceStatus.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                      <div className="border border-border bg-secondary/30 p-2.5 rounded-xs">
                        <span className="text-[10px] text-muted-foreground block font-sans">
                          Proposed Price
                        </span>
                        <span className="text-base font-bold text-foreground mt-0.5 block">
                          {formatINR(price)}
                        </span>
                      </div>
                      <div className="border border-border bg-secondary/30 p-2.5 rounded-xs">
                        <span className="text-[10px] text-muted-foreground block font-sans">
                          Historical Average Price
                        </span>
                        <span className="text-base font-bold text-muted-foreground mt-0.5 block">
                          {formatINR(predictionResult.category_average_price || benchmark.avg)}
                        </span>
                      </div>
                      <div className="border border-emerald-200 bg-emerald-50/50 p-2.5 rounded-xs">
                        <span className="text-[10px] text-emerald-800 block font-sans">
                          Recommended Selling Price
                        </span>
                        <span className="text-base font-bold text-emerald-700 mt-0.5 block">
                          {formatINR(predictionResult.recommended_price || price)}
                        </span>
                      </div>
                      <div className="border border-[#0D9488]/20 bg-[#0D9488]/5 p-2.5 rounded-xs">
                        <span className="text-[10px] text-[#0D9488] block font-sans">Suggested Launch Discount</span>
                        <span className="text-base font-bold text-[#0D9488] mt-0.5 block">
                          {predictionResult.pricing_analysis?.recommended_discount || 15}% OFF
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/20 p-3 border-l-2 border-border">
                      {predictionResult.pricing_analysis?.explanation ||
                        predictionResult.price_explanation ||
                        `Proposed price of ₹${price} is positioned relative to historical category transactions (average ₹${Math.round(predictionResult.category_average_price || benchmark.avg)}).`}
                    </p>
                  </div>

                  {/* SECTION D: BEST LAUNCH MONTH & 12-MONTH DEMAND CHART */}
                  <div className="border border-border bg-card p-5 space-y-4 shadow-xs" data-testid="section-best-launch-month">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#0D9488]">
                          Section D: Seasonality & Timing
                        </span>
                        <h3 className="font-heading text-lg font-medium">Best Launch Month</h3>
                      </div>
                      <span className="font-mono text-xs text-[#0D9488] font-bold bg-[#0D9488]/10 px-2 py-0.5 rounded-xs">
                        Peak: {predictionResult.best_launch_month?.name}
                      </span>
                    </div>

                    {/* 12-Month Bar Chart Using Division-Appropriate Seasonal System */}
                    {predictionResult.monthly_trends && predictionResult.monthly_trends.length > 0 && (
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={predictionResult.monthly_trends}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                            <XAxis dataKey="month_name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip
                              formatter={(value: any, _name: any, item: any) => [
                                `${value} units (${item.payload.seasonal_index}x seasonal index)`,
                                "Projected Demand",
                              ]}
                              labelFormatter={(label) => `Month: ${label}`}
                            />
                            <Bar dataKey="projected_units" radius={[2, 2, 0, 0]}>
                              {predictionResult.monthly_trends.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    entry.is_recommended
                                      ? "#0D9488"
                                      : entry.is_selected
                                      ? "#C85A32"
                                      : "#94A3B8"
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Timing Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="border border-emerald-200 bg-emerald-50/50 p-2.5 rounded-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                          ★ Recommended Month: {predictionResult.best_launch_month?.name}
                        </span>
                        <p className="text-[11px] text-emerald-800 mt-1 leading-snug">
                          {predictionResult.best_launch_month?.reason}
                        </p>
                      </div>
                      <div className="border border-border bg-secondary/30 p-2.5 rounded-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                          Second-Best Month: {predictionResult.second_best_launch_month?.name}
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                          {predictionResult.second_best_launch_month?.reason}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/20 p-3 border-l-2 border-border">
                      {predictionResult.seasonal_explanation}
                    </p>
                  </div>

                  {/* BOTTOM CARD: SHORT FINAL RECOMMENDATION & ONE-CLICK LAUNCH */}
                  <div className="border border-border bg-card p-5 space-y-4 shadow-xs" data-testid="section-final-recommendation">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#0D9488]">
                          Final Manager Recommendation
                        </span>
                        <h3 className="font-heading text-lg font-medium">Executive Decision</h3>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded-xs shadow-xs ${
                          predictionResult.manager_recommendation?.badge_color === "emerald"
                            ? "bg-emerald-700"
                            : predictionResult.manager_recommendation?.badge_color === "amber"
                            ? "bg-amber-600"
                            : "bg-rose-700"
                        }`}
                      >
                        {predictionResult.manager_recommendation?.status || "RECOMMENDED FOR LAUNCH"}
                      </span>
                    </div>

                    {/* Summary of 4 Recommendation Points */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div className="border border-border bg-secondary/30 p-2 rounded-xs">
                        <span className="text-[10px] font-sans text-muted-foreground block">Launch Decision</span>
                        <span className="font-bold text-foreground text-xs block mt-0.5 truncate">
                          {predictionResult.manager_recommendation?.status?.includes("NOT") ? "Do Not Launch" : "Launch"}
                        </span>
                      </div>
                      <div className="border border-border bg-secondary/30 p-2 rounded-xs">
                        <span className="text-[10px] font-sans text-muted-foreground block">Recommended Price</span>
                        <span className="font-bold text-emerald-700 text-xs block mt-0.5">
                          {formatINR(predictionResult.recommended_price || price)}
                        </span>
                      </div>
                      <div className="border border-border bg-secondary/30 p-2 rounded-xs">
                        <span className="text-[10px] font-sans text-muted-foreground block">Recommended Stock</span>
                        <span className="font-bold text-foreground text-xs block mt-0.5">
                          {predictionResult.suggested_initial_stock} units
                        </span>
                      </div>
                      <div className="border border-border bg-secondary/30 p-2 rounded-xs">
                        <span className="text-[10px] font-sans text-muted-foreground block">Recommended Month</span>
                        <span className="font-bold text-foreground text-xs block mt-0.5 truncate">
                          {predictionResult.best_launch_month?.name}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-foreground bg-secondary/40 p-3 border-l-3 border-[#0D9488] leading-relaxed">
                      {predictionResult.manager_recommendation?.rationale}
                    </p>

                    {/* Production Release Action */}
                    <div className="border-t border-border pt-4 space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <div className="w-full sm:w-40">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">
                            Approved Stock (Units)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={10000}
                            value={approvedStockInput}
                            onChange={(e) => setApprovedStockInput(Number(e.target.value))}
                            className="w-full border border-border bg-background px-3 py-2 text-sm font-mono font-bold focus:border-sale focus:outline-none"
                          />
                        </div>

                        <div className="flex-1 flex items-end">
                          <button
                            type="button"
                            onClick={() => setShowLaunchModal(true)}
                            disabled={approveMutation.isPending}
                            className="w-full bg-[#0D9488] hover:bg-[#0F766E] py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Sparkles size={15} />
                            Launch Product on SaleSphere Website ➔
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-border bg-card p-8 text-center">
                  <GitFork className="mx-auto text-muted-foreground" size={32} />
                  <p className="mt-3 text-sm font-medium">Ready for Product Launch Analysis</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Complete Steps 1 through 7 on the left and click "Run Decision Tree Analysis" to see demand predictions, inventory risk evaluation, pricing benchmarks, and launch recommendations.
                  </p>
                </div>
              )}

              {/* Launch Confirmation Modal */}
              {showLaunchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                  <div className="w-full max-w-lg border border-border bg-card p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-start justify-between border-b border-border pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#0D9488]">
                          Production Release Confirmation
                        </span>
                        <h3 className="font-heading text-lg font-bold text-foreground mt-0.5">
                          Launch Product to SaleSphere Website?
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowLaunchModal(false)}
                        className="text-muted-foreground hover:text-foreground text-sm font-mono"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex gap-4 items-center bg-secondary/30 p-3 border border-border">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={name}
                          className="h-20 w-20 object-cover border border-border"
                        />
                      ) : (
                        <div className="h-20 w-20 bg-secondary flex items-center justify-center text-xs text-muted-foreground border">
                          No Photo
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-1 text-xs">
                        <p className="font-bold text-foreground truncate">{name}</p>
                        <p className="text-muted-foreground truncate">{brand} · {subcategory}</p>
                        <p className="text-[11px] font-mono">
                          Category:{" "}
                          <strong className="text-foreground">
                            {isHome ? "Home Essentials" : category}
                          </strong>
                        </p>
                        <div className="flex gap-2 font-mono">
                          <span className="font-bold text-[#0D9488]">{formatINR(price)}</span>
                          {discount > 0 && (
                            <span className="text-sale font-semibold">({discount}% OFF)</span>
                          )}
                          <span>· Stock: <strong>{approvedStockInput}u</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1.5 border-l-2 border-[#0D9488] pl-3">
                      <p>✓ Inserts product record into operational database (<code className="font-mono">op_products</code>).</p>
                      <p>✓ Registers product dimension & variants in analytical warehouse (<code className="font-mono">dim_product</code>).</p>
                      <p>✓ Makes product immediately browseable, searchable, and purchasable by customers.</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowLaunchModal(false)}
                        className="flex-1 border border-border bg-background py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-foreground transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={approveMutation.isPending}
                        onClick={async () => {
                          await handleApproveAndLaunch();
                          setShowLaunchModal(false);
                        }}
                        className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] py-2.5 text-xs font-bold uppercase tracking-wider text-white transition disabled:opacity-50"
                      >
                        {approveMutation.isPending ? "Publishing to Website..." : "Confirm & Launch Live ➔"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Launched Product Confirmation */}
              {lastLaunchedProduct && (
                <div
                  className="border border-emerald-600 bg-emerald-50 p-5 text-emerald-950"
                  data-testid="launch-success-banner"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-700" size={18} />
                    <h4 className="font-heading text-base font-semibold text-emerald-900">
                      Product Successfully Launched!
                    </h4>
                  </div>
                  <p className="mt-2 text-xs">
                    <span className="font-semibold">{lastLaunchedProduct.name}</span> (SKU:{" "}
                    <code className="font-mono font-bold">{lastLaunchedProduct.sku}</code>) is now live in the store catalogue with an initial inventory of{" "}
                    <span className="font-bold">{lastLaunchedProduct.approvedStock} units</span>.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <Link
                      to={`/product/${lastLaunchedProduct.productId}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 bg-emerald-700 px-3 py-1.5 font-semibold text-white transition hover:bg-emerald-800"
                    >
                      <Store size={13} /> View on Live Storefront <ExternalLink size={11} />
                    </Link>
                    <Link
                      to={lastLaunchedProduct.category.toLowerCase().includes("home") ? "/home-essentials" : `/${lastLaunchedProduct.category.toLowerCase()}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 border border-emerald-700 px-3 py-1.5 font-semibold text-emerald-900 transition hover:bg-emerald-100"
                    >
                      Browse {lastLaunchedProduct.category} Collection
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: HOW THE DECISION TREE DECIDES (EXPLAINER)
          ======================================================== */}
      {activeTab === "how-it-decides" && modelInfo?.tree_graph && (
        <DecisionTreeExplainer
          treeGraph={modelInfo.tree_graph}
          predictionResult={predictionResult}
          currentProduct={{
            name,
            category,
            subcategory,
            brand,
            price: Number(price),
            discount_percentage: Number(discount),
            launch_month: Number(launchMonth),
            color,
            fabric: isHome ? material : fabric,
          }}
          onSwitchToSimulator={() => setActiveTab("simulator")}
          onApplyPreset={(p) => {
            handleApplyPreset(p);
            setActiveTab("how-it-decides");
          }}
          samplePresets={SAMPLE_PRESETS}
        />
      )}

      {/* ========================================================
          TAB 3: FULL TREE VISUALIZER
          ======================================================== */}
      {activeTab === "tree" && (
        <div className="space-y-6" data-testid="demand-tree-tab">
          <div className="border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h2 className="font-heading text-xl font-medium">Trained CART Decision Tree Architecture</h2>
                <p className="text-xs text-muted-foreground">
                  Hierarchical binary splits learned on authoritative historical transactions. Leaves classify predicted 30-day demand into High, Medium, or Low.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter by feature (e.g. Unit_Price)..."
                  value={treeSearch}
                  onChange={(e) => setTreeSearch(e.target.value)}
                  className="border border-border bg-background px-3 py-1.5 text-xs focus:border-sale focus:outline-none"
                />
              </div>
            </div>

            {/* Tree Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs border-b border-border pb-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 bg-[#1A1A1A]" /> Decision Split Node (Condition test)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 bg-emerald-600" /> Leaf: High Demand Tier
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 bg-amber-600" /> Leaf: Medium Demand Tier
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 bg-rose-600" /> Leaf: Low Demand Tier
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Info size={12} /> Left branch = True / Yes, Right branch = False / No
              </span>
            </div>

            {/* Tree Nodes Renderer */}
            <div className="mt-6 max-h-[650px] overflow-auto p-2" data-testid="tree-graph-container">
              {modelInfo?.tree_graph ? (
                <TreeNodeViewer node={modelInfo.tree_graph} searchTerm={treeSearch} />
              ) : (
                <p className="text-sm text-muted-foreground">No tree structure available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: MODEL METRICS & CONFUSION MATRIX
          ======================================================== */}
      {activeTab === "metrics" && metrics && (
        <div className="space-y-6" data-testid="demand-metrics-tab">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi
              testId="kpi-tree-samples"
              label="Validation Holdout Split"
              value={`${modelInfo.test_samples || 432} samples`}
              hint="20% stratified holdout partition"
              tone="sale"
            />
            <Kpi
              testId="kpi-tree-f1"
              label="Macro F1-Score"
              value={metrics.classification.f1_score.toFixed(3)}
              hint={`Precision: ${metrics.classification.precision.toFixed(3)} · Recall: ${metrics.classification.recall.toFixed(3)}`}
            />
            <Kpi
              testId="kpi-tree-mae"
              label="Regression MAE"
              value={`${metrics.regression.mae.toFixed(1)} units`}
              hint={`vs ${metrics.regression.baseline_mae.toFixed(1)} dummy baseline`}
            />
            <Kpi
              testId="kpi-tree-rmse"
              label="Regression RMSE"
              value={`${metrics.regression.rmse.toFixed(1)} units`}
              hint={`R² Score: ${metrics.regression.r2_score.toFixed(3)}`}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Confusion Matrix */}
            <section className="border border-border bg-card p-5 lg:col-span-6" data-testid="confusion-matrix-section">
              <h2 className="font-heading text-lg font-medium">Confusion Matrix (Holdout Test Split)</h2>
              <p className="text-xs text-muted-foreground">
                Evaluates predictions against true demand labels on an unseen 20% validation split.
              </p>

              <div className="mt-6 flex flex-col items-center">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground pb-2">
                  Predicted Demand Tier ➔
                </div>
                <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs">
                  <div className="p-2 font-bold text-muted-foreground">Actual ↓</div>
                  {metrics.classification.confusion_matrix.labels.map((l) => (
                    <div key={l} className="bg-secondary p-2 font-bold text-foreground">
                      {l}
                    </div>
                  ))}

                  {metrics.classification.confusion_matrix.matrix.map((row, rIdx) => {
                    const rowLabel = metrics.classification.confusion_matrix.labels[rIdx];
                    const rowSum = row.reduce((a, b) => a + b, 0);
                    return (
                      <>
                        <div key={`lbl-${rowLabel}`} className="bg-secondary p-2 font-bold text-foreground">
                          {rowLabel}
                        </div>
                        {row.map((val, cIdx) => {
                          const isDiagonal = rIdx === cIdx;
                          return (
                            <div
                              key={`cell-${rIdx}-${cIdx}`}
                              className={`p-3 font-mono font-bold transition ${
                                isDiagonal
                                  ? "bg-emerald-600 text-white"
                                  : val > 0
                                  ? "bg-rose-100 text-rose-900"
                                  : "bg-background text-muted-foreground"
                              }`}
                              title={`Actual: ${rowLabel}, Predicted: ${metrics.classification.confusion_matrix.labels[cIdx]}: ${val} items`}
                            >
                              {val}
                            </div>
                          );
                        })}
                      </>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 bg-emerald-600" /> True Positives (Correct classifications)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 bg-rose-100 border border-rose-300" /> Misclassifications
                  </span>
                </div>
              </div>
            </section>

            {/* Feature Importance Bar Chart */}
            <section className="border border-border bg-card p-5 lg:col-span-6" data-testid="feature-importance-section">
              <h2 className="font-heading text-lg font-medium">CART Feature Importances (Gini Reduction)</h2>
              <p className="text-xs text-muted-foreground">
                Relative contribution of design attributes towards reducing variance and impurity in demand splits.
              </p>

              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={modelInfo.feature_importances}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid stroke="#E8E2D9" strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" fontSize={11} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                    <YAxis dataKey="feature" type="category" fontSize={11} width={80} />
                    <Tooltip
                      formatter={(v: number) => [`${(v * 100).toFixed(2)}%`, "Importance"]}
                    />
                    <Bar dataKey="importance" fill="#C85A32">
                      {modelInfo.feature_importances.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#C85A32" : index === 1 ? "#B8860B" : "#1A1A1A"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: AUDIT LOG HISTORY
          ======================================================== */}
      {activeTab === "history" && (
        <section className="border border-border bg-card p-5" data-testid="demand-history-tab">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h2 className="font-heading text-xl font-medium">Decision Tree Prediction Audit Ledger</h2>
              <p className="text-xs text-muted-foreground">
                Chronological ledger of demand evaluations and managerial approvals in <code className="font-mono">op_demand_predictions</code>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetchHistory()}
              className="inline-flex items-center gap-1.5 border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-card"
            >
              <RefreshCw size={12} /> Refresh History
            </button>
          </div>

          {historyLoading ? (
            <Skeleton className="mt-4 h-48 w-full" />
          ) : !history || history.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No demand predictions recorded yet. Run an analysis in the first tab to build history.
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs" data-testid="table-demand-history">
                <thead>
                  <tr className="border-b border-border bg-secondary text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price & Disc.</th>
                    <th className="p-3">Predicted Demand</th>
                    <th className="p-3">Proposed Stock</th>
                    <th className="p-3">Suggested Stock</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Approved Stock</th>
                    <th className="p-3">Evaluated At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-sans">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary/40 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt=""
                              className="h-8 w-8 object-cover border border-border"
                            />
                          )}
                          <div>
                            <p className="font-medium text-foreground">{item.product_name}</p>
                            <p className="text-[10px] text-muted-foreground">{item.brand} · {item.fabric}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{item.category}</span>
                        <p className="text-[10px] text-muted-foreground">{item.subcategory}</p>
                      </td>
                      <td className="p-3 font-mono">
                        {formatINR(item.price)}
                        {item.discount_percentage > 0 && (
                          <span className="ml-1 text-[10px] text-sale">({item.discount_percentage}%)</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase ${
                            item.demand_tier === "High"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.demand_tier === "Medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {item.demand_tier} ({item.predicted_units}u)
                        </span>
                      </td>
                      <td className="p-3 font-mono">{item.proposed_stock} u</td>
                      <td className="p-3 font-mono font-medium">{item.suggested_stock} u</td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase ${
                            item.status === "Approved"
                              ? "bg-emerald-700 text-white"
                              : item.status === "Rejected"
                              ? "bg-rose-700 text-white"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-semibold">
                        {item.approved_stock ? `${item.approved_stock} u` : "—"}
                      </td>
                      <td className="p-3 text-[11px] text-muted-foreground font-mono">
                        {formatDateTime(item.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ========================================================
          TAB 6: VIVA VOCE ACADEMIC DEFENSE
          ======================================================== */}
      {activeTab === "viva" && (
        <div className="space-y-6" data-testid="demand-viva-tab">
          <section className="border border-border bg-card p-6">
            <h2 className="font-heading text-2xl font-medium">College Viva Voce Defense Guide</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Direct, academically rigorous answers for project examiners on Data Mining, Data Warehousing, Decision Tree Mathematics, and Practical E-Commerce Integration.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <VivaCard
                  question="1. Why Decision Tree (CART) instead of Deep Neural Networks or Black-Box Models?"
                  answer="In retail merchandising and fashion procurement, explainability is a legal and business necessity. Decision Trees provide fully interpretable, deterministic if-else rules. An inventory manager can inspect the exact split condition (e.g., 'If Unit_Price <= ₹2,000 AND Discount > 15% AND Season == Festive -> High Demand') rather than trusting an opaque matrix of weights. This transparent decision path directly informs procurement budgets."
                />
                <VivaCard
                  question="2. How do you prevent Data Leakage during feature engineering?"
                  answer="Data leakage occurs when target or post-event information inadvertently enters the feature set. To strictly prevent this, our Decision Tree ONLY ingests attributes known at design/launch time: Category, Subcategory, Brand, Unit Selling Price, Discount Percentage, Calendar Month, and Indian Fashion Season. Post-launch metrics (such as customer review stars, actual sales velocity, return rates, and pageviews) are rigorously excluded from training."
                />
                <VivaCard
                  question="3. What is the mathematical splitting criterion used in the Decision Tree?"
                  answer="We utilize the CART (Classification and Regression Trees) algorithm with Gini Impurity for classification: Gini(t) = 1 - sum(p_i^2). At each candidate node split on feature f and threshold theta, the algorithm selects the partition that maximizes Information Gain (Gini Reduction): Delta Gini = Gini(parent) - [ (N_L / N) * Gini(left) + (N_R / N) * Gini(right) ]. For the regression model predicting exact demand units, Mean Squared Error (variance reduction) is minimized."
                />
              </div>

              <div className="space-y-4">
                <VivaCard
                  question="4. How does product approval bridge the OLTP database with the OLAP Data Warehouse?"
                  answer="When the manager approves a product launch with initial inventory stock: (1) An active SKU record is written into operational.db (op_products) tagged with 'New Launch', making it immediately purchasable by live shoppers. (2) Simultaneously, dimension records are inserted into ecommerce_dw.db Star Schema: dim_product and individual size/color records into dim_product_variants, maintaining complete dimensional integrity for future OLAP rollups and slice-and-dice queries."
                />
                <VivaCard
                  question="5. How are the model evaluation metrics structured against baselines?"
                  answer="A model's metric is meaningless without a baseline comparison. We split historical product-month transactions into an 80% train and 20% holdout test set. We evaluate the Decision Tree against a Scikit-Learn DummyClassifier (most frequent class strategy) and DummyRegressor (mean strategy). The portal displays accuracy lift (+15.3% over dummy baseline) and MAE reduction, proving real predictive signal beyond random chance."
                />
                <VivaCard
                  question="6. What are the key limitations and real-world considerations?"
                  answer="Decision Trees are susceptible to high variance and sensitivity to small changes in training data (which can be mitigated in production by Random Forests). Secondly, demand in fast-fashion can be influenced by exogenous viral social media trends or sudden macroeconomic supply shocks not captured in catalog metadata. Hence, human manager approval remains mandatory before committing inventory capital."
                />
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Recursively renders the trained Decision Tree structure
function TreeNodeViewer({ node, searchTerm }: { node: TreeNode; searchTerm: string }) {
  const [collapsed, setCollapsed] = useState<boolean>(node.depth > 2);

  const matches =
    !searchTerm ||
    (node.condition && node.condition.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (node.feature && node.feature.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (node.prediction && node.prediction.toLowerCase().includes(searchTerm.toLowerCase()));

  const isLeaf = node.is_leaf;

  return (
    <div className={`my-1.5 font-mono text-xs ${matches ? "opacity-100" : "opacity-30"}`}>
      <div
        className={`inline-flex items-center gap-2 border px-3 py-1.5 shadow-xs transition ${
          isLeaf
            ? node.prediction === "High"
              ? "border-emerald-600 bg-emerald-50 text-emerald-950"
              : node.prediction === "Medium"
              ? "border-amber-600 bg-amber-50 text-amber-950"
              : "border-rose-600 bg-rose-50 text-rose-950"
            : "border-border bg-card text-foreground"
        }`}
      >
        {!isLeaf && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground"
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
          </button>
        )}

        <span className="font-bold text-[10px] text-muted-foreground">#{node.id}</span>

        {isLeaf ? (
          <span className="font-semibold">
            Leaf ➔ <span className="uppercase font-bold underline">{node.prediction} Demand</span> ({node.samples} products, Impurity: {node.impurity})
          </span>
        ) : (
          <span className="font-medium">
            <span className="font-bold text-sale">{node.condition}</span> · Gini: {node.impurity} · Samples: {node.samples}
          </span>
        )}

        {node.distribution && (
          <span className="hidden sm:inline-block text-[10px] text-muted-foreground">
            [H: {node.distribution.High || 0}, M: {node.distribution.Medium || 0}, L: {node.distribution.Low || 0}]
          </span>
        )}
      </div>

      {!isLeaf && !collapsed && (
        <div className="ml-6 mt-1 border-l-2 border-border/70 pl-3 space-y-1">
          {node.left && (
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase">├─ If True (Yes):</span>
              <TreeNodeViewer node={node.left} searchTerm={searchTerm} />
            </div>
          )}
          {node.right && (
            <div>
              <span className="text-[10px] font-bold text-rose-700 uppercase">└─ If False (No):</span>
              <TreeNodeViewer node={node.right} searchTerm={searchTerm} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Subcomponent: College Viva Card
function VivaCard({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-border bg-card p-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between text-left font-heading text-sm font-semibold text-foreground hover:text-sale"
      >
        <span>{question}</span>
        <ChevronDown size={14} className={`shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{answer}</p>}
    </div>
  );
}
