"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownTrigger,
  Chip,
  Pagination,
  Spinner,
  Tabs,
  Tab,
} from "@heroui/react";

import {
  SearchIcon,
  ChevronDownIcon,
  VerticalDotsIcon,
  PlusIcon,
} from "@/components/Icons";
import Link from "next/link";

/* ---------------- TYPES ---------------- */

interface Station {
  id: number;
  name: string;
  address: string;
  footfall: number;
  totalInventory: number;
  totalPrice?: number;
  lines: Line[];
}

interface Line {
  id: number;
  name: string;
  color: string;
}

interface Product {
  id: number;
  name: string;
  thumbnail: string;
  defaultRateMonth: number;
  defaultRateDay: number;
}

interface SimpleEntity {
  id: number;
  name: string;
}

/* ---------------- COLUMNS ---------------- */

const stationColumns = [
  { name: "ID", uid: "id" },
  { name: "NAME", uid: "name" },
  { name: "LINES", uid: "lines" },
  { name: "ADDRESS", uid: "address" },
  { name: "FOOTFALL", uid: "footfall" },
  { name: "TOTAL INVENTORY", uid: "totalInventory" },
  { name: "TOTAL PRICE", uid: "totalPrice" },
  { name: "ACTIONS", uid: "actions" },
];

const lineColumns = [
  { name: "ID", uid: "id" },
  { name: "NAME", uid: "name" },
  { name: "COLOR", uid: "color" },
  { name: "ACTIONS", uid: "actions" },
];

const productColumns = [
  { name: "ID", uid: "id" },
  { name: "THUMBNAIL", uid: "thumbnail" },
  { name: "NAME", uid: "name" },
  { name: "RATE / MONTH", uid: "defaultRateMonth" },
  { name: "RATE / DAY", uid: "defaultRateDay" },
  { name: "ACTIONS", uid: "actions" },
];

const simpleColumns = [
  { name: "ID", uid: "id" },
  { name: "NAME", uid: "name" },
  { name: "ACTIONS", uid: "actions" },
];

/* ---------------- COLORS ---------------- */

const lineColorMap: Record<string, any> = {
  Yellow: "warning",
  Blue: "primary",
  Red: "danger",
  Green: "success",
  Magenta: "secondary",
  Violet: "secondary",
  Pink: "secondary",
  "Airport Express": "default",
};

/* ---------------- COMPONENT ---------------- */

export default function StationsPage() {
  /* -------- STATIONS STATE -------- */
  const [stations, setStations] = useState<Station[]>([]);
  const [stationSearch, setStationSearch] = useState("");
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set());
  const [stationPage, setStationPage] = useState(1);

  /* -------- LINES STATE -------- */
  const [lines, setLines] = useState<Line[]>([]);
  const [lineSearch, setLineSearch] = useState("");
  const [linePage, setLinePage] = useState(1);

  /* -------- ADD/EDIT LINE MODAL STATE -------- */
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<Line | null>(null);
  const [lineFormData, setLineFormData] = useState({ name: "", color: "" });
  const [submittingLine, setSubmittingLine] = useState(false);

  /* -------- AUDIENCES STATE -------- */
  const [audiences, setAudiences] = useState<SimpleEntity[]>([]);
  const [audienceSearch, setAudienceSearch] = useState("");
  const [audiencePage, setAudiencePage] = useState(1);

  /* -------- ADD/EDIT AUDIENCE MODAL STATE -------- */
  const [isAudienceModalOpen, setIsAudienceModalOpen] = useState(false);
  const [editingAudience, setEditingAudience] = useState<SimpleEntity | null>(null);
  const [audienceFormData, setAudienceFormData] = useState({ name: "" });
  const [submittingAudience, setSubmittingAudience] = useState(false);

  /* -------- TYPES STATE -------- */
  const [types, setTypes] = useState<SimpleEntity[]>([]);
  const [typeSearch, setTypeSearch] = useState("");
  const [typePage, setTypePage] = useState(1);

  /* -------- ADD/EDIT TYPE MODAL STATE -------- */
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<SimpleEntity | null>(null);
  const [typeFormData, setTypeFormData] = useState({ name: "" });
  const [submittingType, setSubmittingType] = useState(false);

  /* -------- PRODUCTS STATE -------- */
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(1);

  /* -------- ADD/EDIT PRODUCT MODAL STATE -------- */
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: "",
    thumbnail: "",
    rateMonth: "",
    rateDay: "",
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);

  const [loading, setLoading] = useState(true);

  const rowsPerPage = 10;

  /* ---------------- FETCH DATA ---------------- */

  const fetchLines = useCallback(async () => {
    const res = await fetch("/api/lines");
    const data = await res.json();
    setLines([...data].sort((a, b) => a.id - b.id));
  }, []);

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts([...data].sort((a, b) => a.id - b.id));
  }, []);

  const fetchAudiences = useCallback(async () => {
    const res = await fetch("/api/stations/audiences");
    const data = await res.json();
    setAudiences(data);
  }, []);

  const fetchTypes = useCallback(async () => {
    const res = await fetch("/api/stations/types");
    const data = await res.json();
    setTypes(data);
  }, []);

  const fetchStations = useCallback(async () => {
    const res = await fetch("/api/stations");
    const data = await res.json();
    setStations(data);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/stations").then((res) => res.json()),
      fetch("/api/lines").then((res) => res.json()),
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/stations/audiences").then((res) => res.json()),
      fetch("/api/stations/types").then((res) => res.json()),
    ])
      .then(([stationsData, linesData, productsData, audiencesData, typesData]) => {
        const sortedLines = [...linesData].sort((a, b) => a.id - b.id);
        const sortedProducts = [...productsData].sort((a, b) => a.id - b.id);
        setStations(stationsData);
        setLines(sortedLines);
        setProducts(sortedProducts);
        setSelectedLines(new Set(sortedLines.map((l) => l.name)));
        setAudiences(audiencesData);
        setTypes(typesData);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---------------- LINE HANDLERS ---------------- */

  const openAddLineModal = () => {
    setEditingLine(null);
    setLineFormData({ name: "", color: "" });
    setIsLineModalOpen(true);
  };

  const openEditLineModal = (line: Line) => {
    setEditingLine(line);
    setLineFormData({ name: line.name, color: line.color || "" });
    setIsLineModalOpen(true);
  };

  const handleLineSubmit = async () => {
    if (!lineFormData.name.trim()) {
      alert("Line name is required");
      return;
    }

    try {
      setSubmittingLine(true);

      const method = editingLine ? "PUT" : "POST";
      const url = editingLine ? `/api/lines/${editingLine.id}` : "/api/lines";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lineFormData.name.trim(),
          color: lineFormData.color || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || `Failed to ${editingLine ? "update" : "add"} line`);
        return;
      }

      setIsLineModalOpen(false);
      await fetchLines();
    } catch (e) {
      console.error("Line operation failed:", e);
      alert("Something went wrong");
    } finally {
      setSubmittingLine(false);
    }
  };

  const handleDeleteLine = async (id: number) => {
    if (!confirm("Are you sure you want to delete this line?")) return;

    try {
      const res = await fetch(`/api/lines/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to delete line");
        return;
      }
      await fetchLines();
    } catch (e) {
      console.error("Delete line failed:", e);
      alert("Something went wrong");
    }
  };

  /* ---------------- PRODUCT HANDLERS ---------------- */

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductFormData({ name: "", thumbnail: "", rateMonth: "", rateDay: "" });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      thumbnail: product.thumbnail || "",
      rateMonth: product.defaultRateMonth?.toString() || "",
      rateDay: product.defaultRateDay?.toString() || "",
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async () => {
    if (!productFormData.name.trim()) {
      alert("Product name is required");
      return;
    }

    try {
      setSubmittingProduct(true);

      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productFormData.name.trim(),
          thumbnail: productFormData.thumbnail || null,
          defaultRateMonth: productFormData.rateMonth ? parseFloat(productFormData.rateMonth) : null,
          defaultRateDay: productFormData.rateDay ? parseFloat(productFormData.rateDay) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || `Failed to ${editingProduct ? "update" : "add"} product`);
        return;
      }

      setIsProductModalOpen(false);
      await fetchProducts();
    } catch (e) {
      console.error("Product operation failed:", e);
      alert("Something went wrong");
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to delete product");
        return;
      }
      await fetchProducts();
    } catch (e) {
      console.error("Delete product failed:", e);
      alert("Something went wrong");
    }
  };

  /* ---------------- AUDIENCE HANDLERS ---------------- */

  const openAddAudienceModal = () => {
    setEditingAudience(null);
    setAudienceFormData({ name: "" });
    setIsAudienceModalOpen(true);
  };

  const openEditAudienceModal = (audience: SimpleEntity) => {
    setEditingAudience(audience);
    setAudienceFormData({ name: audience.name });
    setIsAudienceModalOpen(true);
  };

  const handleAudienceSubmit = async () => {
    if (!audienceFormData.name.trim()) {
      alert("Audience name is required");
      return;
    }

    try {
      setSubmittingAudience(true);

      const method = editingAudience ? "PUT" : "POST";
      const url = editingAudience
        ? `/api/stations/audiences/${editingAudience.id}`
        : "/api/stations/audiences";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: audienceFormData.name.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || `Failed to ${editingAudience ? "update" : "add"} audience`);
        return;
      }

      setIsAudienceModalOpen(false);
      await fetchAudiences();
    } catch (e) {
      console.error("Audience operation failed:", e);
      alert("Something went wrong");
    } finally {
      setSubmittingAudience(false);
    }
  };

  const handleDeleteAudience = async (id: number) => {
    if (!confirm("Are you sure you want to delete this audience?")) return;

    try {
      const res = await fetch(`/api/stations/audiences/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to delete audience");
        return;
      }
      await fetchAudiences();
    } catch (e) {
      console.error("Delete audience failed:", e);
      alert("Something went wrong");
    }
  };

  /* ---------------- TYPE HANDLERS ---------------- */

  const openAddTypeModal = () => {
    setEditingType(null);
    setTypeFormData({ name: "" });
    setIsTypeModalOpen(true);
  };

  const openEditTypeModal = (type: SimpleEntity) => {
    setEditingType(type);
    setTypeFormData({ name: type.name });
    setIsTypeModalOpen(true);
  };

  const handleTypeSubmit = async () => {
    if (!typeFormData.name.trim()) {
      alert("Type name is required");
      return;
    }

    try {
      setSubmittingType(true);

      const method = editingType ? "PUT" : "POST";
      const url = editingType
        ? `/api/stations/types/${editingType.id}`
        : "/api/stations/types";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: typeFormData.name.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || `Failed to ${editingType ? "update" : "add"} type`);
        return;
      }

      setIsTypeModalOpen(false);
      await fetchTypes();
    } catch (e) {
      console.error("Type operation failed:", e);
      alert("Something went wrong");
    } finally {
      setSubmittingType(false);
    }
  };

  const handleDeleteType = async (id: number) => {
    if (!confirm("Are you sure you want to delete this type?")) return;

    try {
      const res = await fetch(`/api/stations/types/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to delete type");
        return;
      }
      await fetchTypes();
    } catch (e) {
      console.error("Delete type failed:", e);
      alert("Something went wrong");
    }
  };

  /* ---------------- STATION HANDLERS ---------------- */

  const handleEditStation = (id: number) => {
    window.location.href = `/cms/edit/${id}`;
  };

  const handleDeleteStation = async (id: number) => {
    if (!confirm("Are you sure you want to delete this station? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/station/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to delete station");
        return;
      }
      await fetchStations();
      alert("Station deleted successfully");
    } catch (e) {
      console.error("Delete station failed:", e);
      alert("Something went wrong while deleting the station");
    }
  };

  /* ---------------- FILTERED DATA ---------------- */

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
        s.address.toLowerCase().includes(stationSearch.toLowerCase());
      const matchesLines =
        selectedLines.size === 0 || s.lines.some((l) => selectedLines.has(l.name));
      return matchesSearch && matchesLines;
    });
  }, [stations, stationSearch, selectedLines]);

  const filteredLines = useMemo(() => {
    return lines.filter((l) => l.name.toLowerCase().includes(lineSearch.toLowerCase()));
  }, [lines, lineSearch]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()));
  }, [products, productSearch]);

  const filteredAudiences = useMemo(() => {
    return audiences.filter((a) => a.name.toLowerCase().includes(audienceSearch.toLowerCase()));
  }, [audiences, audienceSearch]);

  const filteredTypes = useMemo(() => {
    return types.filter((t) => t.name.toLowerCase().includes(typeSearch.toLowerCase()));
  }, [types, typeSearch]);

  /* ---------------- RENDER CELLS ---------------- */

  const renderStationCell = useCallback((station: Station, columnKey: string) => {
    switch (columnKey) {
      case "id":
        return station.id;
      case "name":
        return station.name;
      case "lines":
        return (
          <div className="flex gap-1 flex-wrap">
            {station.lines.map((line) => (
              <Chip key={line.id} color={lineColorMap[line.name] || "default"} size="sm">
                {line.name}
              </Chip>
            ))}
          </div>
        );
      case "address":
        return station.address;
      case "footfall":
        return station.footfall?.toLocaleString() ?? "—";
      case "totalInventory":
        return station.totalInventory ?? "—";
      case "totalPrice":
        return station.totalPrice ? `₹${station.totalPrice.toLocaleString()}` : "—";
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Link href={`/station/${station.id}`}>
              <Button size="sm" color="primary" variant="light">
                View
              </Button>
            </Link>
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <VerticalDotsIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Station Actions">
                {/* <DropdownItem key="edit" onClick={() => handleEditStation(station.id)}>
                  Edit
                </DropdownItem> */}
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  onClick={() => handleDeleteStation(station.id)}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return null;
    }
  }, []);

  const renderLineCell = useCallback((line: Line, columnKey: string) => {
    switch (columnKey) {
      case "id":
        return line.id;
      case "name":
        return line.name;
      case "color":
        return line.color ? (
          <Chip color={lineColorMap[line.name] || "default"} size="sm">
            {line.color}
          </Chip>
        ) : (
          "—"
        );
      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <VerticalDotsIcon />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Line Actions">
              <DropdownItem key="edit" onClick={() => openEditLineModal(line)}>
                Edit
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                onClick={() => handleDeleteLine(line.id)}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return null;
    }
  }, []);

  const renderProductCell = useCallback((product: Product, columnKey: string) => {
    switch (columnKey) {
      case "id":
        return product.id;
      case "thumbnail":
        return product.thumbnail ? (
          <img src={product.thumbnail} alt={product.name} className="w-12 h-12 object-cover rounded" />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded" />
        );
      case "name":
        return product.name;
      case "defaultRateMonth":
        return product.defaultRateMonth ? `₹${product.defaultRateMonth.toLocaleString()}` : "—";
      case "defaultRateDay":
        return product.defaultRateDay ? `₹${product.defaultRateDay.toLocaleString()}` : "—";
      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <VerticalDotsIcon />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Product Actions">
              <DropdownItem key="edit" onClick={() => openEditProductModal(product)}>
                Edit
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                onClick={() => handleDeleteProduct(product.id)}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return null;
    }
  }, []);

  const renderSimpleCell = useCallback(
    (item: SimpleEntity, columnKey: string, type: "audiences" | "types") => {
      switch (columnKey) {
        case "id":
          return item.id;
        case "name":
          return item.name;
        case "actions":
          return (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <VerticalDotsIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label={`${type} Actions`}>
                <DropdownItem
                  key="edit"
                  onClick={() =>
                    type === "audiences" ? openEditAudienceModal(item) : openEditTypeModal(item)
                  }
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  onClick={() =>
                    type === "audiences" ? handleDeleteAudience(item.id) : handleDeleteType(item.id)
                  }
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          );
        default:
          return null;
      }
    },
    []
  );

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Tabs aria-label="Options" color="primary" variant="underlined">
        {/* STATIONS TAB */}
        <Tab key="stations" title="Stations">
          <div className="flex justify-between mt-6 mb-4 gap-4">
            <Input
              isClearable
              className="w-1/3"
              placeholder="Search by name or address..."
              startContent={<SearchIcon />}
              value={stationSearch}
              onValueChange={(v) => {
                setStationSearch(v ?? "");
                setStationPage(1);
              }}
            />
            <div className="flex gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button endContent={<ChevronDownIcon />} variant="flat">
                    Lines: {selectedLines.size === lines.length ? "All" : selectedLines.size}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Filter by lines"
                  closeOnSelect={false}
                  disallowEmptySelection
                  selectedKeys={selectedLines}
                  selectionMode="multiple"
                  onSelectionChange={(keys) => {
                    setSelectedLines(keys as Set<string>);
                    setStationPage(1);
                  }}
                >
                  {lines.map((line) => (
                    <DropdownItem key={line.name}>{line.name}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Link href="/cms/add">
                <Button color="primary" endContent={<PlusIcon />}>
                  Add Station
                </Button>
              </Link>
            </div>
          </div>

          <Table
            isStriped
            bottomContent={
              <Pagination
                page={stationPage}
                total={Math.ceil(filteredStations.length / rowsPerPage)}
                onChange={setStationPage}
                showControls
              />
            }
          >
            <TableHeader columns={stationColumns}>
              {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
            </TableHeader>
            <TableBody
              items={filteredStations.slice(
                (stationPage - 1) * rowsPerPage,
                stationPage * rowsPerPage
              )}
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderStationCell(item, columnKey as string)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Tab>

        {/* LINES TAB */}
        <Tab key="lines" title="Lines">
          <div className="flex justify-between mt-6 mb-4">
            <Input
              isClearable
              className="w-1/3"
              placeholder="Search line..."
              startContent={<SearchIcon />}
              value={lineSearch}
              onValueChange={(v) => {
                setLineSearch(v ?? "");
                setLinePage(1);
              }}
            />
            <Button color="primary" endContent={<PlusIcon />} onClick={openAddLineModal}>
              Add Line
            </Button>
          </div>

          <Table
            isStriped
            bottomContent={
              <Pagination
                page={linePage}
                total={Math.ceil(filteredLines.length / rowsPerPage)}
                onChange={setLinePage}
                showControls
              />
            }
          >
            <TableHeader columns={lineColumns}>
              {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
            </TableHeader>
            <TableBody
              items={filteredLines.slice((linePage - 1) * rowsPerPage, linePage * rowsPerPage)}
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => <TableCell>{renderLineCell(item, columnKey as string)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Tab>

        {/* PRODUCTS TAB */}
        <Tab key="products" title="Products">
          <div className="flex justify-between mt-6 mb-4">
            <Input
              isClearable
              className="w-1/3"
              placeholder="Search product..."
              startContent={<SearchIcon />}
              value={productSearch}
              onValueChange={(v) => {
                setProductSearch(v ?? "");
                setProductPage(1);
              }}
            />
            <Button color="primary" endContent={<PlusIcon />} onClick={openAddProductModal}>
              Add Product
            </Button>
          </div>

          <Table
            isStriped
            bottomContent={
              <Pagination
                page={productPage}
                total={Math.ceil(filteredProducts.length / rowsPerPage)}
                onChange={setProductPage}
                showControls
              />
            }
          >
            <TableHeader columns={productColumns}>
              {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
            </TableHeader>
            <TableBody
              items={filteredProducts.slice(
                (productPage - 1) * rowsPerPage,
                productPage * rowsPerPage
              )}
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderProductCell(item, columnKey as string)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Tab>

        {/* AUDIENCES TAB */}
        <Tab key="audiences" title="Station Audiences">
          <div className="flex justify-between mt-6 mb-4">
            <Input
              isClearable
              className="w-1/3"
              placeholder="Search audience..."
              startContent={<SearchIcon />}
              value={audienceSearch}
              onValueChange={(v) => {
                setAudienceSearch(v ?? "");
                setAudiencePage(1);
              }}
            />
            <Button color="primary" endContent={<PlusIcon />} onClick={openAddAudienceModal}>
              Add Audience
            </Button>
          </div>

          <Table
            isStriped
            bottomContent={
              <Pagination
                page={audiencePage}
                total={Math.ceil(filteredAudiences.length / rowsPerPage)}
                onChange={setAudiencePage}
                showControls
              />
            }
          >
            <TableHeader columns={simpleColumns}>
              {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
            </TableHeader>
            <TableBody
              items={filteredAudiences.slice(
                (audiencePage - 1) * rowsPerPage,
                audiencePage * rowsPerPage
              )}
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderSimpleCell(item, columnKey as any, "audiences")}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Tab>

        {/* TYPES TAB */}
        <Tab key="types" title="Station Types">
          <div className="flex justify-between mt-6 mb-4">
            <Input
              isClearable
              className="w-1/3"
              placeholder="Search type..."
              startContent={<SearchIcon />}
              value={typeSearch}
              onValueChange={(v) => {
                setTypeSearch(v ?? "");
                setTypePage(1);
              }}
            />
            <Button color="primary" endContent={<PlusIcon />} onClick={openAddTypeModal}>
              Add Type
            </Button>
          </div>

          <Table
            isStriped
            bottomContent={
              <Pagination
                page={typePage}
                total={Math.ceil(filteredTypes.length / rowsPerPage)}
                onChange={setTypePage}
                showControls
              />
            }
          >
            <TableHeader columns={simpleColumns}>
              {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
            </TableHeader>
            <TableBody
              items={filteredTypes.slice((typePage - 1) * rowsPerPage, typePage * rowsPerPage)}
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderSimpleCell(item, columnKey as any, "types")}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Tab>
      </Tabs>

      {/* ---------------- LINE MODAL ---------------- */}
      {isLineModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[420px]">
            <h2 className="text-lg font-semibold mb-4">
              {editingLine ? "Edit Line" : "Add New Line"}
            </h2>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Line Name *</label>
              <input
                value={lineFormData.name}
                onChange={(e) => setLineFormData({ ...lineFormData, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter line name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Color (optional)</label>
              <input
                value={lineFormData.color}
                onChange={(e) => setLineFormData({ ...lineFormData, color: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="#00FF00 or green"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="light" onClick={() => setIsLineModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" isLoading={submittingLine} onClick={handleLineSubmit}>
                {editingLine ? "Update" : "Add"} Line
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- PRODUCT MODAL ---------------- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[460px]">
            <h2 className="text-lg font-semibold mb-4">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input
                value={productFormData.name}
                onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter product name"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Thumbnail URL (optional)</label>
              <input
                value={productFormData.thumbnail}
                onChange={(e) =>
                  setProductFormData({ ...productFormData, thumbnail: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="https://..."
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Rate / Month (₹)</label>
              <input
                type="number"
                value={productFormData.rateMonth}
                onChange={(e) =>
                  setProductFormData({ ...productFormData, rateMonth: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="45000"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-1">Rate / Day (₹)</label>
              <input
                type="number"
                value={productFormData.rateDay}
                onChange={(e) =>
                  setProductFormData({ ...productFormData, rateDay: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="1500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="light" onClick={() => setIsProductModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" isLoading={submittingProduct} onClick={handleProductSubmit}>
                {editingProduct ? "Update" : "Add"} Product
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- AUDIENCE MODAL ---------------- */}
      {isAudienceModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[420px]">
            <h2 className="text-lg font-semibold mb-4">
              {editingAudience ? "Edit Audience" : "Add New Audience"}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Audience Name *</label>
              <input
                value={audienceFormData.name}
                onChange={(e) => setAudienceFormData({ name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. Students, Business, Shoppers"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="light" onClick={() => setIsAudienceModalOpen(false)}>
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={submittingAudience}
                onClick={handleAudienceSubmit}
              >
                {editingAudience ? "Update" : "Add"} Audience
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TYPE MODAL ---------------- */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[420px]">
            <h2 className="text-lg font-semibold mb-4">
              {editingType ? "Edit Station Type" : "Add New Station Type"}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Type Name *</label>
              <input
                value={typeFormData.name}
                onChange={(e) => setTypeFormData({ name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. Interchange, Terminal, Underground"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="light" onClick={() => setIsTypeModalOpen(false)}>
                Cancel
              </Button>
              <Button color="primary" isLoading={submittingType} onClick={handleTypeSubmit}>
                {editingType ? "Update" : "Add"} Type
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}