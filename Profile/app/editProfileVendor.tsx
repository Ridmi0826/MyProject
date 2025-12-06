import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { auth, db, storage } from '../firebaseconfig';

export default function EditProfileVendor() {
  const router = useRouter();
  const user = auth.currentUser;
  const uid = user?.uid;

  const [imageUri, setImageUri] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImageAsync = async (uri: string) => {
    if (!uid) throw new Error('User not authenticated');
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `profilePics/${uid}-${uuidv4()}`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const [data, setData] = useState({
    fullName: '',
    email: '',
    farmName: '',
    experience: '',
    location: '',
    category: '',
    products: '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, 'users', uid)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setData({
          fullName: d.fullName || '',
          email: d.email || user?.email || '',
          farmName: d.farmName || '',
          experience: d.experience || '',
          location: d.location || '',
          category: d.category || '',
          products: Array.isArray(d.products) ? d.products.join(', ') : (d.products || ''),
        });
        if (d.photoURL) setImageUri(d.photoURL);
      }
    });
  }, [uid]);

  const saveChanges = async () => {
    
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      let photoURL = '';
      if (imageUri && !imageUri.startsWith('https://')) {
        setUploading(true);
        photoURL = await uploadImageAsync(imageUri);
        setUploading(false);
      }

      await updateDoc(doc(db, 'users', uid!), {
        farmName: data.farmName,
        experience: data.experience,
        location: data.location,
        category: data.category,
        products: data.products
          ? data.products.split(',').map((p) => p.trim()).filter(Boolean)
          : [],
        ...(photoURL && { photoURL }),
      });

      if (newPassword.trim().length > 0) {
        await updatePassword(user!, newPassword);
      }

      Alert.alert('Profile Updated');
      router.replace('/VendorProfile');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Vendor Profile</Text>

      {/*Centered Circular Image Uploader */}
      <View style={styles.imageWrapper}>
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.profileImage} />
          ) : (
            <Text style={styles.imageText}>Upload Profile Picture</Text>
          )}
        </TouchableOpacity>
      </View>

      <TextInput style={styles.input} placeholder="Full Name" value={data.fullName} editable={false} />
      <TextInput style={styles.input} placeholder="Email" value={data.email} editable={false} />

      <TextInput
        style={styles.input}
        placeholder="Farm Name"
        value={data.farmName}
        onChangeText={(t) => setData({ ...data, farmName: t })}
      />
      <TextInput
        style={styles.input}
        placeholder="Experience (e.g. 15 years)"
        value={data.experience}
        onChangeText={(t) => setData({ ...data, experience: t })}
      />
      <TextInput
        style={styles.input}
        placeholder="Farm Location"
        value={data.location}
        onChangeText={(t) => setData({ ...data, location: t })}
      />

      {/*Styled Dropdown */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={data.category}
          onValueChange={(value) => setData({ ...data, category: value })}
        >
          <Picker.Item label="Select Category" value="" />
          <Picker.Item label="Vegetables" value="Vegetables" />
          <Picker.Item label="Fruits" value="Fruits" />
          <Picker.Item label="Surplus" value="Surplus" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Available Products (comma separated)"
        value={data.products}
        onChangeText={(t) => setData({ ...data, products: t })}
      />

      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={saveChanges} disabled={uploading}>
        <Text style={styles.saveText}>{uploading ? 'Uploading...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },

  
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
    width: 120,
    height: 120,
    borderRadius: 60, 
    overflow: 'hidden',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imageText: { color: '#555', fontSize: 14, textAlign: 'center' },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    padding: 12,
    overflow: 'hidden',
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveText: { color: '#fff', fontWeight: 'bold' },
});
