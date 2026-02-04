"use client";

import { useState, useEffect } from "react";
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

export default function AddStationPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [audiences, setAudiences] = useState<StationAudience[]>([]);
  const [types, setTypes] = useState<StationType[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    footfall: "",
    totalInventory: "",
    images: [""],
    lineIds: [] as number[],
    audienceIds: [] as number[],
    typeIds: [] as number[],
    products: [] as StationProductInput[],
  });

  useEffect(() => {
    async function fetchData() {
      const [l, p, a, t] = await Promise.all([
        fetch("/api/lines").then((r) => r.json()),
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/stations/audiences").then((r) => r.json()),
        fetch("/api/stations/types").then((r) => r.json()),
      ]);

      setLines(l);
      setProducts(p);
      setAudiences(a);
      setTypes(t);
      setLoading(false);
    }
    fetchData();
  }, []);

  const updateImage = (index: number, value: string) => {
    const images = [...form.images];
    images[index] = value;
    setForm({ ...form, images });
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const addImageField = () => {
    setForm({ ...form, images: [...form.images, ""] });
  };

  const removeImageField = (index: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const toggleProduct = (product: Product) => {
    const exists = form.products.find((p) => p.productId === product.id);

    if (exists) {
      setForm({
        ...form,
        products: form.products.filter((p) => p.productId !== product.id),
      });
    } else {
      setForm({
        ...form,
        products: [
          ...form.products,
          {
            productId: product.id,
            units: 0,
            rateMonth: product.defaultRateMonth ?? 0,
            rateDay: product.defaultRateDay ?? 0,
          },
        ],
      });
    }
  };

  const updateStationProduct = (
    productId: number,
    key: keyof StationProductInput,
    value: string
  ) => {
    const updated = form.products.map((p) =>
      p.productId === productId ? { ...p, [key]: Number(value) } : p
    );
    setForm({ ...form, products: updated });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "Station name is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.latitude.trim()) newErrors.latitude = "Latitude is required";
    if (!form.longitude.trim()) newErrors.longitude = "Longitude is required";
    if (!form.footfall.trim()) newErrors.footfall = "Footfall is required";

    if (form.images.some((img) => !img.trim()))
      newErrors.images = "All image URLs must be filled";

    if (form.lineIds.length === 0) newErrors.lines = "Select at least one line";

    if (form.audienceIds.length === 0)
      newErrors.audiences = "Select at least one station audience";

    if (form.typeIds.length === 0)
      newErrors.types = "Select at least one station type";

    if (form.products.length === 0)
      newErrors.products = "Select at least one product";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitData = async () => {
    if (!validateForm()) return;

    // ✅ Calculate total inventory as sum of all selected product units
    const totalInventory = form.products.reduce(
      (sum, p) => sum + (Number(p.units) || 0),
      0
    );

    const payload = {
      ...form,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      totalInventory,
    };

    const res = await fetch("/api/stations/add", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Station Added Successfully");
      window.location.href = "/stations";
    } else {
      alert("Error while submitting");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        <Spinner size="lg" color="danger" variant="gradient" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Add New Station</h1>
      {/* Station Name */}
      <Input
        label="Station Name"
        placeholder="Enter name"
        variant="bordered"
        radius="md"
        value={form.name}
        isInvalid={!!errors.name}
        errorMessage={errors.name}
        onValueChange={(value) => {
          setForm({ ...form, name: value });
          setErrors((prev) => ({ ...prev, name: "" }));
        }}
        labelPlacement="outside-top"
      />
      {/* Description */}
      <Textarea
        label="Description"
        placeholder="Enter Description"
        variant="bordered"
        radius="md"
        value={form.description}
        isInvalid={!!errors.description}
        errorMessage={errors.description}
        onValueChange={(value) => {
          setForm({ ...form, description: value });
          setErrors((prev) => ({ ...prev, description: "" }));
        }}
        labelPlacement="outside-top"
      />
      {/* Address */}
      <Input
        label="Address"
        placeholder="Enter address"
        variant="bordered"
        radius="md"
        value={form.address}
        isInvalid={!!errors.address}
        errorMessage={errors.address}
        onValueChange={(value) => {
          setForm({ ...form, address: value });
          setErrors((prev) => ({ ...prev, address: "" }));
        }}
        labelPlacement="outside-top"
      />
      {/* Latitude */}
      <Input
        label="Latitude"
        placeholder="Enter latitude"
        variant="bordered"
        radius="md"
        value={form.latitude}
        isInvalid={!!errors.latitude}
        errorMessage={errors.latitude}
        onValueChange={(value) => {
          setForm({ ...form, latitude: value });
          setErrors((prev) => ({ ...prev, latitude: "" }));
        }}
        labelPlacement="outside-top"
      />
      {/* Longitude */}
      <Input
        label="Longitude"
        placeholder="Enter longitude"
        variant="bordered"
        radius="md"
        value={form.longitude}
        isInvalid={!!errors.longitude}
        errorMessage={errors.longitude}
        onValueChange={(value) => {
          setForm({ ...form, longitude: value });
          setErrors((prev) => ({ ...prev, longitude: "" }));
        }}
        labelPlacement="outside-top"
      />
      {/* Footfall */}
      <Input
        label="Footfall"
        placeholder="Enter footfall"
        variant="bordered"
        radius="md"
        value={form.footfall}
        isInvalid={!!errors.footfall}
        errorMessage={errors.footfall}
        onValueChange={(value) => {
          setForm({ ...form, footfall: value });
          setErrors((prev) => ({ ...prev, footfall: "" }));
        }}
        labelPlacement="outside-top"
      />
      {/* Images */}
      <label className="font-semibold text-lg">Images</label>
      {form.images.map((img, index) => (
        <Input
          key={index}
          classNames={{ base: "mb-2", input: "p-1 text-md", label: "text-md" }}
          defaultValue=""
          label={
            <div className="flex justify-between items-center">
              <span>Image Url {index + 1}</span>{" "}
              <Button
                onPress={() => removeImageField(index)}
                size="sm"
                color="danger"
              >
                Remove{" "}
              </Button>{" "}
            </div>
          }
          placeholder="Enter image url"
          variant="bordered"
          radius="md"
          value={img}
          onValueChange={(value) => updateImage(index, value)}
          labelPlacement="outside-top"
          type="text"
          isInvalid={!!errors.images}
          errorMessage={index === form.images.length - 1 ? errors.images : ""}
        />
      ))}{" "}
      <Button
        className="text-white mt-3"
        onPress={addImageField}
        color="success"
      >
        + Add More Images
      </Button>
      {/* Lines */}
      <label className="block mt-4 mb-2 font-medium">Lines</label>
      <div className="flex w-full gap-5 items-center">
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" endContent={<ChevronDownIcon />}>
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
              const selected = Array.from(keys as Set<string>);
              setForm({
                ...form,
                lineIds: selected.map(Number),
              });
              setErrors({ ...errors, lines: "" });
            }}
          >
            {lines.map((line) => (
              <DropdownItem key={line.id}>{line.name}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
      {errors.lines && (
        <p className="text-red-500 text-sm mt-1">{errors.lines}</p>
      )}
      {/* Audience */}
      <label className="block mt-4 mb-2 font-medium">Station Audience</label>
      <div className="flex w-full gap-5 items-center">
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" endContent={<ChevronDownIcon />}>
              {form.audienceIds.length > 0
                ? audiences
                    .filter((audience) =>
                      form.audienceIds.includes(audience.id)
                    )
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
              const selected = Array.from(keys as Set<string>);
              setForm({
                ...form,
                audienceIds: selected.map(Number),
              });
              setErrors({ ...errors, audiences: "" });
            }}
          >
            {audiences.map((audience) => (
              <DropdownItem key={audience.id}>{audience.name}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
      {errors.audiences && (
        <p className="text-red-500 text-sm mt-1">{errors.audiences}</p>
      )}
      {/* Lines */}
      <label className="block mt-4 mb-2 font-medium">Station Types</label>
      <div className="flex w-full gap-5 items-center">
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" endContent={<ChevronDownIcon />}>
              {form.typeIds.length > 0
                ? types
                    .filter((type) => form.typeIds.includes(type.id))
                    .map((type) => type.name)
                    .join(", ")
                : "Select Type"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            closeOnSelect={false}
            selectedKeys={form.typeIds.map(String)}
            selectionMode="multiple"
            variant="flat"
            onSelectionChange={(keys) => {
              const selected = Array.from(keys as Set<string>);
              setForm({
                ...form,
                typeIds: selected.map(Number),
              });
              setErrors({ ...errors, types: "" });
            }}
          >
            {types.map((type) => (
              <DropdownItem key={type.id}>{type.name}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
      {errors.types && (
        <p className="text-red-500 text-sm mt-1">{errors.types}</p>
      )}
      {/* Products */}
      <label className="block mt-4 mb-2 font-medium">Products</label>
      {errors.products && (
        <p className="text-red-500 text-sm mb-2">{errors.products}</p>
      )}
      <div className="space-y-4">
        {products.map((p) => {
          const selected = form.products.find((sp) => sp.productId === p.id);

          return (
            <div
              key={p.id}
              className="border p-4 rounded-lg shadow-sm bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{p.name}</span>
                <input
                  type="checkbox"
                  checked={!!selected}
                  onChange={() => {
                    toggleProduct(p);
                    setErrors({ ...errors, products: "" });
                  }}
                />
              </div>

              {selected && (
                <div className="mt-3 grid grid-cols-3 gap-4">
                  <div>
                    <label>Units</label>
                    <input
                      type="number"
                      className="border p-2 w-full"
                      placeholder="Units"
                      value={selected.units}
                      onChange={(e) =>
                        updateStationProduct(p.id, "units", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label>Monthly Rate</label>
                    <input
                      type="number"
                      className="border p-2 w-full"
                      placeholder="Monthly Rate"
                      value={selected.rateMonth}
                      onChange={(e) =>
                        updateStationProduct(p.id, "rateMonth", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label>Daily Rate</label>
                    <input
                      type="number"
                      className="border p-2 w-full"
                      placeholder="Daily Rate"
                      value={selected.rateDay}
                      onChange={(e) =>
                        updateStationProduct(p.id, "rateDay", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button
        onClick={submitData}
        className="mt-6 bg-blue-500 text-white px-6 py-2 rounded cursor-pointer hover:bg-blue-600"
      >
        Submit
      </button>
    </div>
  );
}
