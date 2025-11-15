import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../firebaseconfig";

export default function VendorProfile() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [vendorData, setVendorData] = useState({
    fullName: "",
    email: "",
    farmName: "",
    experience: "",
    location: "",
    category: "",
    photoURL: "",
  });

  const toggleSwitch = () => setIsEnabled((prev) => !prev);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    getDoc(doc(db, "users", uid)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.role === "vendor") {
          setVendorData({
            fullName: data.fullName || "",
            email: data.email || "",
            farmName: data.farmName || "",
            experience: data.experience || "",
            location: data.location || "",
            category: data.category || "",
            photoURL: data.photoURL || "",
          });
        }
      }
    });
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        {/* ✅ Show uploaded profile picture if available */}
        {vendorData.photoURL ? (
          <Image source={{ uri: vendorData.photoURL }} style={styles.avatar} />
        ) : (
          <Image source={require("../assets/profile.png")} style={styles.avatar} />
        )}

        <Text style={styles.name}>{vendorData.fullName}</Text>
        <Text style={styles.verified}>Verified Vendor</Text>
        <Text style={styles.rating}>4.8</Text>

        <View style={styles.starsContainer}>
          <Ionicons name="star" size={20} color="#f4c10f" />
          <Ionicons name="star-outline" size={20} color="#ccc" />
          <Ionicons name="star-outline" size={20} color="#ccc" />
          <Ionicons name="star-outline" size={20} color="#ccc" />
          <Ionicons name="star-outline" size={20} color="#ccc" />
        </View>
        <Text style={styles.reviews}>120 reviews</Text>

        <View style={styles.buttonContainer}>
          <Link href="/editProfileVendor" asChild>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editText}>Edit Profile</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/addNewProduct" asChild>
            <TouchableOpacity style={styles.listBtn}>
              <Text style={styles.listText}>View my listings</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* ✅ Basic Information pulled from Firestore */}
      <View style={styles.infoBox}>
        <Text style={styles.infoHeader}>Basic Information</Text>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={18} color="#555" />
          <Text style={styles.infoText}>{vendorData.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="category" size={18} color="#555" />
          <Text style={styles.infoText}>{vendorData.category || "Not specified"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color="#555" />
          <Text style={styles.infoText}>{vendorData.location || "Not specified"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color="#555" />
          <Text style={styles.infoText}>{vendorData.experience || "Not specified"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="home-outline" size={18} color="#555" />
          <Text style={styles.infoText}>{vendorData.farmName || "Not specified"}</Text>
        </View>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Notifications</Text>
        <Switch value={isEnabled} onValueChange={toggleSwitch} />
      </View>

      {/* <TouchableOpacity style={styles.logoutBtn}>
        <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 20 },
  profileHeader: { alignItems: "center", marginTop: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: "bold" },
  verified: { color: "green", fontWeight: "600", marginBottom: 5 },
  rating: { fontSize: 28, fontWeight: "bold", marginBottom: 5 },
  starsContainer: { flexDirection: "row", marginVertical: 5 },
  reviews: { color: "#777", marginBottom: 10 },
  buttonContainer: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  editBtn: {
    backgroundColor: "#ddd",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  listBtn: {
    backgroundColor: "#00b140",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  editText: { color: "#333", fontWeight: "500" },
  listText: { color: "#fff", fontWeight: "500" },
  infoBox: {
    backgroundColor: "#efececff",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    elevation: 2,
  },
  infoHeader: { fontWeight: "bold", fontSize: 16, marginBottom: 10 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  infoText: { marginLeft: 8, color: "#555" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#efececff",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  switchText: { fontSize: 16, fontWeight: "500" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    marginTop: 25,
    backgroundColor: "#fff",
  },
  logoutText: { marginLeft: 6, color: "#e74c3c", fontWeight: "bold", fontSize: 16 },
});

