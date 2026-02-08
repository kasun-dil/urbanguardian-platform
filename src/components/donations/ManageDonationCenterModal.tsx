import { useEffect, useState } from "react";
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  FolderPlus,
  Settings,
  Phone,
  MapPin
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useDonationCenterDetails, 
  useCenterManagement,
  useUserDonationCenters,
  type DonationCenter 
} from "@/hooks/useDonationCenters";
import { toast } from "sonner";

interface ManageDonationCenterModalProps {
  center: DonationCenter | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function ManageDonationCenterModal({ center, isOpen, onClose, onUpdated }: ManageDonationCenterModalProps) {
  const { center: details, loading } = useDonationCenterDetails(center?.id || null);
  const { updateCenter, deleteCenter } = useUserDonationCenters();
  const management = useCenterManagement(center?.id || "");
  
  const [activeTab, setActiveTab] = useState("info");
  const [editingInfo, setEditingInfo] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", category_id: "", max_capacity: "100" });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProductData, setEditProductData] = useState({ current_count: "", max_capacity: "" });
  const [localStatus, setLocalStatus] = useState<DonationCenter["status"]>(center?.status || "active");
  
  // Info form state
  const [infoForm, setInfoForm] = useState({
    name: center?.name || "",
    description: center?.description || "",
    location: center?.location || "",
    phone_numbers: center?.phone_numbers || [],
    currentPhone: "",
  });

  // Sync local status with latest center prop (avoid setState during render)
  useEffect(() => {
    if (!center) return;
    setLocalStatus(center.status);
  }, [center?.id, center?.status]);

  if (!center) return null;

  const handleUpdateInfo = async () => {
    const success = await updateCenter(center.id, {
      name: infoForm.name,
      description: infoForm.description || null,
      location: infoForm.location,
      phone_numbers: infoForm.phone_numbers,
    });
    if (success) {
      setEditingInfo(false);
      onUpdated?.();
    }
  };

  const handleToggleStatus = async (checked: boolean) => {
    const prevStatus = localStatus;
    const newStatus: DonationCenter["status"] = checked ? "active" : "inactive";

    setLocalStatus(newStatus); // Optimistic update
    const success = await updateCenter(center.id, { status: newStatus });
    if (!success) {
      setLocalStatus(prevStatus); // Rollback on failure
      return;
    }

    onUpdated?.();
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    await management.addCategory(newCategory.trim());
    setNewCategory("");
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) return;
    await management.addProduct({
      name: newProduct.name.trim(),
      category_id: newProduct.category_id || undefined,
      max_capacity: parseInt(newProduct.max_capacity) || 100,
    });
    setNewProduct({ name: "", category_id: "", max_capacity: "100" });
  };

  const handleUpdateProductCount = async (productId: string) => {
    await management.updateProduct(productId, {
      current_count: parseInt(editProductData.current_count) || 0,
      max_capacity: parseInt(editProductData.max_capacity) || 100,
    });
    setEditingProductId(null);
  };

  const handleDeleteCenter = async () => {
    if (confirm("Are you sure you want to delete this donation center? This action cannot be undone.")) {
      const success = await deleteCenter(center.id);
      if (success) {
        onUpdated?.();
        onClose();
      }
    }
  };

  const handleAddPhone = () => {
    if (infoForm.currentPhone && !infoForm.phone_numbers.includes(infoForm.currentPhone)) {
      setInfoForm(prev => ({
        ...prev,
        phone_numbers: [...prev.phone_numbers, prev.currentPhone],
        currentPhone: "",
      }));
    }
  };

  const handleRemovePhone = (phone: string) => {
    setInfoForm(prev => ({
      ...prev,
      phone_numbers: prev.phone_numbers.filter(p => p !== phone),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-4 sm:p-6 pb-0 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Settings className="h-5 w-5 text-accent" />
              </div>
              <DialogTitle className="text-lg sm:text-xl truncate">Manage: {center.name}</DialogTitle>
            </div>
            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <Label htmlFor="status-toggle" className="text-sm whitespace-nowrap">
                {localStatus === "active" ? "Active" : "Inactive"}
              </Label>
              <Switch
                id="status-toggle"
                checked={localStatus === "active"}
                onCheckedChange={handleToggleStatus}
              />
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
          <TabsList className="mx-4 sm:mx-6 mt-4 w-auto shrink-0">
            <TabsTrigger value="info">Center Info</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 overflow-y-auto mt-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            <div className="p-4 sm:p-6">
              {/* Info Tab */}
              <TabsContent value="info" className="mt-0 space-y-4">
                {editingInfo ? (
                  <>
                    <div className="space-y-2">
                      <Label>Center Name</Label>
                      <Input
                        value={infoForm.name}
                        onChange={(e) => setInfoForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={infoForm.description}
                        onChange={(e) => setInfoForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={infoForm.location}
                        onChange={(e) => setInfoForm(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Numbers</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add phone number"
                          value={infoForm.currentPhone}
                          onChange={(e) => setInfoForm(prev => ({ ...prev, currentPhone: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddPhone();
                            }
                          }}
                        />
                        <Button type="button" variant="outline" onClick={handleAddPhone}>
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                      {infoForm.phone_numbers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {infoForm.phone_numbers.map((phone) => (
                            <Badge key={phone} variant="secondary" className="gap-1 pr-1">
                              {phone}
                              <button
                                type="button"
                                onClick={() => handleRemovePhone(phone)}
                                className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateInfo} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditingInfo(false)}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                        <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{center.location}</p>
                        </div>
                      </div>
                      {center.description && (
                        <div className="p-3 rounded-lg bg-secondary/30">
                          <p className="text-sm font-medium mb-1">Description</p>
                          <p className="text-sm text-muted-foreground">{center.description}</p>
                        </div>
                      )}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                        <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Contact Numbers</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {center.phone_numbers.map((phone, i) => (
                              <Badge key={i} variant="outline">{phone}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => {
                        setInfoForm({
                          name: center.name,
                          description: center.description || "",
                          location: center.location,
                          phone_numbers: center.phone_numbers,
                          currentPhone: "",
                        });
                        setEditingInfo(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Info
                    </Button>
                  </>
                )}

                <Separator className="my-4" />

                <Button variant="destructive" className="gap-2" onClick={handleDeleteCenter}>
                  <Trash2 className="h-4 w-4" />
                  Delete Center
                </Button>
              </TabsContent>

              {/* Categories Tab */}
              <TabsContent value="categories" className="mt-0 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="New category name (e.g., Dry Food)"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                  />
                  <Button onClick={handleAddCategory} className="gap-2">
                    <FolderPlus className="h-4 w-4" />
                    Add
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : details?.categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No categories yet. Add your first category above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {details?.categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                        <span>{category.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => management.deleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-0 space-y-4">
                <div className="grid gap-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Product name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      className="flex-1"
                    />
                    <Select
                      value={newProduct.category_id || "none"}
                      onValueChange={(value) => setNewProduct(prev => ({ ...prev, category_id: value === "none" ? "" : value }))}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
                        {details?.categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={newProduct.max_capacity}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, max_capacity: e.target.value }))}
                      className="w-20"
                    />
                    <Button onClick={handleAddProduct} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : details?.products.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No products yet. Add your first product above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {details?.products.map((product) => (
                      <div key={product.id} className="p-3 rounded-lg bg-secondary/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{product.name}</span>
                            {product.category_id && (
                              <Badge variant="outline" className="ml-2">
                                {details.categories.find(c => c.id === product.category_id)?.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {editingProductId === product.id ? (
                              <>
                                <Input
                                  type="number"
                                  value={editProductData.current_count}
                                  onChange={(e) => setEditProductData(prev => ({ ...prev, current_count: e.target.value }))}
                                  className="w-20"
                                  placeholder="Count"
                                />
                                <span>/</span>
                                <Input
                                  type="number"
                                  value={editProductData.max_capacity}
                                  onChange={(e) => setEditProductData(prev => ({ ...prev, max_capacity: e.target.value }))}
                                  className="w-20"
                                  placeholder="Max"
                                />
                                <Button size="icon" className="h-8 w-8" onClick={() => handleUpdateProductCount(product.id)}>
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setEditingProductId(null)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <span className="text-sm text-muted-foreground">
                                  {product.current_count} / {product.max_capacity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditingProductId(product.id);
                                    setEditProductData({
                                      current_count: product.current_count.toString(),
                                      max_capacity: product.max_capacity.toString(),
                                    });
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => management.deleteProduct(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
