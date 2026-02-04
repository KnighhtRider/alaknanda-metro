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

  /* -------- AUDIENCES STATE -------- */
  const [audiences, setAudiences] = useState<any[]>([]);
  const [audienceSearch, setAudienceSearch] = useState("");
  const [audiencePage, setAudiencePage] = useState(1);

  /* -------- TYPES STATE -------- */
  const [types, setTypes] = useState<any[]>([]);
  const [typeSearch, setTypeSearch] = useState("");
  const [typePage, setTypePage] = useState(1);

  /* -------- PRODUCTS STATE -------- */
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(1);

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

            <Link href="/cms/addLines">
              <Button color="primary" endContent={<PlusIcon />}>
                Add Line
              </Button>
            </Link>
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

            <Link href="/cms/addProduct">
              <Button color="primary" endContent={<PlusIcon />}>
                Add Product
              </Button>
            </Link>
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

            <Link href="/cms/addAudience">
              <Button color="primary" endContent={<PlusIcon />}>
                Add Audience
              </Button>
            </Link>
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

            <Link href="/cms/addType">
              <Button color="primary" endContent={<PlusIcon />}>
                Add Type
              </Button>
            </Link>
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
    </div>
  );
}
