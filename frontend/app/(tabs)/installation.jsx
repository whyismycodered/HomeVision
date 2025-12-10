import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from 'expo-router';
import { hp, wp } from '../../helpers/common';

const BACKEND_INSTALLMENT_URL = 'http://192.168.68.109:8000/installment-items';
const MONTH_OPTIONS = [6, 12, 18, 24];

export default function InstallmentSimulator() {
  const params = useLocalSearchParams();
  const { items: itemsParam, designId } = params;
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [downPayment, setDownPayment] = useState(5000);
  const [selectedMonths, setSelectedMonths] = useState(12);

  useEffect(() => {
    fetchInstallmentItems();
  }, [designId, itemsParam]);

  const fetchInstallmentItems = async () => {
    try {
      // If items passed via params, parse them
      if (itemsParam) {
        const parsedItems = JSON.parse(itemsParam);
        // Sanitize prices (convert strings like "₱30,000" back to numbers)
        const sanitizedItems = parsedItems.map(item => ({
            ...item,
            price: typeof item.price === 'string' 
                ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
                : item.price
        }));
        setProducts(sanitizedItems);
        setLoading(false);
        return;
      }

      // Otherwise fetch from backend
      if (!designId) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_INSTALLMENT_URL}/${designId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch installment items');
      }

      const data = await response.json();
      
      // Expected format: { items: [{ id, name, price, image, specs?, description? }] }
      setProducts(data.items || []);
      
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load items');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const allItemsTotal = products.reduce((sum, p) => sum + p.price, 0);

  const calculateMonthly = (price, months = selectedMonths) => {
    const remaining = price - downPayment;
    return remaining > 0 ? Math.ceil(remaining / months) : 0;
  };

  const selectedProductData = selectedProduct 
    ? products.find(p => p.id === selectedProduct)
    : null;

  const handleProductClick = (productId) => {
    setSelectedProduct(productId);
  };

  const handleAllItemsClick = () => {
    setSelectedProduct(null);
  };

  const handleApply = async () => {
    const itemsToApply = showAllItemsPackage ? products : [selectedProductData];
    
    try {
      const response = await fetch(`${BACKEND_INSTALLMENT_URL}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designId,
          items: itemsToApply,
          downPayment,
          installmentMonths: selectedMonths,
          totalAmount: currentPrice,
          monthlyPayment: calculateMonthly(currentPrice),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      Alert.alert('Success!', 'Your installment application has been submitted!');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit application');
    }
  };

  // Determine what to show based on selection
  const showAllItemsPackage = selectedProduct === null;
  const currentPrice = showAllItemsPackage ? allItemsTotal : selectedProductData?.price || 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E31E24" />
          <Text style={styles.loadingText}>Loading installment options...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={hp(12)} color="#ccc" />
          <Text style={styles.emptyTitle}>No Items Available</Text>
          <Text style={styles.emptySubtitle}>
            No items found for installment calculation
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Section Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>HomeVision</Text>
        </View>

        {/* Horizontal Product Scroll */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.productScroll}
          contentContainerStyle={styles.productScrollContent}
        >
          {/* All Items Card */}
          {products.length > 1 && (
            <TouchableOpacity
              onPress={handleAllItemsClick}
              style={[
                styles.productCard,
                selectedProduct === null && styles.productCardSelected
              ]}
            >
              <View style={styles.productImageContainer}>
                <View style={styles.allItemsBadge}>
                  <Ionicons name="cart" size={hp(2.5)} color="#fff" />
                  <Text style={styles.allItemsText}>ALL</Text>
                </View>
                <View style={styles.allItemsImageContainer}>
                  <Ionicons name="apps" size={hp(12)} color="#E31E24" />
                </View>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  Complete Package Deal
                </Text>
                <Text style={styles.asLowAs}>as low as</Text>
                <Text style={styles.productPrice}>
                  ₱{calculateMonthly(allItemsTotal).toLocaleString()} x {selectedMonths}months
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Individual Products */}
          {products.map((product, index) => (
            <TouchableOpacity
              key={product.id || index}
              onPress={() => handleProductClick(product.id)}
              style={[
                styles.productCard,
                selectedProduct === product.id && styles.productCardSelected
              ]}
            >
              <View style={styles.productImageContainer}>
                {product.hot && (
                  <View style={styles.hotBadge}>
                    <Ionicons name="flame" size={hp(2)} color="#fff" />
                    <Text style={styles.hotText}>Hot</Text>
                  </View>
                )}
                <Image source={{ uri: product.image }} style={styles.productImage} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.asLowAs}>as low as</Text>
                <Text style={styles.productPrice}>
                  ₱{calculateMonthly(product.price).toLocaleString()} x {selectedMonths}months
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Installment Simulator Card */}
        <View style={styles.packageCard}>
          <View style={styles.packageHeader}>
            <View style={styles.packageIconContainer}>
              <Ionicons 
                name={showAllItemsPackage ? "cart" : "cube"} 
                size={hp(3)} 
                color="#E31E24" 
              />
            </View>
            <View style={styles.packageHeaderText}>
              <Text style={styles.packageTitle}>
                {showAllItemsPackage ? "Complete Package Deal" : selectedProductData?.name}
              </Text>
              <Text style={styles.packageSubtitle}>
                {showAllItemsPackage 
                  ? `All ${products.length} items • Best value` 
                  : "Individual item"}
              </Text>
            </View>
          </View>

          {/* Product Details (Only for Individual Items) */}
          {!showAllItemsPackage && selectedProductData && (
            <>
              <Image 
                source={{ uri: selectedProductData.image }} 
                style={styles.detailImage}
              />
              
              <Text style={styles.detailDescription}>{selectedProductData.description}</Text>

              {/* Specifications */}
              {selectedProductData.specs && (
                <View style={styles.specsContainer}>
                  <Text style={styles.specsTitle}>Specifications</Text>
                  {Object.entries(selectedProductData.specs).map(([key, value]) => (
                    <View key={key} style={styles.specRow}>
                      <Text style={styles.specKey}>{key}:</Text>
                      <Text style={styles.specValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          <View style={[
            styles.packagePriceContainer,
            !showAllItemsPackage && styles.individualPriceContainer
          ]}>
            <Text style={styles.packagePriceLabel}>
              {showAllItemsPackage ? "Total Package Price" : "Item Price"}
            </Text>
            <Text style={[
              styles.packageTotalPrice,
              !showAllItemsPackage && styles.individualTotalPrice
            ]}>
              ₱{currentPrice.toLocaleString()}
            </Text>
            <Text style={styles.packageMonthlyPrice}>
              ₱{calculateMonthly(currentPrice).toLocaleString()}/month for {selectedMonths} months
            </Text>
          </View>

          {/* Down Payment Control */}
          <View style={styles.downPaymentSection}>
            <Text style={styles.sectionLabel}>Down Payment</Text>
            <View style={styles.downPaymentControl}>
              <TouchableOpacity
                onPress={() => setDownPayment(Math.max(0, downPayment - 500))}
                style={styles.controlButton}
              >
                <Ionicons name="remove" size={hp(3)} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.downPaymentAmount}>₱{downPayment.toLocaleString()}</Text>
              <TouchableOpacity
                onPress={() => setDownPayment(downPayment + 500)}
                style={styles.controlButton}
              >
                <Ionicons name="add" size={hp(3)} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Breakdown */}
          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                {showAllItemsPackage ? "Package Total:" : "Item Price:"}
              </Text>
              <Text style={styles.breakdownValue}>₱{currentPrice.toLocaleString()}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Down Payment:</Text>
              <Text style={styles.breakdownValue}>-₱{downPayment.toLocaleString()}</Text>
            </View>
            <View style={[styles.breakdownRow, styles.breakdownTotal]}>
              <Text style={styles.breakdownTotalLabel}>Amount to Finance:</Text>
              <Text style={styles.breakdownTotalValue}>
                ₱{(currentPrice - downPayment).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Term Selection */}
          <View style={styles.termSection}>
            <Text style={styles.sectionLabel}>Select Installment Plan</Text>
            <View style={styles.termGrid}>
              {MONTH_OPTIONS.map((months) => {
                const monthly = calculateMonthly(currentPrice, months);
                return (
                  <TouchableOpacity
                    key={months}
                    onPress={() => setSelectedMonths(months)}
                    style={[
                      styles.termButton,
                      selectedMonths === months && styles.termButtonActive
                    ]}
                  >
                    <Text style={styles.termMonths}>{months}</Text>
                    <Text style={styles.termMonthsLabel}>months</Text>
                    <Text style={styles.termMonthlyPrice}>₱{monthly.toLocaleString()}/mo</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>
              {showAllItemsPackage ? "Apply for Complete Package" : "Apply for This Item"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: wp(4),
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(10),
  },
  emptyTitle: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    color: "#333",
    marginTop: hp(2),
  },
  emptySubtitle: {
    fontSize: hp(1.8),
    color: "#666",
    textAlign: 'center',
    marginTop: hp(1),
  },
  scrollView: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2.5),
    paddingBottom: hp(2),
  },
  mainTitle: {
    fontSize: hp(3.5),
    fontWeight: "bold",
    color: "#333",
  },
  productScroll: {
    marginBottom: hp(2.5),
  },
  productScrollContent: {
    paddingHorizontal: wp(5),
    gap: wp(4),
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: wp(3),
    width: wp(70),
    marginRight: wp(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productCardSelected: {
    borderWidth: 3,
    borderColor: "#E31E24",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  productImageContainer: {
    position: "relative",
  },
  hotBadge: {
    position: "absolute",
    top: hp(1.5),
    left: wp(3),
    backgroundColor: "#E31E24",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: wp(5),
    gap: wp(1),
    zIndex: 10,
  },
  hotText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: hp(1.5),
  },
  allItemsBadge: {
    position: "absolute",
    top: hp(1.5),
    left: wp(3),
    backgroundColor: "#E31E24",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: wp(5),
    gap: wp(1),
    zIndex: 10,
  },
  allItemsText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: hp(1.5),
  },
  allItemsImageContainer: {
    width: "100%",
    height: hp(28),
    backgroundColor: "#FFE5E5",
    borderTopLeftRadius: wp(3),
    borderTopRightRadius: wp(3),
    alignItems: "center",
    justifyContent: "center",
  },
  productImage: {
    width: "100%",
    height: hp(28),
    borderTopLeftRadius: wp(3),
    borderTopRightRadius: wp(3),
  },
  productInfo: {
    padding: wp(4),
  },
  productName: {
    fontWeight: "600",
    fontSize: hp(1.9),
    color: "#333",
    marginBottom: hp(1),
    height: hp(5),
  },
  asLowAs: {
    fontSize: hp(1.5),
    color: "#666",
    marginBottom: hp(0.5),
  },
  productPrice: {
    fontSize: hp(2.4),
    fontWeight: "bold",
    color: "#2563eb",
  },
  packageCard: {
    backgroundColor: "#fff",
    marginHorizontal: wp(5),
    marginBottom: hp(4),
    borderRadius: wp(4),
    padding: wp(5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  packageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2.5),
    gap: wp(3),
  },
  packageIconContainer: {
    width: wp(12),
    height: wp(12),
    backgroundColor: "#FFE5E5",
    borderRadius: wp(6),
    alignItems: "center",
    justifyContent: "center",
  },
  packageHeaderText: {
    flex: 1,
  },
  packageTitle: {
    fontSize: hp(2.4),
    fontWeight: "bold",
    color: "#333",
  },
  packageSubtitle: {
    fontSize: hp(1.6),
    color: "#666",
    marginTop: hp(0.3),
  },
  detailImage: {
    width: "100%",
    height: hp(35),
    borderRadius: wp(3),
    marginBottom: hp(2),
  },
  detailDescription: {
    fontSize: hp(1.7),
    color: "#666",
    lineHeight: hp(2.5),
    marginBottom: hp(2),
  },
  specsContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2.5),
  },
  specsTitle: {
    fontSize: hp(1.9),
    fontWeight: "600",
    color: "#333",
    marginBottom: hp(1.5),
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  specKey: {
    fontSize: hp(1.6),
    color: "#666",
    textTransform: "capitalize",
  },
  specValue: {
    fontSize: hp(1.6),
    fontWeight: "600",
    color: "#333",
  },
  packagePriceContainer: {
    backgroundColor: "#FFE5E5",
    borderRadius: wp(3),
    padding: wp(5),
    marginBottom: hp(2.5),
  },
  individualPriceContainer: {
    backgroundColor: "#E3F2FD",
  },
  packagePriceLabel: {
    fontSize: hp(1.5),
    color: "#666",
    marginBottom: hp(0.5),
  },
  packageTotalPrice: {
    fontSize: hp(4.5),
    fontWeight: "bold",
    color: "#E31E24",
    marginBottom: hp(1),
  },
  individualTotalPrice: {
    color: "#2563eb",
  },
  packageMonthlyPrice: {
    fontSize: hp(2.2),
    fontWeight: "bold",
    color: "#333",
  },
  downPaymentSection: {
    marginBottom: hp(2.5),
  },
  sectionLabel: {
    fontSize: hp(1.8),
    fontWeight: "600",
    color: "#333",
    marginBottom: hp(1.5),
  },
  downPaymentControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    borderRadius: wp(3),
    padding: wp(4),
  },
  controlButton: {
    width: wp(10),
    height: wp(10),
    backgroundColor: "#E31E24",
    borderRadius: wp(5),
    alignItems: "center",
    justifyContent: "center",
  },
  downPaymentAmount: {
    fontSize: hp(3),
    fontWeight: "bold",
    color: "#333",
  },
  breakdownContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2.5),
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: hp(0.8),
  },
  breakdownLabel: {
    fontSize: hp(1.6),
    color: "#666",
  },
  breakdownValue: {
    fontSize: hp(1.6),
    fontWeight: "600",
    color: "#333",
  },
  breakdownTotal: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    marginTop: hp(1),
    paddingTop: hp(1.5),
  },
  breakdownTotalLabel: {
    fontSize: hp(1.8),
    fontWeight: "bold",
    color: "#333",
  },
  breakdownTotalValue: {
    fontSize: hp(1.8),
    fontWeight: "bold",
    color: "#333",
  },
  termSection: {
    marginBottom: hp(2.5),
  },
  termGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(3),
  },
  termButton: {
    width: "48%",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: wp(3),
    padding: wp(3),
    alignItems: "center",
  },
  termButtonActive: {
    backgroundColor: "#FFE5E5",
    borderColor: "#E31E24",
  },
  termMonths: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: "#333",
  },
  termMonthsLabel: {
    fontSize: hp(1.3),
    color: "#666",
    marginBottom: hp(0.5),
  },
  termMonthlyPrice: {
    fontSize: hp(1.7),
    fontWeight: "bold",
    color: "#E31E24",
  },
  applyButton: {
    backgroundColor: "#E31E24",
    padding: wp(4.5),
    borderRadius: wp(3),
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: hp(2),
  },
});