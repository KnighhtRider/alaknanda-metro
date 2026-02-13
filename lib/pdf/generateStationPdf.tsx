import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 12 },
  heading: { fontSize: 18, marginBottom: 10 },
  section: { marginBottom: 8 },
  image: { width: "100%", height: 200, objectFit: "cover", marginTop: 10 },
});

export const StationPdf = ({ station, product }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.heading}>Delhi Metro Advertising</Text>

      <View style={styles.section}>
        <Text>Station: {station.name}</Text>
        <Text>Address: {station.address}</Text>
        <Text>Footfall: {station.footfall}</Text>
        <Text>Lines: {station.lines?.join(", ")}</Text>
      </View>

      <View style={styles.section}>
        <Text>Ad Format: {product.name}</Text>
        <Text>Rate/Day: ₹{product.rateDay || product.defaultRateDay}</Text>
        <Text>
          Rate/Month: ₹
          {(product.rateMonth ||
            (product.rateDay || product.defaultRateDay) * 30)}
        </Text>
      </View>

      {product.thumbnail && (
        <Image src={product.thumbnail} style={styles.image} />
      )}
    </Page>
  </Document>
);
