"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Spinner,
  Input,
  Textarea,
} from "@heroui/react";
import { ChevronDownIcon } from "@/components/Icons";

interface Line {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  defaultRateMonth?: number | null;
  defaultRateDay?: number | null;
}

interface StationProductInput {
  productId: number;
  units: number;
  rateMonth: number;
  rateDay: number;
}

interface StationAudience {
  id: number;
  name: string;
}

interface StationType {
  id: number;
  name: string;
}

interface FormData {
  name: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  footfall: string;
  totalInventory: string;
  images: string[];
  lineIds: number[];
  audienceIds: number[];
  typeIds: number[];
  products: StationProductInput[];
}

export default function EditStationPage() {
  const params = useParams();
  const stationId = params?.id as string;

  const [lines, setLines] = useState<Line[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [audiences, setAudiences] = useState<StationAudience[]>([]);
  const [types, setTypes] = useState<StationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    footfall: "",
    totalInventory: "",
    images: [""],
    lineIds: [],
    audienceIds: [],
    typeIds: [],
    products: [],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [linesData, productsData, audiencesData, typesData, stationData] = await Promise.all([
          fetch("/api/lines").then((r) => r.json()),
          fetch("/api/products").then((r) => r.json()),
          fetch("/api/stations/audiences").then((r) => r.json()),
          fetch("/api/stations/types").then((r) => r.json()),
          fetch(`/api/stations/${stationId}`).then((r) => r.json()),
        ]);

        setLines(linesData);
        setProducts(productsData);
        setAudiences(audiencesData);
        setTypes(typesData);

        // Pre-fill form with existing station data
        setForm({
          name: stationData.name || "",
          description: stationData.description || "",
          address: stationData.address || "",
          latitude: stationData.latitude?.toString() || "",
          longitude: stationData.longitude?.toString() || "",
          footfall: stationData.footfall?.toString() || "",
          totalInventory: stationData.totalInventory?.toString() || "",
          images: stationData.images && stationData.images.length > 0 ? stationData.images : [""],
          lineIds: stationData.lines || [],
          audienceIds: stationData.audiences || [],
          typeIds: stationData.types || [],
          products: stationData.products?.map((p: any) => ({
            productId: p.productId || p.id,
            units: p.units || 0,
            rateMonth: p.rateMonth || p.defaultRateMonth || 0,
            rateDay: p.rateDay || p.defaultRateDay || 0,
          })) || [],
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
        alert("Failed to load station data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [stationId]);

  const updateField = useCallback((field: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const updateImage = useCallback((index: number, value: string) => {
    setForm((prev) => {
      const newImages = [...prev.images];
      newImages[index] = value;
      return { ...prev, images: newImages };
    });
    setErrors((prev) => ({ ...prev, images: "" }));
  }, []);

  const addImageField = useCallback(() => {
    setForm((prev) => ({ ...prev, images: [...prev.images, ""] }));
  }, []);

  const removeImageField = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const toggleProduct = useCallback((product: Product) => {
    setForm((prev) => {
      const exists = prev.products.find((p) => p.productId === product.id);

      if (exists) {
        return {
          ...prev,
          products: prev.products.filter((p) => p.productId !== product.id),
        };
      } else {
        return {
          ...prev,
          products: [
            ...prev.products,
            {
              productId: product.id,
              units: 0,
              rateMonth: product.defaultRateMonth ?? 0,
              rateDay: product.defaultRateDay ?? 0,
            },
          ],
        };
      }
    });
    setErrors((prev) => ({ ...prev, products: "" }));
  }, []);

  const updateStationProduct = useCallback(
    (productId: number, key: keyof StationProductInput, value: string) => {
      setForm((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.productId === productId ? { ...p, [key]: Number(value) } : p
        ),
      }));
    },
    []
  );

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "Station name is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.latitude.trim()) {
      newErrors.latitude = "Latitude is required";
    } else if (isNaN(parseFloat(form.latitude))) {
      newErrors.latitude = "Latitude must be a valid number";
    }
    if (!form.longitude.trim()) {
      newErrors.longitude = "Longitude is required";
    } else if (isNaN(parseFloat(form.longitude))) {
      newErrors.longitude = "Longitude must be a valid number";
    }
    if (!form.footfall.trim()) {
      newErrors.footfall = "Footfall is required";
    }

    const hasEmptyImages = form.images.some((img) => !img.trim());
    if (hasEmptyImages) newErrors.images = "All image URLs must be filled";

    if (form.lineIds.length === 0) newErrors.lines = "Select at least one line";
    if (form.audienceIds.length === 0) newErrors.audiences = "Select at least one audience";
    if (form.typeIds.length === 0) newErrors.types = "Select at least one station type";
    if (form.products.length === 0) newErrors.products = "Select at least one product";

    const hasInvalidUnits = form.products.some((p) => p.units <= 0);
    if (hasInvalidUnits) {
      newErrors.products = "All selected products must have units greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const submitData = async () => {
    if (!validateForm()) {
      alert("Please fix all validation errors before submitting");
      return;
    }

    setSubmitting(true);

    try {
      const totalInventory = form.products.reduce((sum, p) => sum + (Number(p.units) || 0), 0);

      const payload = {
        id: parseInt(stationId),
        name: form.name.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        footfall: form.footfall.trim(),
        totalInventory,
        images: form.images.filter((img) => img.trim()),
        lineIds: form.lineIds,
        audienceIds: form.audienceIds,
        typeIds: form.typeIds,
        products: form.products,
      };

      const res = await fetch(`/api/stations/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Try to parse error message
        let errorMessage = "Failed to update station";
        try {
          const data = await res.json();
          errorMessage = data.message || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use status text
          errorMessage = `Error ${res.status}: ${res.statusText}`;
        }
        alert(errorMessage);
        return;
      }

      const data = await res.json();
      alert("Station updated successfully!");
      window.location.href = "/cms";
    } catch (error) {
      console.error("Submit error:", error);
      alert("An error occurred while updating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Station</h1>

      <div className="space-y-6">
        {/* Station Name */}
        <Input
          label="Station Name"
          placeholder="e.g., Rajiv Chowk Metro Station"
          variant="bordered"
          radius="md"
          value={form.name}
          isInvalid={!!errors.name}
          errorMessage={errors.name}
          onValueChange={(value) => updateField("name", value)}
          labelPlacement="outside"
          isRequired
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Enter a detailed description of the station"
          variant="bordered"
          radius="md"
          value={form.description}
          isInvalid={!!errors.description}
          errorMessage={errors.description}
          onValueChange={(value) => updateField("description", value)}
          labelPlacement="outside"
          minRows={3}
          isRequired
        />

        {/* Address */}
        <Input
          label="Address"
          placeholder="Enter complete address"
          variant="bordered"
          radius="md"
          value={form.address}
          isInvalid={!!errors.address}
          errorMessage={errors.address}
          onValueChange={(value) => updateField("address", value)}
          labelPlacement="outside"
          isRequired
        />

        {/* Latitude & Longitude */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Latitude"
            placeholder="e.g., 28.6328"
            variant="bordered"
            radius="md"
            value={form.latitude}
            isInvalid={!!errors.latitude}
            errorMessage={errors.latitude}
            onValueChange={(value) => updateField("latitude", value)}
            labelPlacement="outside"
            type="number"
            step="any"
            isRequired
          />
          <Input
            label="Longitude"
            placeholder="e.g., 77.2197"
            variant="bordered"
            radius="md"
            value={form.longitude}
            isInvalid={!!errors.longitude}
            errorMessage={errors.longitude}
            onValueChange={(value) => updateField("longitude", value)}
            labelPlacement="outside"
            type="number"
            step="any"
            isRequired
          />
        </div>

        {/* Footfall */}
        <Input
  label="Footfall (daily)"
  placeholder="e.g., ~5,20,000 riders/day"
  variant="bordered"
  radius="md"
  value={form.footfall}
  isInvalid={!!errors.footfall}
  errorMessage={errors.footfall}
  onValueChange={(value) => updateField("footfall", value)}
  labelPlacement="outside"
  type="text"   // ✅ changed
  isRequired
/>


        {/* Images */}
        <div>
          <label className="block font-semibold text-lg mb-3">
            Station Images <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {form.images.map((img, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Image URL ${index + 1}`}
                  variant="bordered"
                  radius="md"
                  value={img}
                  onValueChange={(value) => updateImage(index, value)}
                  isInvalid={!!errors.images && index === form.images.length - 1}
                  errorMessage={index === form.images.length - 1 ? errors.images : ""}
                  className="flex-1"
                />
                {form.images.length > 1 && (
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={() => removeImageField(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button color="success" variant="flat" onPress={addImageField} className="mt-3">
            + Add More Images
          </Button>
        </div>

        {/* Lines */}
        <div>
          <label className="block font-semibold text-lg mb-2">
            Metro Lines <span className="text-red-500">*</span>
          </label>
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" endContent={<ChevronDownIcon />} className="w-full md:w-auto">
                {form.lineIds.length > 0
                  ? lines
                    .filter((line) => form.lineIds.includes(line.id))
                    .map((line) => line.name)
                    .join(", ")
                  : "Select Lines"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              closeOnSelect={false}
              selectedKeys={form.lineIds.map(String)}
              selectionMode="multiple"
              variant="flat"
              onSelectionChange={(keys) => {
                const selected = Array.from(keys as Set<string>).map(Number);
                updateField("lineIds", selected);
              }}
            >
              {lines.map((line) => (
                <DropdownItem key={line.id}>{line.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          {errors.lines && <p className="text-red-500 text-sm mt-1">{errors.lines}</p>}
        </div>

        {/* Station Audience */}
        <div>
          <label className="block font-semibold text-lg mb-2">
            Station Audience <span className="text-red-500">*</span>
          </label>
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" endContent={<ChevronDownIcon />} className="w-full md:w-auto">
                {form.audienceIds.length > 0
                  ? audiences
                    .filter((audience) => form.audienceIds.includes(audience.id))
                    .map((audience) => audience.name)
                    .join(", ")
                  : "Select Audience"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              closeOnSelect={false}
              selectedKeys={form.audienceIds.map(String)}
              selectionMode="multiple"
              variant="flat"
              onSelectionChange={(keys) => {
                const selected = Array.from(keys as Set<string>).map(Number);
                updateField("audienceIds", selected);
              }}
            >
              {audiences.map((audience) => (
                <DropdownItem key={audience.id}>{audience.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          {errors.audiences && <p className="text-red-500 text-sm mt-1">{errors.audiences}</p>}
        </div>

        {/* Station Types */}
        <div>
          <label className="block font-semibold text-lg mb-2">
            Station Types <span className="text-red-500">*</span>
          </label>
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" endContent={<ChevronDownIcon />} className="w-full md:w-auto">
                {form.typeIds.length > 0
                  ? types
                    .filter((type) => form.typeIds.includes(type.id))
                    .map((type) => type.name)
                    .join(", ")
                  : "Select Types"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              closeOnSelect={false}
              selectedKeys={form.typeIds.map(String)}
              selectionMode="multiple"
              variant="flat"
              onSelectionChange={(keys) => {
                const selected = Array.from(keys as Set<string>).map(Number);
                updateField("typeIds", selected);
              }}
            >
              {types.map((type) => (
                <DropdownItem key={type.id}>{type.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          {errors.types && <p className="text-red-500 text-sm mt-1">{errors.types}</p>}
        </div>

        {/* Products */}
        <div>
          <label className="block font-semibold text-lg mb-3">
            Products & Inventory <span className="text-red-500">*</span>
          </label>
          {errors.products && <p className="text-red-500 text-sm mb-3">{errors.products}</p>}
          <div className="space-y-4">
            {products.map((product) => {
              const selected = form.products.find((sp) => sp.productId === product.id);

              return (
                <div
                  key={product.id}
                  className={`border-2 p-4 rounded-lg transition-all ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!selected}
                        onChange={() => toggleProduct(product)}
                        className="w-5 h-5 cursor-pointer"
                      />
                      <span className="font-medium text-lg">{product.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Default: ₹{product.defaultRateMonth?.toLocaleString() || 0}/mo | ₹
                      {product.defaultRateDay?.toLocaleString() || 0}/day
                    </div>
                  </div>

                  {selected && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t">
                      <div>
                        <label className="block text-sm font-medium mb-1">Units *</label>
                        <input
                          type="number"
                          min="0"
                          className="border-2 rounded-md p-2 w-full focus:border-blue-500 focus:outline-none"
                          placeholder="e.g., 10"
                          value={selected.units}
                          onChange={(e) => updateStationProduct(product.id, "units", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Monthly Rate (₹)</label>
                        <input
                          type="number"
                          min="0"
                          className="border-2 rounded-md p-2 w-full focus:border-blue-500 focus:outline-none"
                          placeholder="e.g., 45000"
                          value={selected.rateMonth}
                          onChange={(e) =>
                            updateStationProduct(product.id, "rateMonth", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Daily Rate (₹)</label>
                        <input
                          type="number"
                          min="0"
                          className="border-2 rounded-md p-2 w-full focus:border-blue-500 focus:outline-none"
                          placeholder="e.g., 1500"
                          value={selected.rateDay}
                          onChange={(e) =>
                            updateStationProduct(product.id, "rateDay", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-6">
          <Button
            color="primary"
            size="lg"
            onPress={submitData}
            isLoading={submitting}
            className="px-8"
          >
            {submitting ? "Updating Station..." : "Update Station"}
          </Button>
          <Button
            variant="bordered"
            size="lg"
            onPress={() => (window.location.href = "/catalogue")}
            isDisabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}