import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// -------- TYPES --------
type StationPdfProps = {
  station: {
    name: string;
    address?: string | null;
    footfall?: string | null;
    lines?: { line: { name: string; color?: string | null } }[];
    images?: { imageUrl: string | null }[];
  };
  product?: {
    product: {
      name: string;
      defaultRateDay?: number | null;
      defaultRateMonth?: number | null;
    };
    rateDay?: number | null;
    rateMonth?: number | null;
    units?: number | null;
  };
};

// -------- STYLES --------
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "1 solid #eee",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#555",
  },
  section: {
    marginTop: 15,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  value: {
    marginBottom: 8,
  },
  lineTag: {
    padding: 4,
    marginRight: 5,
    marginBottom: 5,
    borderRadius: 3,
    color: "white",
    fontSize: 10,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 200,
    objectFit: "cover",
    borderRadius: 6,
  },
  priceBox: {
    marginTop: 10,
    padding: 10,
    border: "1 solid #ddd",
    borderRadius: 5,
    backgroundColor: "#fafafa",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 10,
    color: "#888",
    borderTop: "1 solid #eee",
    paddingTop: 5,
    textAlign: "center",
  },
});

// -------- COMPONENT --------
export default function StationPdf({ station, product }: StationPdfProps) {
  const rateDay =
    product?.rateDay ??
    product?.product?.defaultRateDay ??
    0;

  const rateMonth =
    product?.rateMonth ??
    product?.product?.defaultRateMonth ??
    rateDay * 30;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Delhi Metro Advertising</Text>
          <Text style={styles.subtitle}>Station Media Kit</Text>
        </View>

        {/* STATION INFO */}
        <View style={styles.section}>
          <Text style={styles.label}>Station Name</Text>
          <Text style={styles.value}>{station.name}</Text>

          {station.address && (
            <>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{station.address}</Text>
            </>
          )}

          {station.footfall && (
            <>
              <Text style={styles.label}>Footfall</Text>
              <Text style={styles.value}>{station.footfall}</Text>
            </>
          )}
        </View>

        {/* LINES */}
        {station.lines && station.lines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Metro Lines</Text>
            <View style={styles.row}>
              {station.lines.map((l, idx) => (
                <Text
                  key={idx}
                  style={{
                    ...styles.lineTag,
                    backgroundColor: l.line.color || "#333",
                  }}
                >
                  {l.line.name}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* PRODUCT */}
        {product && (
          <View style={styles.section}>
            <Text style={styles.label}>Ad Format</Text>
            <Text style={styles.value}>{product.product.name}</Text>

            <View style={styles.priceBox}>
              <Text>Rate per day: ₹{rateDay}</Text>
              <Text>Rate per month: ₹{rateMonth}</Text>
              {product.units && (
                <Text>Total Units Available: {product.units}</Text>
              )}
            </View>
          </View>
        )}

        {/* IMAGE */}
        {station.images?.[0]?.imageUrl && (
          <View style={styles.section}>
            <Text style={styles.label}>Sample Media</Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
              src={station.images[0].imageUrl}
              style={styles.image}
            />
          </View>
        )}

        {/* FOOTER */}
        <Text style={styles.footer}>
          Alaknanda Advertising Pvt. Ltd • Delhi Metro Authorized Media Partner
        </Text>
      </Page>
    </Document>
  );
}
