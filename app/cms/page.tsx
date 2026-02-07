"use client";

import { useEffect, useMemo, useState } from "react";
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


  const [isAddLineOpen, setIsAddLineOpen] = useState(false);
  const [newLineName, setNewLineName] = useState("");
  const [newLineColor, setNewLineColor] = useState("");
  const [addingLine, setAddingLine] = useState(false);

  /* -------- AUDIENCES STATE -------- */
  const [audiences, setAudiences] = useState<any[]>([]);
  const [audienceSearch, setAudienceSearch] = useState("");
  const [audiencePage, setAudiencePage] = useState(1);

  /* -------- ADD AUDIENCE MODAL STATE -------- */
  const [isAddAudienceOpen, setIsAddAudienceOpen] = useState(false);
  const [newAudienceName, setNewAudienceName] = useState("");
  const [addingAudience, setAddingAudience] = useState(false);


  /* -------- TYPES STATE -------- */
  const [types, setTypes] = useState<any[]>([]);
  const [typeSearch, setTypeSearch] = useState("");
  const [typePage, setTypePage] = useState(1);

  /* -------- ADD TYPE MODAL STATE -------- */
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [addingType, setAddingType] = useState(false);


  /* -------- PRODUCTS STATE -------- */
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(1);


  /* -------- ADD PRODUCT MODAL STATE -------- */
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductThumbnail, setNewProductThumbnail] = useState("");
  const [newProductRateMonth, setNewProductRateMonth] = useState("");
  const [newProductRateDay, setNewProductRateDay] = useState("");
  const [addingProduct, setAddingProduct] = useState(false);

  const [loading, setLoading] = useState(true);

  const rowsPerPage = 10;

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    Promise.all([
      fetch("/api/stations").then((res) => res.json()),
      fetch("/api/lines").then((res) => res.json()),
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/stations/audiences").then((res) => res.json()),
      fetch("/api/stations/types").then((res) => res.json()),
    ])
      .then(
        ([stationsData, linesData, productsData, audiencesData, typesData]) => {
          const sortedLines = [...linesData].sort((a, b) => a.id - b.id);
          const sortedProducts = [...productsData].sort((a, b) => a.id - b.id);
          console.log({ stationsData, linesData, productsData });
          setStations(stationsData);
          setLines(sortedLines);
          setProducts(sortedProducts);
          setSelectedLines(new Set(sortedLines.map((l) => l.name)));
          setAudiences(audiencesData);
          setTypes(typesData);
        }
      )
      .finally(() => setLoading(false));
  }, []);


  const fetchLines = async () => {
    const res = await fetch("/api/lines");
    const data = await res.json();
    const sorted = [...data].sort((a, b) => a.id - b.id);
    setLines(sorted);
  };

  const handleAddLine = async () => {
    if (!newLineName.trim()) {
      alert("Line name is required");
      return;
    }

    try {
      setAddingLine(true);

      const res = await fetch("/api/lines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLineName.trim(),
          color: newLineColor || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to add line");
        return;
      }

      setNewLineName("");
      setNewLineColor("");
      setIsAddLineOpen(false);

      await fetchLines();
    } catch (e) {
      console.error("Add line failed:", e);
      alert("Something went wrong");
    } finally {
      setAddingLine(false);
    }
  };


  // for products

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    const sorted = [...data].sort((a, b) => a.id - b.id);
    setProducts(sorted);
  };


  const handleAddProduct = async () => {
    if (!newProductName.trim()) {
      alert("Product name is required");
      return;
    }

    try {
      setAddingProduct(true);

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProductName.trim(),
          thumbnail: newProductThumbnail || null,
          defaultRateMonth: newProductRateMonth
            ? Number(newProductRateMonth)
            : null,
          defaultRateDay: newProductRateDay
            ? Number(newProductRateDay)
            : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to add product");
        return;
      }

      // Reset + close
      setNewProductName("");
      setNewProductThumbnail("");
      setNewProductRateMonth("");
      setNewProductRateDay("");
      setIsAddProductOpen(false);

      await fetchProducts();
    } catch (e) {
      console.error("Add product failed:", e);
      alert("Something went wrong");
    } finally {
      setAddingProduct(false);
    }
  };



  // For Station Audience

  const fetchAudiences = async () => {
    const res = await fetch("/api/stations/audiences");
    const data = await res.json();
    setAudiences(data);
  };


  const handleAddAudience = async () => {
    if (!newAudienceName.trim()) {
      alert("Audience name is required");
      return;
    }

    try {
      setAddingAudience(true);

      const res = await fetch("/api/stations/audiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAudienceName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to add audience");
        return;
      }

      setNewAudienceName("");
      setIsAddAudienceOpen(false);

      await fetchAudiences();
    } catch (e) {
      console.error("Add audience failed:", e);
      alert("Something went wrong");
    } finally {
      setAddingAudience(false);
    }
  };

  // For Station Type 

  const fetchTypes = async () => {
    const res = await fetch("/api/stations/types");
    const data = await res.json();
    setTypes(data);
  };

  const handleAddType = async () => {
    if (!newTypeName.trim()) {
      alert("Type name is required");
      return;
    }

    try {
      setAddingType(true);

      const res = await fetch("/api/stations/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTypeName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to add type");
        return;
      }

      setNewTypeName("");
      setIsAddTypeOpen(false);

      await fetchTypes();
    } catch (e) {
      console.error("Add type failed:", e);
      alert("Something went wrong");
    } finally {
      setAddingType(false);
    }
  };



  /* ---------------- STATION FILTERING ---------------- */

  const filteredStations = useMemo(() => {
    let items = [...stations];

    if (stationSearch) {
      items = items.filter((s) =>
        s.name.toLowerCase().includes(stationSearch.toLowerCase())
      );
    }

    if (selectedLines.size) {
      items = items.filter((s) =>
        s.lines.some((l) => selectedLines.has(l.name))
      );
    }

    return items;
  }, [stations, stationSearch, selectedLines]);

  const stationPages = Math.ceil(filteredStations.length / rowsPerPage);

  const paginatedStations = useMemo(() => {
    const start = (stationPage - 1) * rowsPerPage;
    return filteredStations.slice(start, start + rowsPerPage);
  }, [filteredStations, stationPage]);

  /* ---------------- LINE FILTERING ---------------- */

  const filteredLines = useMemo(() => {
    let items = [...lines];

    if (lineSearch) {
      items = items.filter((l) =>
        l.name.toLowerCase().includes(lineSearch.toLowerCase())
      );
    }

    return items;
  }, [lines, lineSearch]);

  const linePages = Math.ceil(filteredLines.length / rowsPerPage);

  const paginatedLines = useMemo(() => {
    const start = (linePage - 1) * rowsPerPage;
    return filteredLines.slice(start, start + rowsPerPage);
  }, [filteredLines, linePage]);

  /* ---------------- PRODUCT FILTERING ---------------- */

  const filteredProducts = useMemo(() => {
    let items = [...products];

    if (productSearch) {
      items = items.filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
      );
    }

    return items;
  }, [products, productSearch]);

  const productPages = Math.ceil(filteredProducts.length / rowsPerPage);

  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * rowsPerPage;
    return filteredProducts.slice(start, start + rowsPerPage);
  }, [filteredProducts, productPage]);

  const filteredAudiences = useMemo(() => {
    return audienceSearch
      ? audiences.filter((a) =>
        a.name.toLowerCase().includes(audienceSearch.toLowerCase())
      )
      : audiences;
  }, [audiences, audienceSearch]);

  const filteredTypes = useMemo(() => {
    return typeSearch
      ? types.filter((t) =>
        t.name.toLowerCase().includes(typeSearch.toLowerCase())
      )
      : types;
  }, [types, typeSearch]);

  /* ---------------- RENDERERS ---------------- */

  const renderStationCell = (
    item: Station,
    columnKey: keyof Station | "actions"
  ) => {
    switch (columnKey) {
      case "lines":
        return (
          <div className="flex gap-1 flex-wrap">
            {item.lines.map((line) => (
              <Chip
                key={line.id}
                size="sm"
                style={{ backgroundColor: line.color, color: "white" }}
              >
                {line.name}
              </Chip>
            ))}
          </div>
        );

      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant="light">
                <VerticalDotsIcon />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="edit">Edit</DropdownItem>
              <DropdownItem key="delete" color="danger">
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );

      default:
        return item[columnKey];
    }
  };

  const renderLineCell = (item: Line, columnKey: keyof Line | "actions") => {
    if (columnKey === "actions") {
      return (
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly variant="light">
              <VerticalDotsIcon />
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem key="edit">Edit</DropdownItem>
            <DropdownItem key="delete" color="danger">
              Delete
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      );
    } else if (columnKey === "color") {
      return (
        <Chip
          key={item.id}
          size="sm"
          style={{ backgroundColor: item.color, color: "white" }}
        />
      );
    }

    return item[columnKey];
  };

  const renderProductCell = (
    item: Product,
    columnKey: keyof Product | "actions"
  ) => {
    switch (columnKey) {
      case "thumbnail":
        return (
          <img
            src={item.thumbnail}
            alt={item.name}
            className="w-16 h-10 rounded object-cover"
          />
        );

      case "defaultRateMonth":
        return `₹${item.defaultRateMonth.toLocaleString()}`;

      case "defaultRateDay":
        return `₹${item.defaultRateDay.toLocaleString()}`;

      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant="light">
                <VerticalDotsIcon />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="edit">Edit</DropdownItem>
              <DropdownItem key="delete" color="danger">
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );

      default:
        return item[columnKey];
    }
  };

  const renderSimpleCell = (item: any, columnKey: string) => {
    if (columnKey === "actions") {
      return (
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly variant="light">
              <VerticalDotsIcon />
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem key="edit">Edit</DropdownItem>
            <DropdownItem key="delete" color="danger">
              Delete
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      );
    }

    return item[columnKey];
  };
  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" color="danger" />
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="flex flex-col p-5">
      <h1 className="text-2xl font-semibold">Manage</h1>

      <Tabs variant="underlined">
        {/* ---------------- STATIONS TAB ---------------- */}
        <Tab key="stations" title="Stations">
          <div className="flex justify-between mt-6 mb-4">
            <Input
              isClearable
              className="w-1/3"
              placeholder="Search station..."
              startContent={<SearchIcon />}
              value={stationSearch}
              onValueChange={(v) => {
                setStationSearch(v ?? "");
                setStationPage(1);
              }}
            />

            <Dropdown>
              <DropdownTrigger>
                <Button variant="flat" endContent={<ChevronDownIcon />}>
                  Filter Lines
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                closeOnSelect={false}
                selectionMode="multiple"
                selectedKeys={selectedLines}
                onSelectionChange={(keys) =>
                  setSelectedLines(new Set(keys as Set<string>))
                }
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

          <Table
            isStriped
            bottomContent={
              <Pagination
                page={stationPage}
                total={stationPages}
                onChange={setStationPage}
                showControls
              />
            }
          >
            <TableHeader columns={stationColumns}>
              {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
            </TableHeader>

            <TableBody
              items={paginatedStations}
              emptyContent="No stations found"
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>
                      {renderStationCell(item, columnKey as any)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Tab>

        {/* ---------------- LINES TAB ---------------- */}
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

            <Button
              color="primary"
              endContent={<PlusIcon />}
              onClick={() => setIsAddLineOpen(true)}
            >
              Add Line
            </Button>
          </div>

          <Table
            isStriped
            bottomContent={
              <Pagination
                page={linePage}
                total={linePages}
                onChange={setLinePage}
                showControls
              />
            }
          >
            <TableHeader columns={lineColumns}>
              {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
            </TableHeader>

            <TableBody items={paginatedLines} emptyContent="No lines found">
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>
                      {renderLineCell(item, columnKey as any)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Tab>

        {/* ---------------- PRODUCTS TAB ---------------- */}
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

            <Button
              color="primary"
              endContent={<PlusIcon />}
              onClick={() => setIsAddProductOpen(true)}
            >
              Add Product
            </Button>
          </div>

          <Table
            isStriped
            aria-label="Products Table"
            bottomContent={
              <Pagination
                page={productPage}
                total={productPages}
                onChange={setProductPage}
                showControls
              />
            }
          >
            <TableHeader columns={productColumns}>
              {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
            </TableHeader>

            <TableBody
              items={paginatedProducts}
              emptyContent="No products found"
            >
              {(item: Product) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>
                      {renderProductCell(item, columnKey as any)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Tab>

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

            <Button
              color="primary"
              endContent={<PlusIcon />}
              onClick={() => setIsAddAudienceOpen(true)}
            >
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
                    <TableCell>
                      {renderSimpleCell(item, columnKey as any)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Tab>
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

            <Button
              color="primary"
              endContent={<PlusIcon />}
              onClick={() => setIsAddTypeOpen(true)}
            >
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
              items={filteredTypes.slice(
                (typePage - 1) * rowsPerPage,
                typePage * rowsPerPage
              )}
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderSimpleCell(item, columnKey as any)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Tab>
      </Tabs>

      {isAddLineOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[420px]">
            <h2 className="text-lg font-semibold mb-4">Add New Line</h2>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Line Name *</label>
              <input
                value={newLineName}
                onChange={(e) => setNewLineName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter line name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Color (optional)
              </label>
              <input
                value={newLineColor}
                onChange={(e) => setNewLineColor(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="#00FF00 or green"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="light" onClick={() => setIsAddLineOpen(false)}>
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={addingLine}
                onClick={handleAddLine}
              >
                Add Line
              </Button>
            </div>
          </div>
        </div>
      )}


      {/* ---------------- PRODUCTS MODAL ----------------*/}

      {isAddProductOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[460px]">
            <h2 className="text-lg font-semibold mb-4">Add New Product</h2>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter product name"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Thumbnail URL (optional)
              </label>
              <input
                value={newProductThumbnail}
                onChange={(e) => setNewProductThumbnail(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="https://..."
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Rate / Month (₹)
              </label>
              <input
                type="number"
                value={newProductRateMonth}
                onChange={(e) => setNewProductRateMonth(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="45000"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-1">
                Rate / Day (₹)
              </label>
              <input
                type="number"
                value={newProductRateDay}
                onChange={(e) => setNewProductRateDay(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="1500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="light" onClick={() => setIsAddProductOpen(false)}>
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={addingProduct}
                onClick={handleAddProduct}
              >
                Add Product
              </Button>
            </div>
          </div>
        </div>
      )}


      {/* Station Audience */}

      {isAddAudienceOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[420px]">
            <h2 className="text-lg font-semibold mb-4">Add New Audience</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Audience Name *</label>
              <input
                value={newAudienceName}
                onChange={(e) => setNewAudienceName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. Students, Business, Shoppers"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="light" onClick={() => setIsAddAudienceOpen(false)}>
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={addingAudience}
                onClick={handleAddAudience}
              >
                Add Audience
              </Button>
            </div>
          </div>
        </div>
      )}

      {isAddTypeOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[420px]">
            <h2 className="text-lg font-semibold mb-4">Add New Station Type</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Type Name *</label>
              <input
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. Interchange, Terminal, Underground"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="light" onClick={() => setIsAddTypeOpen(false)}>
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={addingType}
                onClick={handleAddType}
              >
                Add Type
              </Button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
